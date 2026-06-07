require "test_helper"

class ManualInventoryBlockTest < ActiveSupport::TestCase
  def create_homestay!
    Homestay.create!(
      name: "Manual Lock Stay",
      slug: SecureRandom.hex(6),
      description: "Manual lock stay description",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true
    )
  end

  setup do
    @admin = AdminUser.create!(
      email: "manual-lock-admin-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!"
    )
  end

  test "requires an available range and creator for new manual locks" do
    homestay = create_homestay!

    booking = homestay.bookings.create!(
      guest_name: "Approved Guest",
      guest_email: "approved@example.com",
      guest_phone: "+91 9309800427",
      check_in_date: Date.new(2026, 10, 10),
      check_out_date: Date.new(2026, 10, 12),
      number_of_guests: 2,
      total_price: 1200,
      status: :approved
    )
    CalendarSync::SlotReconciler.call(booking)

    block = homestay.manual_inventory_blocks.new(
      starts_on: Date.new(2026, 10, 11),
      ends_on: Date.new(2026, 10, 13),
      reason: "maintenance"
    )

    assert_not block.valid?
    assert_includes block.errors.full_messages, "Created by admin user can't be blank"

    block.created_by_admin_user = @admin
    assert_not block.valid?
    assert_includes block.errors.full_messages, "Selected dates are already blocked"
  end

  test "rejects conflicts with airbnb blocks and active manual locks" do
    homestay = create_homestay!
    homestay.external_calendar_blocks.create!(
      source: "airbnb",
      external_uid: "airbnb-uid-1",
      starts_on: Date.new(2026, 11, 1),
      ends_on: Date.new(2026, 11, 4),
      summary: "Reserved",
      last_seen_at: Time.current
    )
    CalendarSync::ExternalBlockReconciler.call(homestay)

    blocked_by_airbnb = homestay.manual_inventory_blocks.new(
      starts_on: Date.new(2026, 11, 2),
      ends_on: Date.new(2026, 11, 5),
      reason: "other",
      created_by_admin_user: @admin
    )

    assert_not blocked_by_airbnb.valid?
    assert_includes blocked_by_airbnb.errors.full_messages, "Selected dates are already blocked"

    existing_manual = homestay.manual_inventory_blocks.create!(
      starts_on: Date.new(2026, 11, 10),
      ends_on: Date.new(2026, 11, 12),
      reason: "owner_stay",
      created_by_admin_user: @admin
    )
    CalendarSync::ExternalBlockReconciler.call(homestay)

    overlapping_manual = homestay.manual_inventory_blocks.new(
      starts_on: Date.new(2026, 11, 11),
      ends_on: Date.new(2026, 11, 13),
      reason: "maintenance",
      created_by_admin_user: @admin
    )

    assert_not overlapping_manual.valid?
    assert_includes overlapping_manual.errors.full_messages, "Selected dates are already blocked"
    assert existing_manual.active?
  end
end
