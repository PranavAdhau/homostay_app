module BookingLifecycle
  class CreatePendingBooking
    attr_reader :booking, :error_message, :status

    def initialize(attributes)
      @attributes = attributes
      @status = :unprocessable_entity
    end

    def call
      @booking = Booking.new(@attributes)
      unless booking.valid?
        if booking.errors.full_messages.any? { |message| message.match?(/already booked/i) }
          @error_message = "These dates were just booked. Please choose different dates."
          @status = :conflict
        end
        return false
      end

      homestay = booking.homestay
      BookingAvailability::HoldManager.expire_for_homestay!(homestay)

      if homestay.calendar_sync_enabled? && !refresh_availability!(homestay)
        @error_message ||= "We couldn’t refresh availability right now. Please try again."
        return false
      end

      Booking.transaction do
        homestay.lock!
        BookingAvailability::HoldManager.expire_for_homestay!(homestay)

        if overlap?(homestay)
          @error_message = "These dates were just booked. Please choose different dates."
          @status = :conflict
          raise ActiveRecord::Rollback
        end

        booking.save!
      end

      return false unless booking.persisted?

      Observability::StructuredLogger.info(
        event: "booking.pending.created",
        booking_id: booking.id,
        homestay_id: homestay.id,
        source: booking.source,
        sync_state: homestay.calendar_sync_enabled? ? "checked" : "not_required"
      )

      true
    rescue ActiveRecord::RecordInvalid
      @error_message ||= "Unable to submit your booking right now. Please review your details and try again."
      false
    end

    private

    def overlap?(homestay)
      BookingAvailability::OverlapChecker.new(
        homestay: homestay,
        check_in_date: booking.check_in_date,
        check_out_date: booking.check_out_date,
        consider_holds: false
      ).conflict?
    end

    def refresh_availability!(homestay)
      return true unless CalendarSync::FreshnessPolicy.stale?(homestay)

      sync_triggered = CalendarSync::SyncHomestay.call(homestay, trigger: "booking_create", fail_silently: true)
      return true if sync_triggered
      return true if CalendarSync::FreshnessPolicy.fresh?(homestay)

      @status = :service_unavailable
      false
    rescue CalendarSync::SyncUnavailableError
      @status = :service_unavailable
      false
    end
  end
end
