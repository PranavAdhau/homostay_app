class CreateSiteSettings < ActiveRecord::Migration[7.2]
  def change
    create_table :site_settings do |t|
      t.string :phone, null: false
      t.string :email, null: false
      t.string :instagram, null: false
      t.string :address
      t.string :whatsapp_number, null: false

      t.timestamps
    end
  end
end

