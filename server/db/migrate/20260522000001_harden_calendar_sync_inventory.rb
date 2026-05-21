class HardenCalendarSyncInventory < ActiveRecord::Migration[7.1]
  class MigrationBooking < ApplicationRecord
    self.table_name = "bookings"

    has_many :availability_slots,
             class_name: "HardenCalendarSyncInventory::MigrationAvailabilitySlot",
             foreign_key: :booking_id,
             dependent: :delete_all
  end

  class MigrationAvailabilitySlot < ApplicationRecord
    self.table_name = "availability_slots"
  end

  def up
    create_table :external_calendar_blocks do |t|
      t.references :homestay, null: false, foreign_key: true
      t.string :source, null: false
      t.string :external_uid, null: false
      t.date :starts_on, null: false
      t.date :ends_on, null: false
      t.string :summary
      t.text :description
      t.datetime :dtstamp
      t.datetime :last_seen_at, null: false
      t.timestamps
    end

    add_index :external_calendar_blocks,
              [:homestay_id, :source, :external_uid],
              unique: true,
              name: "index_external_calendar_blocks_on_homestay_source_uid"
    add_index :external_calendar_blocks,
              [:homestay_id, :starts_on, :ends_on],
              name: "index_external_calendar_blocks_on_homestay_and_dates"
    add_index :external_calendar_blocks,
              [:homestay_id, :last_seen_at],
              name: "index_external_calendar_blocks_on_homestay_and_last_seen_at"

    create_table :reservation_holds do |t|
      t.references :homestay, null: false, foreign_key: true
      t.references :booking, null: true, foreign_key: true
      t.date :check_in_date, null: false
      t.date :check_out_date, null: false
      t.datetime :expires_at, null: false
      t.datetime :released_at
      t.string :token, null: false
      t.timestamps
    end

    add_index :reservation_holds, :token, unique: true
    add_index :reservation_holds,
              [:homestay_id, :expires_at],
              name: "index_reservation_holds_on_homestay_and_expires_at"
    add_index :reservation_holds,
              [:homestay_id, :check_in_date, :check_out_date],
              name: "index_reservation_holds_on_homestay_and_dates"

    add_column :availability_slots, :block_source, :string
    add_index :availability_slots,
              [:homestay_id, :block_source],
              name: "index_availability_slots_on_homestay_and_block_source"
    add_index :availability_slots,
              [:homestay_id, :is_blocked, :block_source, :start_datetime, :end_datetime],
              name: "index_availability_slots_on_inventory_overlap"
    add_index :bookings,
              [:homestay_id, :status, :check_in_date, :check_out_date],
              name: "index_bookings_on_homestay_status_and_dates"

    backfill_manual_block_sources!
    migrate_legacy_airbnb_inventory!
  end

  def down
    remove_index :bookings, name: "index_bookings_on_homestay_status_and_dates"
    remove_index :availability_slots, name: "index_availability_slots_on_inventory_overlap"
    remove_index :availability_slots, name: "index_availability_slots_on_homestay_and_block_source"
    remove_column :availability_slots, :block_source

    drop_table :reservation_holds
    drop_table :external_calendar_blocks
  end

  private

  def backfill_manual_block_sources!
    MigrationAvailabilitySlot.where(is_blocked: true, booking_id: nil).update_all(block_source: "manual")
  end

  def migrate_legacy_airbnb_inventory!
    say_with_time "Migrating legacy Airbnb bookings into external calendar blocks" do
      MigrationBooking.where(source: 1).find_each do |booking|
        next if booking.external_event_id.blank? || booking.check_in_date.blank? || booking.check_out_date.blank?

        execute <<~SQL.squish
          INSERT INTO external_calendar_blocks
            (homestay_id, source, external_uid, starts_on, ends_on, summary, description, dtstamp, last_seen_at, created_at, updated_at)
          VALUES
            (#{booking.homestay_id},
             'airbnb',
             #{connection.quote(booking.external_event_id)},
             #{connection.quote(booking.check_in_date)},
             #{connection.quote(booking.check_out_date)},
             'Reserved',
             NULL,
             #{connection.quote(booking.updated_at)},
             #{connection.quote(booking.external_last_seen_at || booking.updated_at || Time.current)},
             #{connection.quote(booking.created_at || Time.current)},
             #{connection.quote(booking.updated_at || Time.current)})
          ON CONFLICT (homestay_id, source, external_uid) DO NOTHING
        SQL

        slot_attrs = []
        (booking.check_in_date...booking.check_out_date).each do |date|
          slot_attrs << {
            homestay_id: booking.homestay_id,
            start_datetime: date.beginning_of_day,
            end_datetime: date.end_of_day,
            booking_id: nil,
            is_blocked: true,
            block_source: "airbnb_sync",
            created_at: booking.created_at || Time.current,
            updated_at: booking.updated_at || Time.current
          }
        end

        MigrationAvailabilitySlot.insert_all(slot_attrs, unique_by: :index_availability_slots_unique) if slot_attrs.any?

        booking.availability_slots.delete_all
        booking.delete
      end
    end
  end
end
