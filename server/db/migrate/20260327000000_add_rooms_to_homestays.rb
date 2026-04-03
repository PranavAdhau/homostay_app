class AddRoomsToHomestays < ActiveRecord::Migration[7.1]
  def change
    add_column :homestays, :rooms, :integer, null: false, default: 1
  end
end
