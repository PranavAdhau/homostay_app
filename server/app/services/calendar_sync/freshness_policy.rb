module CalendarSync
  class FreshnessPolicy
    FRESH_FOR_SECONDS = ENV.fetch("CALENDAR_SYNC_FRESH_FOR_SECONDS", 120).to_i
    SYNC_LOCK_TTL = ENV.fetch("CALENDAR_SYNC_HOMESTAY_LOCK_TTL", 180).to_i
    CRON_LOCK_TTL = ENV.fetch("CALENDAR_SYNC_CRON_LOCK_TTL", 240).to_i

    class << self
      def fresh?(homestay)
        homestay.last_calendar_sync_success_at.present? &&
          homestay.last_calendar_sync_success_at >= FRESH_FOR_SECONDS.seconds.ago
      end

      def stale?(homestay)
        homestay.calendar_sync_enabled? && !fresh?(homestay)
      end

      def sync_lock_key(homestay_id)
        "calendar_sync:homestay:#{homestay_id}"
      end

      def cron_lock_key(bucket = Time.current.utc.strftime("%Y%m%d%H%M"))
        "calendar_sync:cron:#{bucket}"
      end
    end
  end
end
