module BookingAvailability
  class OverlapChecker
    attr_reader :homestay,
                :check_in_date,
                :check_out_date,
                :booking_to_ignore,
                :hold_to_ignore,
                :manual_inventory_block_to_ignore,
                :consider_holds

    def initialize(
      homestay:,
      check_in_date:,
      check_out_date:,
      booking_to_ignore: nil,
      hold_to_ignore: nil,
      manual_inventory_block_to_ignore: nil,
      consider_holds: true
    )
      @homestay = homestay
      @check_in_date = check_in_date
      @check_out_date = check_out_date
      @booking_to_ignore = booking_to_ignore
      @hold_to_ignore = hold_to_ignore
      @manual_inventory_block_to_ignore = manual_inventory_block_to_ignore
      @consider_holds = consider_holds
    end

    def conflict?
      return false unless homestay && check_in_date && check_out_date

      finalized_booking_conflict? ||
        external_block_conflict? ||
        manual_inventory_block_conflict? ||
        blocked_slot_conflict? ||
        active_hold_conflict?
    end

    def blocking_sources(include_holds: consider_holds)
      return [] unless homestay && check_in_date && check_out_date

      sources = []
      sources.concat(finalized_booking_sources)
      sources.concat(external_block_sources)
      sources.concat(manual_inventory_block_sources)
      sources.concat(active_hold_sources) if include_holds
      sources.uniq { |source| "#{source[:source]}-#{source[:id]}" }
    end

    private

    def finalized_booking_conflict?
      finalized_booking_scope.exists?
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

    def external_block_conflict?
      external_block_scope.exists?
    end

    def manual_inventory_block_conflict?
      manual_inventory_block_scope.exists?
    end

    def active_hold_conflict?
      return false unless consider_holds

      active_hold_scope.exists?
    end

    def finalized_booking_sources
      finalized_booking_scope.map do |booking|
        {
          id: booking.id,
          source: "booking",
          label: "Website Booking ##{booking.id}",
          booking_id: booking.id,
          status: booking.status
        }
      end
    end

    def external_block_sources
      external_block_scope.map do |block|
        {
          id: block.id,
          source: "airbnb_sync",
          label: "Airbnb Reservation",
          external_uid: block.external_uid
        }
      end
    end

    def manual_inventory_block_sources
      manual_inventory_block_scope.map do |block|
        {
          id: block.id,
          source: "manual_lock",
          label: "Manual Lock",
          reason: block.reason
        }
      end
    end

    def active_hold_sources
      active_hold_scope.map do |hold|
        {
          id: hold.id,
          source: "reservation_hold",
          label: "Active Reservation Hold"
        }
      end
    end

    def finalized_booking_scope
      scope = homestay.bookings
                      .where(status: %i[approved confirmed])
                      .where("check_in_date < ? AND check_out_date > ?", check_out_date, check_in_date)
      scope = scope.where.not(id: booking_to_ignore.id) if booking_to_ignore&.id.present?
      scope
    end

    def external_block_scope
      homestay.external_calendar_blocks
              .future_or_current
              .where("starts_on < ? AND ends_on > ?", check_out_date, check_in_date)
    end

    def manual_inventory_block_scope
      scope = homestay.manual_inventory_blocks
                      .active
                      .where("starts_on < ? AND ends_on > ?", check_out_date, check_in_date)
      scope = scope.where.not(id: manual_inventory_block_to_ignore.id) if manual_inventory_block_to_ignore&.id.present?
      scope
    end

    def active_hold_scope
      scope = homestay.reservation_holds
                      .active
                      .where("check_in_date < ? AND check_out_date > ?", check_out_date, check_in_date)

      scope = scope.where.not(id: hold_to_ignore.id) if hold_to_ignore&.id.present?
      if booking_to_ignore&.id.present?
        scope = scope.where("booking_id IS NULL OR booking_id != ?", booking_to_ignore.id)
      end
      scope
    end
  end
end
