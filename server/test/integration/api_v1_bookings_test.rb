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

  test "allows multiple overlapping pending booking requests for the same dates" do
    homestay = create_homestay!
    booking_params = {
      homestay_id: homestay.id,
      check_in_date: "2026-08-10",
      check_out_date: "2026-08-12",
      number_of_guests: 2,
      total_price: 1000
    }

    post "/api/v1/bookings", params: {
      booking: booking_params.merge(
        guest_name: "First Guest",
        guest_email: "first@example.com",
        guest_phone: "+91 9309800427"
      )
    }

    assert_response :created
    assert_equal true, parsed_response["success"]

    post "/api/v1/bookings", params: {
      booking: booking_params.merge(
        guest_name: "Second Guest",
        guest_email: "second@example.com",
        guest_phone: "+1 (415) 555-1234"
      )
    }

    assert_response :created
    assert_equal true, parsed_response["success"]
    assert_equal 2, homestay.bookings.pending.count
  end

  test "pending booking creation does not create availability slots or external blocks" do
    homestay = create_homestay!
    external_blocks_before = homestay.external_calendar_blocks.count
    slots_before = homestay.availability_slots.count

    post "/api/v1/bookings", params: {
      booking: {
        homestay_id: homestay.id,
        guest_name: "Pending Guest",
        guest_email: "pending@example.com",
        guest_phone: "+91 9309800427",
        check_in_date: "2026-08-10",
        check_out_date: "2026-08-12",
        number_of_guests: 2,
        total_price: 1000
      }
    }

    assert_response :created
    booking = Booking.order(:id).last

    assert_equal 0, booking.availability_slots.count
    assert_equal external_blocks_before, homestay.external_calendar_blocks.reload.count
    assert_equal slots_before, homestay.availability_slots.reload.count
    assert_nil booking.reservation_hold
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
            guest_phone: "+44 20 7946 0958",
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

  test "blocks booking requests when an active manual inventory block exists" do
    homestay = create_homestay!
    admin = AdminUser.create!(
      email: "booking-lock-admin-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!"
    )
    homestay.manual_inventory_blocks.create!(
      starts_on: Date.new(2026, 8, 10),
      ends_on: Date.new(2026, 8, 12),
      reason: "maintenance",
      created_by_admin_user: admin
    )
    CalendarSync::ExternalBlockReconciler.call(homestay)

    post "/api/v1/bookings", params: {
      booking: {
        homestay_id: homestay.id,
        guest_name: "Blocked Guest",
        guest_email: "blocked@example.com",
        guest_phone: "+61 412 345 678",
        check_in_date: "2026-08-10",
        check_out_date: "2026-08-12",
        number_of_guests: 2,
        total_price: 1000
      }
    }

    assert_response :conflict
    assert_equal "These dates were just booked. Please choose different dates.", parsed_response["message"]
  end

  test "rejects invalid email addresses" do
    homestay = create_homestay!

    post "/api/v1/bookings", params: {
      booking: {
        homestay_id: homestay.id,
        guest_name: "Invalid Email Guest",
        guest_email: "not-an-email",
        guest_phone: "+91 9309800427",
        check_in_date: "2026-08-10",
        check_out_date: "2026-08-12",
        number_of_guests: 2,
        total_price: 1000
      }
    }

    assert_response :unprocessable_entity
    assert_equal false, parsed_response["success"]
    assert_includes parsed_response["errors"], "Guest email is invalid"
  end

  test "accepts international phone formats and rejects obvious junk values" do
    homestay = create_homestay!

    post "/api/v1/bookings", params: {
      booking: {
        homestay_id: homestay.id,
        guest_name: "International Guest",
        guest_email: "traveler@example.com",
        guest_phone: "+1 (415) 555-1234",
        check_in_date: "2026-08-10",
        check_out_date: "2026-08-12",
        number_of_guests: 2,
        total_price: 1000
      }
    }

    assert_response :created
    assert_equal true, parsed_response["success"]

    post "/api/v1/bookings", params: {
      booking: {
        homestay_id: homestay.id,
        guest_name: "Junk Phone Guest",
        guest_email: "junk@example.com",
        guest_phone: "0000000000",
        check_in_date: "2026-08-15",
        check_out_date: "2026-08-18",
        number_of_guests: 2,
        total_price: 1500
      }
    }

    assert_response :unprocessable_entity
    assert_equal false, parsed_response["success"]
    assert_includes parsed_response["errors"], "Guest phone is invalid"
  end

  test "booking creation enqueues telegram host and guest acknowledgement jobs" do
    homestay = create_homestay!

    assert_enqueued_with(job: TelegramBookingJob) do
      assert_enqueued_with(job: WhatsappGuestAcknowledgementJob) do
        post "/api/v1/bookings", params: {
          booking: {
            homestay_id: homestay.id,
            guest_name: "WhatsApp Guest",
            guest_email: "whatsapp@example.com",
            guest_phone: "+91 9309800427",
            check_in_date: "2026-08-20",
            check_out_date: "2026-08-22",
            number_of_guests: 2,
            total_price: 1000
          }
        }
      end
    end

    assert_response :created
    assert_equal false, parsed_response.dig("data", "host_notification_sent")
    assert_equal false, parsed_response.dig("data", "whatsapp_message_sent")
  end
end
