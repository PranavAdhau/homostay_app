require "test_helper"

class ApiV1BookingsTest < ActionDispatch::IntegrationTest
  def create_homestay!(calendar_sync_enabled: false)
    Homestay.create!(
      name: "Booking Stay",
      slug: SecureRandom.hex(6),
      description: "Booking stay description",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true,
      calendar_sync_enabled: calendar_sync_enabled,
      airbnb_ical_url: calendar_sync_enabled ? "https://www.airbnb.com/calendar/ical/706968017695795472.ics?t=token&locale=en-GB" : nil
    )
  end

  def parsed_response
    JSON.parse(response.body)
  end

  def with_stubbed_class_method(klass, method_name, return_value)
    original_method = klass.method(method_name)
    klass.define_singleton_method(method_name) do |*args, **kwargs|
      if kwargs.empty?
        return_value
      else
        return_value
      end
    end
    yield
  ensure
    klass.define_singleton_method(method_name) do |*args, **kwargs, &block|
      original_method.call(*args, **kwargs, &block)
    end
  end

  test "blocks overlapping booking requests when an active reservation hold exists" do
    homestay = create_homestay!
    booking = homestay.bookings.create!(
      guest_name: "First Guest",
      guest_email: "first@example.com",
      guest_phone: "9999999999",
      check_in_date: Date.new(2026, 7, 10),
      check_out_date: Date.new(2026, 7, 12),
      number_of_guests: 2,
      total_price: 1000,
      status: :pending
    )
    BookingAvailability::HoldManager.create_for_booking!(booking)

    post "/api/v1/bookings", params: {
      booking: {
        homestay_id: homestay.id,
        guest_name: "Second Guest",
        guest_email: "second@example.com",
        guest_phone: "8888888888",
        check_in_date: "2026-07-10",
        check_out_date: "2026-07-12",
        number_of_guests: 2,
        total_price: 1000
      }
    }

    assert_response :conflict
    assert_equal false, parsed_response["success"]
    assert_equal "These dates were just booked. Please choose different dates.", parsed_response["message"]
  end

  test "fails closed when sync enabled availability cannot be refreshed and data is stale" do
    homestay = create_homestay!(calendar_sync_enabled: true)

    with_stubbed_class_method(CalendarSync::FreshnessPolicy, :stale?, true) do
      with_stubbed_class_method(CalendarSync::SyncHomestay, :call, false) do
        post "/api/v1/bookings", params: {
          booking: {
            homestay_id: homestay.id,
            guest_name: "Sync Guest",
            guest_email: "sync@example.com",
            guest_phone: "7777777777",
            check_in_date: "2026-08-10",
            check_out_date: "2026-08-12",
            number_of_guests: 2,
            total_price: 1000
          }
        }
      end
    end

    assert_response :service_unavailable
    assert_equal "We couldn’t refresh availability right now. Please try again.", parsed_response["message"]
  end
end
