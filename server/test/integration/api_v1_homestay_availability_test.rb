require "test_helper"

class ApiV1HomestayAvailabilityTest < ActionDispatch::IntegrationTest
  def create_homestay!
    Homestay.create!(
      name: "Availability Stay",
      slug: SecureRandom.hex(6),
      description: "Availability stay description",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true
    )
  end

  def parsed_response
    JSON.parse(response.body)
  end

  def booking_params(homestay, check_in:, check_out:, email:)
    {
      booking: {
        homestay_id: homestay.id,
        guest_name: "Guest #{email}",
        guest_email: email,
        guest_phone: "+91 9309800427",
        check_in_date: check_in,
        check_out_date: check_out,
        number_of_guests: 2,
        total_price: 1000
      }
    }
  end

  test "pending booking does not affect public availability" do
    homestay = create_homestay!
    check_in = "2026-06-25"
    check_out = "2026-06-26"

    post "/api/v1/bookings", params: booking_params(
      homestay,
      check_in: check_in,
      check_out: check_out,
      email: "pending@example.com"
    )

    assert_response :created
    assert_equal "pending", parsed_response.dig("data", "status")

    get "/api/v1/homestays/#{homestay.slug}/availability", params: {
      start_date: "2026-06-01",
      end_date: "2026-06-30"
    }

    assert_response :success
    available_dates = parsed_response.dig("data", "available_dates")
    unavailable_dates = parsed_response.dig("data", "unavailable_dates")

    assert_includes available_dates, check_in
    assert_not_includes unavailable_dates, check_in
  end

  test "active reservation hold does not affect public availability" do
    homestay = create_homestay!
    booking = homestay.bookings.create!(
      guest_name: "Held Guest",
      guest_email: "held@example.com",
      guest_phone: "+91 9309800427",
      check_in_date: Date.new(2026, 6, 25),
      check_out_date: Date.new(2026, 6, 26),
      number_of_guests: 2,
      total_price: 1000,
      status: :pending
    )
    BookingAvailability::HoldManager.create_for_booking!(booking)

    get "/api/v1/homestays/#{homestay.slug}/availability", params: {
      start_date: "2026-06-01",
      end_date: "2026-06-30"
    }

    assert_response :success
    available_dates = parsed_response.dig("data", "available_dates")
    unavailable_dates = parsed_response.dig("data", "unavailable_dates")

    assert_includes available_dates, "2026-06-25"
    assert_not_includes unavailable_dates, "2026-06-25"
  end
end
