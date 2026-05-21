module BookingAvailability
  class OverlapChecker
    attr_reader :homestay, :check_in_date, :check_out_date, :booking_to_ignore, :hold_to_ignore

    def initialize(homestay:, check_in_date:, check_out_date:, booking_to_ignore: nil, hold_to_ignore: nil)
      @homestay = homestay
      @check_in_date = check_in_date
      @check_out_date = check_out_date
      @booking_to_ignore = booking_to_ignore
      @hold_to_ignore = hold_to_ignore
    end

    def conflict?
      finalized_booking_conflict? || blocked_slot_conflict? || active_hold_conflict?
    end

    private

    def finalized_booking_conflict?
      scope = homestay.bookings
                      .where(status: %i[approved confirmed])
                      .where("check_in_date < ? AND check_out_date > ?", check_out_date, check_in_date)

      scope = scope.where.not(id: booking_to_ignore.id) if booking_to_ignore&.id.present?
      scope.exists?
    end

    def blocked_slot_conflict?
      scope = homestay.availability_slots
                      .where("start_datetime < ? AND end_datetime > ?", check_out_date.beginning_of_day, check_in_date.beginning_of_day)
                      .where("booking_id IS NOT NULL OR is_blocked = ?", true)

      if booking_to_ignore&.id.present?
        scope = scope.where("booking_id IS NULL OR booking_id != ?", booking_to_ignore.id)
      end
      scope.exists?
    end

    def active_hold_conflict?
      scope = homestay.reservation_holds
                      .active
                      .where("check_in_date < ? AND check_out_date > ?", check_out_date, check_in_date)

      scope = scope.where.not(id: hold_to_ignore.id) if hold_to_ignore&.id.present?
      if booking_to_ignore&.id.present?
        scope = scope.where("booking_id IS NULL OR booking_id != ?", booking_to_ignore.id)
      end
      scope.exists?
    end
  end
end
