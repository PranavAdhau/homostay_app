module BookingLifecycle
  class ApproveBooking
    attr_reader :booking, :error_message, :status

    def initialize(booking)
      @booking = booking
      @status = :unprocessable_entity
    end

    def call
      return pending_failure unless booking.pending?

      homestay = booking.homestay
      BookingAvailability::HoldManager.expire_for_homestay!(homestay)

      if homestay.calendar_sync_enabled? && !refresh_availability!(homestay)
        @error_message ||= "We couldn’t refresh availability right now. Please try again."
        return false
      end

      approved = false

      Booking.transaction do
        homestay.lock!
        booking.lock!
        BookingAvailability::HoldManager.expire_for_homestay!(homestay)

        if overlap?(homestay)
          @error_message = "Another reservation was detected during confirmation."
          @status = :conflict
          raise ActiveRecord::Rollback
        end

        booking.update!(status: :approved)
        CalendarSync::SlotReconciler.call(booking)
        BookingAvailability::HoldManager.release_for_booking!(booking)
        approved = true
      end

      if approved
        Observability::StructuredLogger.info(
          event: "booking.approved",
          booking_id: booking.id,
          homestay_id: homestay.id,
          source: booking.source
        )
      end

      approved
    rescue ActiveRecord::RecordInvalid
      @error_message ||= "Unable to approve this booking right now. Please try again."
      false
    end

    private

    def overlap?(homestay)
      BookingAvailability::OverlapChecker.new(
        homestay: homestay,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        booking_to_ignore: booking,
        hold_to_ignore: booking.reservation_hold
      ).conflict?
    end

    def refresh_availability!(homestay)
      return true unless CalendarSync::FreshnessPolicy.stale?(homestay)

      sync_triggered = CalendarSync::SyncHomestay.call(homestay, trigger: "booking_approval", fail_silently: true)
      return true if sync_triggered
      return true if CalendarSync::FreshnessPolicy.fresh?(homestay)

      @status = :service_unavailable
      false
    rescue CalendarSync::SyncUnavailableError
      @status = :service_unavailable
      false
    end

    def pending_failure
      @error_message = "This booking is no longer pending."
      @status = :unprocessable_entity
      false
    end
  end
end
