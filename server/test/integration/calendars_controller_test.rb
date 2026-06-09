require "test_helper"
require "icalendar"

class CalendarsControllerTest < ActionDispatch::IntegrationTest
  def create_homestay!(name: "Calendar Stay")
    Homestay.create!(
      name: name,
      slug: name.parameterize,
      description: "#{name} description",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true
    )
  end

  test "exports rfc5545 compatible ics with only finalized sacred homes inventory" do
    homestay = create_homestay!

    approved = homestay.bookings.create!(
      guest_name: "Approved Guest",
      guest_email: "approved@example.com",
      guest_phone: "+91 9309800427",
      check_in_date: Date.new(2026, 6, 10),
      check_out_date: Date.new(2026, 6, 13),
      number_of_guests: 2,
      total_price: 1000,
      status: :approved
    )
    CalendarSync::SlotReconciler.call(approved)

    homestay.bookings.create!(
      guest_name: "Pending Guest",
      guest_email: "pending@example.com",
      guest_phone: "+1 (415) 555-1234",
      check_in_date: Date.new(2026, 6, 15),
      check_out_date: Date.new(2026, 6, 17),
      number_of_guests: 2,
      total_price: 1000,
      status: :pending
    )

    admin = AdminUser.create!(
      email: "calendar-export-admin-#{SecureRandom.hex(4)}@example.com",
      password: "Password123!",
      password_confirmation: "Password123!"
    )
    homestay.manual_inventory_blocks.create!(
      starts_on: Date.new(2026, 6, 20),
      ends_on: Date.new(2026, 6, 21),
      reason: "maintenance",
      created_by_admin_user: admin
    )

    homestay.external_calendar_blocks.create!(
      source: "airbnb",
      external_uid: "airbnb-block-1",
      starts_on: Date.new(2026, 6, 25),
      ends_on: Date.new(2026, 6, 27),
      summary: "Reserved",
      description: nil,
      last_seen_at: Time.current
    )
    homestay.availability_slots.create!(
      start_datetime: Time.zone.parse("2026-06-25 00:00:00"),
      end_datetime: Time.zone.parse("2026-06-25 23:59:59"),
      is_blocked: true,
      block_source: "airbnb_sync"
    )
    CalendarSync::ExternalBlockReconciler.call(homestay)

    get "/calendars/#{homestay.id}.ics"

    assert_response :success
    assert_equal "text/calendar; charset=utf-8", response.media_type + "; charset=utf-8"
    assert_includes response.body, "\r\n"
    assert_includes response.body, "BEGIN:VCALENDAR"
    assert_includes response.body, "CALSCALE:GREGORIAN"
    assert_includes response.body, "SUMMARY:Reserved"
    assert_includes response.body, "SUMMARY:Not available"
    refute_includes response.body, "Pending Guest"
    refute_includes response.body, "airbnb-block-1"
    assert_includes response.body, "manual-block-"

    calendar = Icalendar::Calendar.parse(response.body).first
    assert_equal 2, calendar.events.size

    booking_event = calendar.events.find { |event| event.summary == "Reserved" }
    assert_equal Date.new(2026, 6, 10), booking_event.dtstart.to_date
    assert_equal Date.new(2026, 6, 13), booking_event.dtend.to_date
    assert_includes response.body, "DTSTART;VALUE=DATE:20260610"
    assert_includes response.body, "DTEND;VALUE=DATE:20260613"
  end
end
