module CalendarSync
  class ExternalBlockReconciler
    def self.call(homestay)
      new(homestay).call
    end

    def initialize(homestay)
      @homestay = homestay
    end

    def call
      blocked_dates = ExternalCalendarBlock.where(homestay_id: homestay.id).future_or_current.flat_map do |block|
        (block.starts_on...block.ends_on).to_a
      end.uniq

      desired_dates = blocked_dates.sort

      AvailabilitySlot.transaction do
        existing_slots = AvailabilitySlot.where(homestay_id: homestay.id).airbnb_sync_blocks.lock.to_a
        existing_map = existing_slots.index_by { |slot| slot.start_datetime.to_date }
        desired_map = desired_dates.index_with(true)

        create_missing_slots(existing_map, desired_map)
        delete_stale_slots(existing_map, desired_map)
      end
    end

    private

    attr_reader :homestay

    def create_missing_slots(existing_map, desired_map)
      attrs = desired_map.keys.reject { |key| existing_map.key?(key) }.map do |date|
        {
          homestay_id: homestay.id,
          start_datetime: date.beginning_of_day,
          end_datetime: date.end_of_day,
          booking_id: nil,
          is_blocked: true,
          block_source: "airbnb_sync",
          created_at: Time.current,
          updated_at: Time.current
        }
      end

      AvailabilitySlot.insert_all(attrs, unique_by: :index_availability_slots_unique) if attrs.any?
    rescue ActiveRecord::RecordNotUnique
      nil
    end

    def delete_stale_slots(existing_map, desired_map)
      stale_ids = existing_map.reject { |key, _| desired_map.key?(key) }.values.map(&:id)
      return if stale_ids.empty?

      AvailabilitySlot.where(homestay_id: homestay.id, id: stale_ids).delete_all
    end
  end
end
