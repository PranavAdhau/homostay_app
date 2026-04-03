class CreateHomestays < ActiveRecord::Migration[7.1]
  def change
    create_table :homestays do |t|
      t.string :name, null: false
      t.string :slug, null: false
      t.text :description
      t.integer :capacity, null: false
      t.string :size
      t.decimal :price_per_night, precision: 10, scale: 2, null: false
      t.integer :booking_type, default: 0, null: false # 0: date_based, 1: hour_based, 2: both
      t.integer :min_booking_hours
      t.integer :max_booking_hours
      t.boolean :is_active, default: true, null: false

      t.timestamps
    end

    add_index :homestays, :slug, unique: true
    add_index :homestays, :is_active
  end
end
