require "icalendar"

module CalendarSync
  class ParseIcs
    MAX_EVENTS = 2000

    def self.call(ics_body)
      new(ics_body).call
    end

    def initialize(ics_body)
      @ics_body = ics_body
    end

    def call
      calendars = Icalendar::Calendar.parse(@ics_body)
      events = []
      seen_uids = {}

      calendars.each do |cal|
        cal.events.each do |event|
          uid = event.uid&.to_s&.strip
          dtstart = event.dtstart
          dtend = event.dtend

          next if uid.blank? || dtstart.blank? || dtend.blank?
          next if seen_uids[uid]

          start_time = normalize_time(dtstart)
          end_time   = normalize_time(dtend)

          all_day = dtstart.is_a?(Icalendar::Values::Date) ||
                    dtend.is_a?(Icalendar::Values::Date)

          events << {
            uid: uid,
            start_time: start_time,
            end_time: end_time,
            all_day: all_day
          }

          seen_uids[uid] = true
          if events.size > MAX_EVENTS
            raise "ICS has more than #{MAX_EVENTS} events"
          end
        end
      end

      events
    end

    private

    def normalize_time(value)
      if value.respond_to?(:tzid) && value.tzid
        zone = ActiveSupport::TimeZone[value.tzid] || Time.zone
        zone.parse(value.to_s)
      else
        time_value = value.to_time
        time_value = time_value.utc unless time_value.utc?
        time_value.in_time_zone(Time.zone)
      end
    end
  end
end

