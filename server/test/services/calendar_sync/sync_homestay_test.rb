require "test_helper"

class CalendarSyncSyncHomestayTest < ActiveSupport::TestCase
  def create_homestay!
    Homestay.create!(
      name: "Sync Stay",
      slug: SecureRandom.hex(6),
      description: "Sync stay description",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true,
      calendar_sync_enabled: true,
      airbnb_ical_url: "https://www.airbnb.com/calendar/ical/706968017695795472.ics?t=token&locale=en-GB"
    )
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

  test "sync remains idempotent and cleans stale external blocks" do
    homestay = create_homestay!
    lock_result = Struct.new(:acquired?, :token, keyword_init: true).new(acquired?: true, token: "test-token")

    first_payload = <<~ICS
      BEGIN:VCALENDAR
      VERSION:2.0
      BEGIN:VEVENT
      DTSTART;VALUE=DATE:20260723
      DTEND;VALUE=DATE:20260726
      SUMMARY:Reserved
      UID:event-1@airbnb.com
      END:VEVENT
      BEGIN:VEVENT
      DTSTART;VALUE=DATE:20260730
      DTEND;VALUE=DATE:20260801
      SUMMARY:Airbnb (Not available)
      UID:event-2@airbnb.com
      END:VEVENT
      END:VCALENDAR
    ICS

    second_payload = <<~ICS
      BEGIN:VCALENDAR
      VERSION:2.0
      BEGIN:VEVENT
      DTSTART;VALUE=DATE:20260723
      DTEND;VALUE=DATE:20260726
      SUMMARY:Reserved
      UID:event-1@airbnb.com
      END:VEVENT
      END:VCALENDAR
    ICS

    with_stubbed_class_method(Infrastructure::RedisLock, :acquire, lock_result) do
      with_stubbed_class_method(Infrastructure::RedisLock, :release, nil) do
        with_stubbed_class_method(CalendarSync::FetchIcs, :call, first_payload) do
          assert CalendarSync::SyncHomestay.call(homestay, trigger: "test")
        end

        homestay.reload
        assert_equal 2, homestay.external_calendar_blocks.count
        assert_equal 5, homestay.availability_slots.airbnb_sync_blocks.count

        with_stubbed_class_method(CalendarSync::FetchIcs, :call, first_payload) do
          assert CalendarSync::SyncHomestay.call(homestay, trigger: "test")
        end

        homestay.reload
        assert_equal 2, homestay.external_calendar_blocks.count
        assert_equal 5, homestay.availability_slots.airbnb_sync_blocks.count

        with_stubbed_class_method(CalendarSync::FetchIcs, :call, second_payload) do
          assert CalendarSync::SyncHomestay.call(homestay, trigger: "test")
        end
      end
    end

    homestay.reload
    assert_equal ["event-1@airbnb.com"], homestay.external_calendar_blocks.order(:external_uid).pluck(:external_uid)
    assert_equal 3, homestay.availability_slots.airbnb_sync_blocks.count
  end
end
