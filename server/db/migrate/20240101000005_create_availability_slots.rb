class CreateAvailabilitySlots < ActiveRecord::Migration[7.1]
  def change
    create_table :availability_slots do |t|
      t.references :homestay, null: false, foreign_key: true
      t.datetime :start_datetime, null: false
      t.datetime :end_datetime, null: false
      t.references :booking, null: true, foreign_key: true
      t.boolean :is_blocked, default: false, null: false

      t.timestamps
    end

    add_index :availability_slots, [:homestay_id, :start_datetime, :end_datetime], unique: true, name: 'index_availability_slots_unique'
    add_index :availability_slots, :start_datetime
    add_index :availability_slots, :end_datetime
    # add_index :availability_slots, :booking_id
  end
end
