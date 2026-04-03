class AddCalendarSyncFieldsToHomestays < ActiveRecord::Migration[7.1]
  def change
    change_table :homestays, bulk: true do |t|
      t.string  :airbnb_ical_url
      t.boolean :calendar_sync_enabled, null: false, default: false
      t.integer :sync_error_count, null: false, default: 0
      t.datetime :last_calendar_sync_at
      t.datetime :last_calendar_sync_success_at
      t.text :last_calendar_sync_error
    end
  end
end

