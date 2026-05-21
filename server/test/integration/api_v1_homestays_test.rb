require "test_helper"

class ApiV1HomestaysTest < ActionDispatch::IntegrationTest
  def create_homestay!(name:, capacity:, rooms:)
    Homestay.create!(
      name: name,
      slug: name.parameterize,
      description: "#{name} description",
      capacity: capacity,
      rooms: rooms,
      price_per_night: 100,
      is_active: true
    )
  end

  def parsed_response
    JSON.parse(response.body)
  end

  test "filters by guests and rooms independently" do
    small = create_homestay!(name: "Small Stay", capacity: 3, rooms: 1)
    medium = create_homestay!(name: "Medium Stay", capacity: 4, rooms: 2)
    large = create_homestay!(name: "Large Stay", capacity: 6, rooms: 3)

    get "/api/v1/homestays", params: { guests: 4, rooms: 2 }

    assert_response :success
    ids = parsed_response["data"].map { |item| item["id"] }

    assert_not_includes ids, small.id
    assert_includes ids, medium.id
    assert_includes ids, large.id
  end

  test "excludes homestays with overlapping approved bookings for all overlap shapes" do
    blocked = create_homestay!(name: "Blocked Booking Stay", capacity: 4, rooms: 2)
    available = create_homestay!(name: "Available Booking Stay", capacity: 4, rooms: 2)
    base_date = Date.current + 30.days

    blocked.bookings.create!(
      guest_name: "Guest",
      guest_email: "guest@example.com",
      guest_phone: "9999999999",
      check_in_date: base_date,
      check_out_date: base_date + 5.days,
      number_of_guests: 2,
      total_price: 500,
      status: :approved
    )

    overlap_ranges = [
      [base_date + 1.day, base_date + 4.days],
      [base_date - 1.day, base_date + 3.days],
      [base_date + 3.days, base_date + 7.days],
      [base_date, base_date + 5.days],
      [base_date - 5.days, base_date + 10.days]
    ]

    overlap_ranges.each do |check_in, check_out|
      get "/api/v1/homestays", params: {
        check_in: check_in.iso8601,
        check_out: check_out.iso8601
      }

      assert_response :success
      ids = parsed_response["data"].map { |item| item["id"] }

      assert_not_includes ids, blocked.id
      assert_includes ids, available.id
    end
  end

  test "excludes homestays with overlapping blocked or locked availability slots and keeps boundary case available" do
    blocked = create_homestay!(name: "Blocked Slot Stay", capacity: 4, rooms: 2)
    boundary = create_homestay!(name: "Boundary Slot Stay", capacity: 4, rooms: 2)
    base_date = Date.current + 30.days

    blocked.availability_slots.create!(
      start_datetime: base_date.beginning_of_day,
      end_datetime: (base_date + 5.days).end_of_day,
      is_blocked: true
    )

    boundary.availability_slots.create!(
      start_datetime: (base_date - 5.days).beginning_of_day,
      end_datetime: base_date.beginning_of_day,
      is_blocked: true
    )

    get "/api/v1/homestays", params: {
      check_in: base_date.iso8601,
      check_out: (base_date + 3.days).iso8601
    }

    assert_response :success
    ids = parsed_response["data"].map { |item| item["id"] }

    assert_not_includes ids, blocked.id
    assert_includes ids, boundary.id
  end

  test "rejects invalid date ranges" do
    create_homestay!(name: "Validation Stay", capacity: 2, rooms: 1)

    get "/api/v1/homestays", params: {
      check_in: "2026-04-20",
      check_out: "2026-04-20"
    }

    assert_response :bad_request
    assert_equal false, parsed_response["success"]
  end
end
