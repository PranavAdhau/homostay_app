module CalendarSync
  class SyncHomestay
    class SyncUnavailableError < StandardError; end

    def self.call(homestay, trigger: "manual", fail_silently: false)
      new(homestay, trigger: trigger, fail_silently: fail_silently).call
    end

    def initialize(homestay, trigger:, fail_silently:)
      @homestay = homestay
      @trigger = trigger
      @fail_silently = fail_silently
    end

    def call
      started_at = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      lock_key = FreshnessPolicy.sync_lock_key(homestay.id)
      lock_result = Infrastructure::RedisLock.acquire(key: lock_key, ttl: FreshnessPolicy::SYNC_LOCK_TTL)

      unless lock_result.acquired?
        Observability::StructuredLogger.info(
          event: "calendar_sync.skipped",
          homestay_id: homestay.id,
          source: "airbnb",
          sync_state: "in_progress",
          lock_result: "duplicate",
          trigger: trigger
        )
        return false
      end

      Observability::StructuredLogger.info(
        event: "calendar_sync.started",
        homestay_id: homestay.id,
        source: "airbnb",
        sync_state: "started",
        lock_result: "acquired",
        trigger: trigger
      )

      ics_body = FetchIcs.call(homestay.airbnb_ical_url)
      events = ParseIcs.call(ics_body)
      seen_uids = []

      ExternalCalendarBlock.transaction do
        events.each do |event|
          UpsertBookingFromEvent.call(homestay, event)
          seen_uids << event[:uid]
        end

        handle_deletions(seen_uids)
        ExternalBlockReconciler.call(homestay)
      end

      homestay.update!(
        last_calendar_sync_at: Time.current,
        last_calendar_sync_success_at: Time.current,
        sync_error_count: 0,
        last_calendar_sync_error: nil
      )

      Observability::StructuredLogger.info(
        event: "calendar_sync.completed",
        homestay_id: homestay.id,
        source: "airbnb",
        sync_state: "healthy",
        duration_ms: elapsed_ms(started_at),
        event_count: seen_uids.size,
        trigger: trigger
      )
      true
    rescue StandardError => e
      homestay.with_lock do
        homestay.sync_error_count += 1
        homestay.last_calendar_sync_at = Time.current
        homestay.last_calendar_sync_error = user_safe_error_message(e)
        homestay.save!
      end

      Observability::StructuredLogger.error(
        event: "calendar_sync.failed",
        homestay_id: homestay.id,
        source: "airbnb",
        sync_state: "error",
        duration_ms: elapsed_ms(started_at),
        error_class: e.class.name,
        trigger: trigger
      )

      raise SyncUnavailableError, user_safe_error_message(e) unless fail_silently

      false
    ensure
      Infrastructure::RedisLock.release(key: lock_key, token: lock_result&.token)
    end

    private

    attr_reader :homestay, :trigger, :fail_silently

    def handle_deletions(seen_uids)
      stale_blocks = homestay.external_calendar_blocks
                             .for_source("airbnb")
                             .future_or_current
                             .where.not(external_uid: seen_uids)

      removed_count = stale_blocks.count
      stale_blocks.delete_all

      Observability::StructuredLogger.info(
        event: "calendar_sync.stale_blocks_removed",
        homestay_id: homestay.id,
        source: "airbnb",
        removed_count: removed_count
      )
    end

    def user_safe_error_message(error)
      case error
      when FetchIcs::InvalidUrlError
        "Airbnb calendar URL is invalid"
      when FetchIcs::TimeoutError
        "Sync timed out. Please retry."
      when FetchIcs::ResponseTooLargeError
        "Airbnb calendar response was too large"
      when ParseIcs::Error
        "Airbnb calendar data could not be read"
      else
        "Unable to fetch Airbnb calendar"
      end
    end

    def elapsed_ms(started_at)
      ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - started_at) * 1000).round
    end
  end
end
