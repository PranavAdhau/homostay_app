class AddSourceAndExternalIdsToBookings < ActiveRecord::Migration[7.1]
  def change
    change_table :bookings, bulk: true do |t|
      t.integer  :source, null: false, default: 0
      t.string   :external_event_id
      t.datetime :external_last_seen_at
    end

    add_index :bookings,
              [:homestay_id, :source, :external_event_id],
              unique: true,
              where: "external_event_id IS NOT NULL",
              name: "index_bookings_on_homestay_source_external_event_id"
  end
end

