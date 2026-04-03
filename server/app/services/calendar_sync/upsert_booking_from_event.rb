module CalendarSync
  class UpsertBookingFromEvent
    def self.call(homestay, event)
      new(homestay, event).call
    end

    def initialize(homestay, event)
      @homestay = homestay
      @event = event
    end

    def call
      start_date = event[:start_time].to_date
      end_date   = event[:end_time].to_date

      tomorrow = Date.current + 1.day
      return if start_date < tomorrow

      Booking.transaction do
        booking = Booking.lock.where(
          homestay_id: homestay.id,
          source: Booking.sources[:airbnb],
          external_event_id: event[:uid]
        ).first_or_initialize

        booking.source = :airbnb
        booking.check_in_date = start_date
        booking.check_out_date = end_date

        booking.status = :confirmed
        booking.external_last_seen_at = Time.current

        booking.save!

        SlotReconciler.call(booking)
      end
    end

    private

    attr_reader :homestay, :event
  end
end

