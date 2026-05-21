# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_05_22_000001) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "action_text_rich_texts", force: :cascade do |t|
    t.string "name", null: false
    t.text "body"
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["record_type", "record_id", "name"], name: "index_action_text_rich_texts_uniqueness", unique: true
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["blob_id", "variation_digest"], name: "idx_on_blob_id_variation_digest_f36bede0d9", unique: true
    t.index ["blob_id"], name: "index_active_storage_variant_records_on_blob_id"
  end

  create_table "admin_users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
    t.index ["unlock_token"], name: "index_admin_users_on_unlock_token", unique: true
  end

  create_table "amenities", force: :cascade do |t|
    t.string "name", null: false
    t.string "icon_name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_amenities_on_name", unique: true
  end

  create_table "availability_slots", force: :cascade do |t|
    t.bigint "homestay_id", null: false
    t.datetime "start_datetime", null: false
    t.datetime "end_datetime", null: false
    t.bigint "booking_id"
    t.boolean "is_blocked", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "block_source"
    t.index ["booking_id"], name: "index_availability_slots_on_booking_id"
    t.index ["end_datetime"], name: "index_availability_slots_on_end_datetime"
    t.index ["homestay_id", "block_source"], name: "index_availability_slots_on_homestay_and_block_source"
    t.index ["homestay_id", "is_blocked", "block_source", "start_datetime", "end_datetime"], name: "index_availability_slots_on_inventory_overlap"
    t.index ["homestay_id", "start_datetime", "end_datetime"], name: "index_availability_slots_unique", unique: true
    t.index ["homestay_id"], name: "index_availability_slots_on_homestay_id"
    t.index ["start_datetime"], name: "index_availability_slots_on_start_datetime"
  end

  create_table "blogs", force: :cascade do |t|
    t.string "title", null: false
    t.text "content", null: false
    t.boolean "is_published", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "seo_summary"
    t.string "featured_locality"
    t.text "locality_tags"
    t.text "nearby_landmark_tags"
    t.text "related_homestay_ids"
    t.text "related_blog_ids"
    t.text "faq_entries"
    t.index ["created_at"], name: "index_blogs_on_created_at"
    t.index ["is_published"], name: "index_blogs_on_is_published"
  end

  create_table "bookings", force: :cascade do |t|
    t.bigint "homestay_id", null: false
    t.string "guest_name", null: false
    t.string "guest_email", null: false
    t.string "guest_phone", null: false
    t.date "check_in_date", null: false
    t.date "check_out_date", null: false
    t.integer "number_of_guests", null: false
    t.decimal "total_price", precision: 10, scale: 2, null: false
    t.integer "status", default: 0, null: false
    t.boolean "whatsapp_message_sent", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "source", default: 0, null: false
    t.string "external_event_id"
    t.datetime "external_last_seen_at"
    t.index ["check_in_date"], name: "index_bookings_on_check_in_date"
    t.index ["check_out_date"], name: "index_bookings_on_check_out_date"
    t.index ["homestay_id", "source", "external_event_id"], name: "index_bookings_on_homestay_source_external_event_id", unique: true, where: "(external_event_id IS NOT NULL)"
    t.index ["homestay_id", "status", "check_in_date", "check_out_date"], name: "index_bookings_on_homestay_status_and_dates"
    t.index ["homestay_id"], name: "index_bookings_on_homestay_id"
    t.index ["status"], name: "index_bookings_on_status"
  end

  create_table "external_calendar_blocks", force: :cascade do |t|
    t.bigint "homestay_id", null: false
    t.string "source", null: false
    t.string "external_uid", null: false
    t.date "starts_on", null: false
    t.date "ends_on", null: false
    t.string "summary"
    t.text "description"
    t.datetime "dtstamp"
    t.datetime "last_seen_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["homestay_id", "last_seen_at"], name: "index_external_calendar_blocks_on_homestay_and_last_seen_at"
    t.index ["homestay_id", "source", "external_uid"], name: "index_external_calendar_blocks_on_homestay_source_uid", unique: true
    t.index ["homestay_id", "starts_on", "ends_on"], name: "index_external_calendar_blocks_on_homestay_and_dates"
    t.index ["homestay_id"], name: "index_external_calendar_blocks_on_homestay_id"
  end

  create_table "homestay_amenities", force: :cascade do |t|
    t.bigint "homestay_id", null: false
    t.bigint "amenity_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["amenity_id"], name: "index_homestay_amenities_on_amenity_id"
    t.index ["homestay_id", "amenity_id"], name: "index_homestay_amenities_on_homestay_id_and_amenity_id", unique: true
    t.index ["homestay_id"], name: "index_homestay_amenities_on_homestay_id"
  end

  create_table "homestays", force: :cascade do |t|
    t.string "name", null: false
    t.string "slug", null: false
    t.text "description"
    t.integer "capacity", null: false
    t.string "size"
    t.decimal "price_per_night", precision: 10, scale: 2, null: false
    t.boolean "is_active", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "airbnb_ical_url"
    t.boolean "calendar_sync_enabled", default: false, null: false
    t.integer "sync_error_count", default: 0, null: false
    t.datetime "last_calendar_sync_at"
    t.datetime "last_calendar_sync_success_at"
    t.text "last_calendar_sync_error"
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.string "address"
    t.integer "rooms", default: 1, null: false
    t.text "seo_summary"
    t.string "seo_locality_focus"
    t.text "locality_tags"
    t.text "nearby_landmark_tags"
    t.text "related_blog_ids"
    t.text "related_homestay_ids"
    t.text "faq_entries"
    t.index ["is_active"], name: "index_homestays_on_is_active"
    t.index ["latitude", "longitude"], name: "index_homestays_on_latitude_and_longitude"
    t.index ["slug"], name: "index_homestays_on_slug", unique: true
  end

  create_table "host_profiles", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", null: false
    t.string "name", null: false
    t.text "bio", null: false
    t.string "contact", null: false
    t.string "phone"
    t.text "description"
    t.index ["role"], name: "index_host_profiles_on_role", unique: true
  end

  create_table "reservation_holds", force: :cascade do |t|
    t.bigint "homestay_id", null: false
    t.bigint "booking_id"
    t.date "check_in_date", null: false
    t.date "check_out_date", null: false
    t.datetime "expires_at", null: false
    t.datetime "released_at"
    t.string "token", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_reservation_holds_on_booking_id"
    t.index ["homestay_id", "check_in_date", "check_out_date"], name: "index_reservation_holds_on_homestay_and_dates"
    t.index ["homestay_id", "expires_at"], name: "index_reservation_holds_on_homestay_and_expires_at"
    t.index ["homestay_id"], name: "index_reservation_holds_on_homestay_id"
    t.index ["token"], name: "index_reservation_holds_on_token", unique: true
  end

  create_table "site_contents", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "site_settings", force: :cascade do |t|
    t.string "phone", null: false
    t.string "email", null: false
    t.string "instagram", null: false
    t.string "address"
    t.string "whatsapp_number", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "availability_slots", "bookings"
  add_foreign_key "availability_slots", "homestays"
  add_foreign_key "bookings", "homestays"
  add_foreign_key "external_calendar_blocks", "homestays"
  add_foreign_key "homestay_amenities", "amenities"
  add_foreign_key "homestay_amenities", "homestays"
  add_foreign_key "reservation_holds", "bookings"
  add_foreign_key "reservation_holds", "homestays"
end
