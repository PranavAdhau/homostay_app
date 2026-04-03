module CalendarSync
  class SyncHomestay
    def self.call(homestay)
      new(homestay).call
    end

    def initialize(homestay)
      @homestay = homestay
    end

    def call
      ics_body = FetchIcs.call(homestay.airbnb_ical_url)
      events = ParseIcs.call(ics_body)

      seen_uids = []

      events.each do |event|
        UpsertBookingFromEvent.call(homestay, event)
        seen_uids << event[:uid]
      end

      handle_deletions(seen_uids)

      homestay.update!(
        last_calendar_sync_at: Time.current,
        last_calendar_sync_success_at: Time.current,
        sync_error_count: 0,
        last_calendar_sync_error: nil
      )
    rescue StandardError => e
      homestay.with_lock do
        homestay.sync_error_count += 1
        homestay.last_calendar_sync_at = Time.current
        homestay.last_calendar_sync_error = e.message
        if homestay.sync_error_count >= 5
          homestay.calendar_sync_enabled = false
        end
        homestay.save!
      end
    end

    private

    attr_reader :homestay

    def handle_deletions(seen_uids)
      tomorrow = Date.current + 1.day

      stale_bookings = homestay.bookings
                               .where(source: :airbnb)
                               .where("check_in_date >= ?", tomorrow)
                               .where.not(external_event_id: seen_uids)

      stale_bookings.find_each do |booking|
        Booking.transaction do
          booking.lock!
          booking.update!(status: :rejected)
          booking.release_availability_slots
        end
      end
    end
  end
end

