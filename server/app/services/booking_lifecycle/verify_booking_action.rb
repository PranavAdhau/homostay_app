module BookingLifecycle
  class VerifyBookingAction
    attr_reader :booking, :action_name, :error_message, :status

    def initialize(booking, action_name:)
      @booking = booking
      @action_name = action_name.to_s
      @status = :unprocessable_entity
    end

    def call
      return invalid_action_failure unless valid_action?
      return status_failure unless allowed_current_status?

      homestay = booking.homestay
      BookingAvailability::HoldManager.expire_for_homestay!(homestay)

      if homestay.calendar_sync_enabled? && !refresh_availability!(homestay)
        @error_message ||= "We couldn’t refresh availability right now. Please try again."
        return false
      end

      return true unless approve_action?

      homestay.with_lock do
        booking.lock!
        BookingAvailability::HoldManager.expire_for_homestay!(homestay)

        if overlap?(homestay)
          @error_message = "Another reservation was detected during confirmation."
          @status = :conflict
          return false
        end
      end

      true
    rescue CalendarSync::SyncUnavailableError
      @status = :service_unavailable
      @error_message ||= "We couldn’t refresh availability right now. Please try again."
      false
    end

    private

    def valid_action?
      %w[approve reject].include?(action_name)
    end

    def approve_action?
      action_name == "approve"
    end

    def allowed_current_status?
      return booking.pending? if approve_action?

      booking.pending? || booking.approved?
    end

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

      sync_triggered = CalendarSync::SyncHomestay.call(homestay, trigger: "booking_#{action_name}_preflight", fail_silently: true)
      return true if sync_triggered
      return true if CalendarSync::FreshnessPolicy.fresh?(homestay)

      @status = :service_unavailable
      false
    end

    def invalid_action_failure
      @error_message = "Unsupported booking action."
      false
    end

    def status_failure
      @error_message = approve_action? ? "This booking is no longer pending." : "This booking can no longer be rejected."
      false
    end
  end
end
