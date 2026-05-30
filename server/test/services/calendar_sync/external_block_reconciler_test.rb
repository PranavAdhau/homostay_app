require "test_helper"

class CalendarSyncExternalBlockReconcilerTest < ActiveSupport::TestCase
  def create_homestay!
    Homestay.create!(
      name: "Reconciler Stay",
      slug: SecureRandom.hex(6),
      description: "Reconciler stay description",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true
    )
  end

  setup do
    @admin = AdminUser.create!(
      email: "reconciler-admin-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!"
    )
  end

  test "remains idempotent across manual and airbnb blocked sources" do
    homestay = create_homestay!
    homestay.external_calendar_blocks.create!(
      source: "airbnb",
      external_uid: "event-1@airbnb.com",
      starts_on: Date.new(2026, 12, 10),
      ends_on: Date.new(2026, 12, 13),
      summary: "Reserved",
      last_seen_at: Time.current
    )
    homestay.manual_inventory_blocks.create!(
      starts_on: Date.new(2026, 12, 13),
      ends_on: Date.new(2026, 12, 15),
      reason: "offline_booking",
      created_by_admin_user: @admin
    )

    CalendarSync::ExternalBlockReconciler.call(homestay)
    first_snapshot = homestay.availability_slots.where(booking_id: nil, is_blocked: true).order(:start_datetime).pluck(:start_datetime, :block_source)

    CalendarSync::ExternalBlockReconciler.call(homestay)
    second_snapshot = homestay.availability_slots.where(booking_id: nil, is_blocked: true).order(:start_datetime).pluck(:start_datetime, :block_source)

    assert_equal first_snapshot, second_snapshot
    assert_equal 5, second_snapshot.length
    assert_equal "airbnb_sync", second_snapshot.first.last
    assert_equal "manual", second_snapshot.last.last
  end
end
