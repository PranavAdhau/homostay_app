class AddPhoneAndDescriptionToHostProfiles < ActiveRecord::Migration[7.2]
  def change
    add_column :host_profiles, :phone, :string
    add_column :host_profiles, :description, :text
  end
end
