module CalendarSync
  class ExternalBlockReconciler
    def self.call(homestay)
      new(homestay).call
    end

    def initialize(homestay)
      @homestay = homestay
    end

    def call
      desired_map = desired_blocked_dates

      AvailabilitySlot.transaction do
        existing_slots = AvailabilitySlot.where(homestay_id: homestay.id).manual_blocks.or(
          AvailabilitySlot.where(homestay_id: homestay.id).airbnb_sync_blocks
        ).lock.to_a
        existing_map = existing_slots.index_by { |slot| slot.start_datetime.to_date }

        create_missing_slots(existing_map, desired_map)
        update_mismatched_slots(existing_map, desired_map)
        delete_stale_slots(existing_map, desired_map)
      end
    end

    private

    attr_reader :homestay

    def desired_blocked_dates
      desired = {}

      homestay.external_calendar_blocks.future_or_current.find_each do |block|
        (block.starts_on...block.ends_on).each do |date|
          desired[date] ||= "airbnb_sync"
        end
      end

      homestay.manual_inventory_blocks.active.find_each do |block|
        (block.starts_on...block.ends_on).each do |date|
          desired[date] = "manual"
        end
      end

      desired
    end

    def create_missing_slots(existing_map, desired_map)
      attrs = desired_map.keys.reject { |key| existing_map.key?(key) }.map do |date|
        {
          homestay_id: homestay.id,
          start_datetime: date.beginning_of_day,
          end_datetime: date.end_of_day,
          booking_id: nil,
          is_blocked: true,
          block_source: desired_map.fetch(date),
          created_at: Time.current,
          updated_at: Time.current
        }
      end

      AvailabilitySlot.insert_all(attrs, unique_by: :index_availability_slots_unique) if attrs.any?
    rescue ActiveRecord::RecordNotUnique
      nil
    end

    def update_mismatched_slots(existing_map, desired_map)
      existing_map.each do |date, slot|
        desired_source = desired_map[date]
        next unless desired_source.present?
        next if slot.block_source == desired_source

        slot.update!(block_source: desired_source)
      end
    end

    def delete_stale_slots(existing_map, desired_map)
      stale_ids = existing_map.reject { |key, _| desired_map.key?(key) }.values.map(&:id)
      return if stale_ids.empty?

      AvailabilitySlot.where(homestay_id: homestay.id, id: stale_ids).delete_all
    end
  end
end
