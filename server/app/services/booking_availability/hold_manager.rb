require "securerandom"

module BookingAvailability
  class HoldManager
    class << self
      def expire_for_homestay!(homestay)
        expired_count = expired_scope_for(homestay).update_all(released_at: Time.current, updated_at: Time.current)
        return if expired_count.zero?

        Observability::StructuredLogger.info(
          event: "reservation_hold.expired",
          homestay_id: homestay.id,
          released_count: expired_count
        )
      end

      def create_for_booking!(booking)
        hold = booking.create_reservation_hold!(
          homestay: booking.homestay,
          check_in_date: booking.check_in_date,
          check_out_date: booking.check_out_date,
          expires_at: Time.current + ReservationHold::HOLD_DURATION,
          token: SecureRandom.uuid
        )

        Observability::StructuredLogger.info(
          event: "reservation_hold.created",
          homestay_id: booking.homestay_id,
          booking_id: booking.id
        )

        hold
      end

      def release_for_booking!(booking)
        return unless booking.reservation_hold&.active?

        booking.reservation_hold.release!
        Observability::StructuredLogger.info(
          event: "reservation_hold.released",
          homestay_id: booking.homestay_id,
          booking_id: booking.id
        )
      end

      private

      def expired_scope_for(homestay)
        homestay.reservation_holds.expired.where(released_at: nil)
      end
    end
  end
end
