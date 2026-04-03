class CreateBookings < ActiveRecord::Migration[7.1]
  def change
    create_table :bookings do |t|
      t.references :homestay, null: false, foreign_key: true
      t.string :guest_name, null: false
      t.string :guest_email, null: false
      t.string :guest_phone, null: false
      t.date :check_in_date, null: false
      t.time :check_in_time
      t.date :check_out_date, null: false
      t.time :check_out_time
      t.integer :number_of_guests, null: false
      t.decimal :total_price, precision: 10, scale: 2, null: false
      t.integer :status, default: 0, null: false # 0: pending, 1: approved, 2: confirmed, 3: rejected, 4: completed
      t.boolean :whatsapp_message_sent, default: false, null: false

      t.timestamps
    end

    add_index :bookings, :status
    #add_index :bookings, :homestay_id
    add_index :bookings, :check_in_date
    add_index :bookings, :check_out_date
  end
end
