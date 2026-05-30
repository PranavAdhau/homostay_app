class CreateManualInventoryBlocks < ActiveRecord::Migration[7.2]
  class MigrationHomestay < ApplicationRecord
    self.table_name = "homestays"
  end

  class MigrationAvailabilitySlot < ApplicationRecord
    self.table_name = "availability_slots"
  end

  def up
    create_table :manual_inventory_blocks do |t|
      t.references :homestay, null: false, foreign_key: true
      t.date :starts_on, null: false
      t.date :ends_on, null: false
      t.string :reason, null: false
      t.text :notes
      t.references :created_by_admin_user, null: true, foreign_key: { to_table: :admin_users }
      t.references :unlocked_by_admin_user, null: true, foreign_key: { to_table: :admin_users }
      t.datetime :unlocked_at
      t.timestamps
    end

    add_index :manual_inventory_blocks,
              [:homestay_id, :unlocked_at, :starts_on, :ends_on],
              name: "index_manual_inventory_blocks_on_homestay_active_dates"
    add_index :manual_inventory_blocks,
              [:homestay_id, :starts_on, :ends_on],
              name: "index_manual_inventory_blocks_on_homestay_dates"

    backfill_legacy_manual_blocks!
  end

  def down
    drop_table :manual_inventory_blocks
  end

  private

  # Legacy manual blocks were stored as one blocked AvailabilitySlot per date.
  # Group contiguous dates back into authoritative manual lock ranges.
  def backfill_legacy_manual_blocks!
    MigrationHomestay.find_each do |homestay|
      dates = MigrationAvailabilitySlot.where(
        homestay_id: homestay.id,
        booking_id: nil,
        is_blocked: true,
        block_source: [nil, "manual"]
      ).order(:start_datetime).pluck(:start_datetime).map(&:to_date)

      next if dates.empty?

      contiguous_ranges(dates).each do |starts_on, ends_on|
        execute <<~SQL.squish
          INSERT INTO manual_inventory_blocks
            (homestay_id, starts_on, ends_on, reason, notes, created_by_admin_user_id, unlocked_by_admin_user_id, unlocked_at, created_at, updated_at)
          VALUES
            (#{homestay.id},
             #{connection.quote(starts_on)},
             #{connection.quote(ends_on)},
             'other',
             NULL,
             NULL,
             NULL,
             NULL,
             NOW(),
             NOW())
        SQL
      end
    end
  end

  def contiguous_ranges(dates)
    sorted_dates = dates.uniq.sort
    return [] if sorted_dates.empty?

    ranges = []
    range_start = sorted_dates.first
    range_end = range_start + 1.day

    sorted_dates.drop(1).each do |date|
      if date == range_end
        range_end = date + 1.day
      else
        ranges << [range_start, range_end]
        range_start = date
        range_end = date + 1.day
      end
    end

    ranges << [range_start, range_end]
    ranges
  end
end
