module CalendarSync
  class EnqueueDueHomestays
    MAX_HOMESTAYS_PER_RUN = 50

    def self.call
      Rails.logger.info(
        event: "calendar_sync.cron_triggered",
        service: "enqueue_due_homestays"
      )
      new.call
    end

    def call
      started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      lock_key = FreshnessPolicy.cron_lock_key
      lock_result = Infrastructure::RedisLock.acquire(key: lock_key, ttl: FreshnessPolicy::CRON_LOCK_TTL)

      unless lock_result.acquired?
        Observability::StructuredLogger.info(
          event: "calendar_sync.enqueue.skipped",
          source: "cron",
          lock_result: "duplicate"
        )
        return 0
      end

      homestays = Homestay.where(calendar_sync_enabled: true)
                          .where.not(airbnb_ical_url: [nil, ""])
                          .order(Arel.sql("last_calendar_sync_at NULLS FIRST"))
                          .limit(MAX_HOMESTAYS_PER_RUN)

      homestays.each do |homestay|
        CalendarSyncJob.perform_later(homestay.id, trigger: "cron")
      end

      Observability::StructuredLogger.info(
        event: "calendar_sync.enqueue.completed",
        source: "cron",
        lock_result: "acquired",
        homestay_count: homestays.size,
        duration_ms: elapsed_ms(started_at)
      )

      homestays.size
    rescue Redis::BaseError, IOError, SystemCallError => e
      Observability::StructuredLogger.error(
        event: "calendar_sync.enqueue.failed",
        source: "cron",
        error_class: e.class.name,
        duration_ms: elapsed_ms(started_at)
      )
      0
    ensure
      Infrastructure::RedisLock.release(key: lock_key, token: lock_result&.token)
    end

    private

    def elapsed_ms(started_at)
      ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at) * 1000).round
    end
  end
end
