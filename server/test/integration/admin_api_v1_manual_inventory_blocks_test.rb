require "test_helper"

class AdminApiV1ManualInventoryBlocksTest < ActionDispatch::IntegrationTest
  setup do
    @admin = AdminUser.create!(
      email: "calendar-admin-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!"
    )
    sign_in @admin
  end

  def create_homestay!
    Homestay.create!(
      name: "Calendar Admin Stay",
      slug: SecureRandom.hex(6),
      description: "Calendar admin stay description",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true
    )
  end

  def parsed_response
    JSON.parse(response.body)
  end

  test "creates, lists, and unlocks manual locks with warnings and audit fields" do
    homestay = create_homestay!
    hold_booking = homestay.bookings.create!(
      guest_name: "Hold Guest",
      guest_email: "hold@example.com",
      guest_phone: "9999999999",
      check_in_date: Date.new(2026, 12, 20),
      check_out_date: Date.new(2026, 12, 22),
      number_of_guests: 2,
      total_price: 1000,
      status: :pending
    )
    BookingAvailability::HoldManager.create_for_booking!(hold_booking)

    post "/admin/api/v1/homestays/#{homestay.id}/manual_inventory_blocks", params: {
      manual_inventory_block: {
        starts_on: "2026-12-20",
        ends_on: "2026-12-22",
        reason: "offline_booking",
        notes: "Phone booking"
      }
    }

    assert_response :created
    assert_equal ["There is currently an active reservation hold for these dates."], parsed_response.dig("data", "warnings")
    block = homestay.manual_inventory_blocks.order(:created_at).last
    assert_equal @admin.id, block.created_by_admin_user_id

    get "/admin/api/v1/homestays/#{homestay.id}/calendar_inventory", params: {
      start_date: "2026-12-01",
      end_date: "2027-01-01"
    }

    assert_response :success
    events = parsed_response.dig("data", "events")
    manual_event = events.find { |event| event["source"] == "manual_lock" }
    assert_equal "Phone booking", manual_event["notes"]
    assert_equal @admin.email, manual_event["created_by"]
    assert_includes manual_event["blocking_sources"].map { |source| source["source"] }, "manual_lock"

    homestay.external_calendar_blocks.create!(
      source: "airbnb",
      external_uid: "event-2@airbnb.com",
      starts_on: Date.new(2026, 12, 20),
      ends_on: Date.new(2026, 12, 22),
      summary: "Reserved",
      last_seen_at: Time.current
    )
    CalendarSync::ExternalBlockReconciler.call(homestay)

    patch "/admin/api/v1/homestays/#{homestay.id}/manual_inventory_blocks/#{block.id}/unlock", params: {}

    assert_response :success
    assert_match(/dates remain unavailable/, parsed_response["message"])
    block.reload
    assert_not_nil block.unlocked_at
    assert_equal @admin.id, block.unlocked_by_admin_user_id
  end
end
