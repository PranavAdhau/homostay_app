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

  def with_stubbed_class_method(klass, method_name, return_value)
    original_method = klass.method(method_name)
    klass.define_singleton_method(method_name) do |*args, **kwargs|
      kwargs.empty? ? return_value : return_value
    end
    yield
  ensure
    klass.define_singleton_method(method_name) do |*args, **kwargs, &block|
      original_method.call(*args, **kwargs, &block)
    end
  end

  setup do
    @admin = AdminUser.create!(email: "admin-#{SecureRandom.hex(4)}@example.com", password: "Password123!", password_confirmation: "Password123!")
    sign_in @admin
  end

  test "approve preflight succeeds before opening the confirmation flow" do
    homestay = create_homestay!
    pending_booking = homestay.bookings.create!(
      guest_name: "Pending Guest",
      guest_email: "pending@example.com",
      guest_phone: "+1 (415) 555-1234",
      check_in_date: Date.new(2026, 9, 10),
      check_out_date: Date.new(2026, 9, 13),
      number_of_guests: 2,
      total_price: 1500,
      status: :pending
    )

    post "/admin/api/v1/bookings/#{pending_booking.id}/preflight", params: { action_name: "approve" }

    assert_response :success
    assert_equal true, parsed_response["success"]
    assert_equal "Inventory verification completed successfully.", parsed_response["message"]
    assert_equal "pending", pending_booking.reload.status
  end

  test "prevents approval when another reservation already blocks the dates" do
    homestay = create_homestay!
    pending_booking = homestay.bookings.create!(
      guest_name: "Pending Guest",
      guest_email: "pending@example.com",
      guest_phone: "+61 412 345 678",
      check_in_date: Date.new(2026, 9, 10),
      check_out_date: Date.new(2026, 9, 13),
      number_of_guests: 2,
      total_price: 1500,
      status: :pending
    )

    homestay.manual_inventory_blocks.create!(
      starts_on: Date.new(2026, 9, 11),
      ends_on: Date.new(2026, 9, 12),
      reason: "maintenance",
      created_by_admin_user: @admin
    )
    CalendarSync::ExternalBlockReconciler.call(homestay)

    patch "/admin/api/v1/bookings/#{pending_booking.id}/approve", params: {}

    assert_response :conflict
    assert_equal false, parsed_response["success"]
    assert_equal "Another reservation was detected during confirmation.", parsed_response["message"]
    assert_equal "pending", pending_booking.reload.status
  end

  test "reject preflight fails closed when sync enabled inventory cannot be refreshed" do
    homestay = create_homestay!
    homestay.update!(
      calendar_sync_enabled: true,
      airbnb_ical_url: "https://www.airbnb.com/calendar/ical/706968017695795472.ics?t=token&locale=en-GB"
    )
    pending_booking = homestay.bookings.create!(
      guest_name: "Pending Guest",
      guest_email: "pending@example.com",
      guest_phone: "+44 20 7946 0958",
      check_in_date: Date.new(2026, 9, 10),
      check_out_date: Date.new(2026, 9, 13),
      number_of_guests: 2,
      total_price: 1500,
      status: :pending
    )

    with_stubbed_class_method(CalendarSync::FreshnessPolicy, :stale?, true) do
      with_stubbed_class_method(CalendarSync::SyncHomestay, :call, false) do
        post "/admin/api/v1/bookings/#{pending_booking.id}/preflight", params: { action_name: "reject" }
      end
    end

    assert_response :service_unavailable
    assert_equal false, parsed_response["success"]
    assert_equal "We couldn’t refresh availability right now. Please try again.", parsed_response["message"]
    assert_equal "pending", pending_booking.reload.status
  end

  test "reject succeeds when reservation hold has expired" do
    homestay = create_homestay!
    pending_booking = homestay.bookings.create!(
      guest_name: "Expired Hold Guest",
      guest_email: "expired@example.com",
      guest_phone: "+91 9309800427",
      check_in_date: Date.new(2026, 9, 10),
      check_out_date: Date.new(2026, 9, 13),
      number_of_guests: 2,
      total_price: 1500,
      status: :pending
    )
    pending_booking.create_reservation_hold!(
      homestay: homestay,
      check_in_date: pending_booking.check_in_date,
      check_out_date: pending_booking.check_out_date,
      expires_at: 10.minutes.ago,
      token: SecureRandom.uuid
    )

    patch "/admin/api/v1/bookings/#{pending_booking.id}/reject", params: {}

    assert_response :success
    assert_equal true, parsed_response["success"]
    assert_equal "Booking rejected successfully", parsed_response["message"]
    assert_equal "rejected", pending_booking.reload.status
  end

  test "reject succeeds and releases active reservation hold" do
    homestay = create_homestay!
    pending_booking = homestay.bookings.create!(
      guest_name: "Active Hold Guest",
      guest_email: "active@example.com",
      guest_phone: "+1 (415) 555-1234",
      check_in_date: Date.new(2026, 9, 10),
      check_out_date: Date.new(2026, 9, 13),
      number_of_guests: 2,
      total_price: 1500,
      status: :pending
    )
    BookingAvailability::HoldManager.create_for_booking!(pending_booking)
    hold = pending_booking.reservation_hold
    assert hold.active?

    patch "/admin/api/v1/bookings/#{pending_booking.id}/reject", params: {}

    assert_response :success
    assert_equal true, parsed_response["success"]
    assert_equal "rejected", pending_booking.reload.status
    assert_not hold.reload.active?
    assert hold.released_at.present?
  end

end
