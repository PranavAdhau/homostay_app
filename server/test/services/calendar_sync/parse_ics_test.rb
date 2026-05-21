require "test_helper"

class CalendarSyncParseIcsTest < ActiveSupport::TestCase
  test "parses airbnb date events with folded descriptions and skips malformed vevents" do
    ics_body = <<~ICS
      BEGIN:VCALENDAR
      PRODID:-//Airbnb Inc//Hosting Calendar 1.0//EN
      CALSCALE:GREGORIAN
      VERSION:2.0
      BEGIN:VEVENT
      DTSTAMP:20260521T172811Z
      DTSTART;VALUE=DATE:20260523
      DTEND;VALUE=DATE:20260525
      SUMMARY:Reserved
      UID:1418fb94e984-9a86ba6606edef8b795b514de7ca1f30@airbnb.com
      DESCRIPTION:Reservation URL: https://www.airbnb.com/hosting/reservations/de
       tails/HMW4DAXRCH\\nPhone Number (Last 4 Digits): 0242
      END:VEVENT
      BEGIN:VEVENT
      DTSTART;VALUE=DATE:20260529
      UID:missing-end-date@airbnb.com
      END:VEVENT
      BEGIN:VEVENT
      DTSTAMP:20260521T172811Z
      DTSTART;VALUE=DATE:20260530
      DTEND;VALUE=DATE:20260603
      UID:not-available@airbnb.com
      END:VEVENT
      END:VCALENDAR
    ICS

    events = CalendarSync::ParseIcs.call(ics_body)

    assert_equal 2, events.length
    assert_equal Date.new(2026, 5, 23), events.first[:start_on]
    assert_equal Date.new(2026, 5, 25), events.first[:end_on]
    assert_equal "Reserved", events.first[:summary]
    assert_includes events.first[:description], "Reservation URL:"
    assert_includes events.first[:description], "Phone Number (Last 4 Digits): 0242"

    fallback_event = events.last
    assert_equal "Unavailable", fallback_event[:summary]
    assert_nil fallback_event[:description]
  end
end
