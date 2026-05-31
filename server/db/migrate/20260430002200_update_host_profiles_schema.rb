class UpdateHostProfilesSchema < ActiveRecord::Migration[7.2]
  class MigrationHostProfile < ApplicationRecord
    self.table_name = "host_profiles"
  end

  def up
    # Clear out old singleton rows to avoid constraint violations
    execute "TRUNCATE TABLE host_profiles RESTART IDENTITY"

    remove_column :host_profiles, :host_name
    remove_column :host_profiles, :host_bio
    remove_column :host_profiles, :host_contact
    remove_column :host_profiles, :co_host_name
    remove_column :host_profiles, :co_host_bio
    remove_column :host_profiles, :co_host_contact

    add_column :host_profiles, :role, :string, null: false
    add_column :host_profiles, :name, :string, null: false
    add_column :host_profiles, :bio, :text, null: false
    add_column :host_profiles, :contact, :string, null: false

    add_index :host_profiles, :role, unique: true

    MigrationHostProfile.reset_column_information

    MigrationHostProfile.create!(
      role: "host",
      name: "Sacred Homes Host",
      bio: "Your local host in Varanasi.",
      contact: "hello@thesacredhomes.com"
    )

    MigrationHostProfile.create!(
      role: "co_host",
      name: "Sacred Homes Co-Host",
      bio: "Helping make every stay comfortable.",
      contact: "cohost@thesacredhomes.com"
    )
  end

  def down
    add_column :host_profiles, :host_name, :string
    add_column :host_profiles, :host_bio, :text
    add_column :host_profiles, :host_contact, :string
    add_column :host_profiles, :co_host_name, :string
    add_column :host_profiles, :co_host_bio, :text
    add_column :host_profiles, :co_host_contact, :string

    MigrationHostProfile.reset_column_information

    host = MigrationHostProfile.find_by(role: "host")
    co_host = MigrationHostProfile.find_by(role: "co_host")

    if host || co_host
      MigrationHostProfile.create(
        host_name: host&.name || "Sacred Homes Host",
        host_bio: host&.bio || "Your local host in Varanasi.",
        host_contact: host&.contact || "hello@thesacredhomes.com",
        co_host_name: co_host&.name || "Sacred Homes Co-Host",
        co_host_bio: co_host&.bio || "Helping make every stay comfortable.",
        co_host_contact: co_host&.contact || "cohost@thesacredhomes.com"
      )

      MigrationHostProfile.where(role: ["host", "co_host"]).delete_all
    end

    remove_index :host_profiles, :role
    remove_column :host_profiles, :role
    remove_column :host_profiles, :name
    remove_column :host_profiles, :bio
    remove_column :host_profiles, :contact
  end
end
