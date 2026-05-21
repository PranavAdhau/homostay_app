module CalendarSync
  class SlotReconciler
    def self.call(booking)
      new(booking).call
    end

    def initialize(booking)
      @booking = booking
    end

    def call
      Booking.transaction do
        booking.lock!

        existing_slots = booking.availability_slots.lock.reload.to_a
        expected_slots = expected_slots_for_booking

        existing_map = map_by_range(existing_slots)
        expected_map = map_by_range(expected_slots)

        to_create_keys = expected_map.keys - existing_map.keys
        to_delete_keys = existing_map.keys - expected_map.keys

        create_missing_slots(expected_map, to_create_keys)
        delete_extra_slots(existing_map, to_delete_keys)
      end
    end

    private

    attr_reader :booking

    def expected_slots_for_booking
      slots = []

      (booking.check_in_date...booking.check_out_date).each do |date|
        slots << AvailabilitySlot.new(
          homestay_id: booking.homestay_id,
          booking_id: booking.id,
          start_datetime: date.beginning_of_day,
          end_datetime: date.end_of_day,
          is_blocked: false,
          block_source: nil
        )
      end

      slots
    end

    def map_by_range(slots)
      slots.each_with_object({}) do |slot, acc|
        key = slot.start_datetime.to_date
        acc[key] = slot
      end
    end

    def create_missing_slots(expected_map, keys)
      return if keys.empty?

      attrs = keys.map do |key|
        slot = expected_map[key]
        {
          homestay_id: slot.homestay_id,
          booking_id: booking.id,
          start_datetime: slot.start_datetime,
          end_datetime: slot.end_datetime,
          is_blocked: false,
          block_source: nil,
          created_at: Time.current,
          updated_at: Time.current
        }
      end

      begin
        AvailabilitySlot.insert_all(
          attrs,
          unique_by: :index_availability_slots_unique
        )
      rescue ActiveRecord::RecordNotUnique
        # Another worker may have created the same slot; safe to ignore
      end
    end

    def delete_extra_slots(existing_map, keys)
      return if keys.empty?

      ids_to_delete = keys.map { |key| existing_map[key].id }.compact
      return if ids_to_delete.empty?

      booking.availability_slots.where(id: ids_to_delete).delete_all
    end
  end
end

