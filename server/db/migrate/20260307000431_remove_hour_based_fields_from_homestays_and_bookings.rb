class RemoveHourBasedFieldsFromHomestaysAndBookings < ActiveRecord::Migration[7.1]
  def change
    remove_column :homestays, :booking_type, :integer, default: 0, null: false
    remove_column :homestays, :min_booking_hours, :integer
    remove_column :homestays, :max_booking_hours, :integer
    
    remove_column :bookings, :check_in_time, :time
    remove_column :bookings, :check_out_time, :time
  end
end
