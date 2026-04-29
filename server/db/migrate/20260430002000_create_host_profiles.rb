class CreateHostProfiles < ActiveRecord::Migration[7.2]
  def change
    create_table :host_profiles do |t|
      t.string :host_name, null: false
      t.text :host_bio, null: false
      t.string :host_contact, null: false
      t.string :co_host_name, null: false
      t.text :co_host_bio, null: false
      t.string :co_host_contact, null: false

      t.timestamps
    end
  end
end
