require "test_helper"

class AdminApiV1BookingsTest < ActionDispatch::IntegrationTest
  def create_homestay!
    Homestay.create!(
      name: "Admin Booking Stay",
      slug: SecureRandom.hex(6),
      description: "Admin booking stay description",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true
    )
  end

  def parsed_response
    JSON.parse(response.body)
  end

  setup do
    @admin = AdminUser.create!(email: "admin-#{SecureRandom.hex(4)}@example.com", password: "Password123!", password_confirmation: "Password123!")
    sign_in @admin
  end

  test "prevents approval when another reservation already blocks the dates" do
    homestay = create_homestay!
    pending_booking = homestay.bookings.create!(
      guest_name: "Pending Guest",
      guest_email: "pending@example.com",
      guest_phone: "9999999999",
      check_in_date: Date.new(2026, 9, 10),
      check_out_date: Date.new(2026, 9, 13),
      number_of_guests: 2,
      total_price: 1500,
      status: :pending
    )

    homestay.availability_slots.create!(
      start_datetime: Time.zone.parse("2026-09-11 00:00:00"),
      end_datetime: Time.zone.parse("2026-09-11 23:59:59"),
      is_blocked: true,
      block_source: "manual"
    )

    patch "/admin/api/v1/bookings/#{pending_booking.id}/approve", params: {}

    assert_response :conflict
    assert_equal false, parsed_response["success"]
    assert_equal "Another reservation was detected during confirmation.", parsed_response["message"]
    assert_equal "pending", pending_booking.reload.status
  end
end
