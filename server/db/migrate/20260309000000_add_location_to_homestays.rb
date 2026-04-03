class AddLocationToHomestays < ActiveRecord::Migration[7.2]
  def change
    add_column :homestays, :latitude, :decimal, precision: 10, scale: 6
    add_column :homestays, :longitude, :decimal, precision: 10, scale: 6
    add_column :homestays, :address, :string

    add_index :homestays, [:latitude, :longitude]
  end
end

