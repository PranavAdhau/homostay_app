class CreateHomestayAmenities < ActiveRecord::Migration[7.1]
  def change
    create_table :homestay_amenities do |t|
      t.references :homestay, null: false, foreign_key: true
      t.references :amenity, null: false, foreign_key: true

      t.timestamps
    end

    add_index :homestay_amenities, [:homestay_id, :amenity_id], unique: true
  end
end
