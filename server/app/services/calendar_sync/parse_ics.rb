require "time"

module CalendarSync
  class ParseIcs
    class Error < StandardError; end

    MAX_EVENTS = 2000

    def self.call(ics_body)
      new(ics_body).call
    end

    def initialize(ics_body)
      @ics_body = ics_body
    end

    def call
      raise Error, "Calendar payload is invalid" unless unfolded_lines.include?("BEGIN:VCALENDAR")

      events = []
      seen_uids = {}

      each_vevent do |event_lines|
        event = parse_event(event_lines)
        next unless event
        next if seen_uids[event[:uid]]

        events << event
        seen_uids[event[:uid]] = true
        raise Error, "Calendar payload contains too many events" if events.size > MAX_EVENTS
      end

      events
    end

    private

    def unfolded_lines
      @unfolded_lines ||= begin
        lines = @ics_body.to_s.gsub("\r\n", "\n").split("\n", -1)
        lines.each_with_object([]) do |line, acc|
          if line.start_with?(" ", "\t") && acc.any?
            acc[-1] = +"#{acc[-1]}#{line[1..]}"
          else
            acc << line
          end
        end
      end
    end

    def each_vevent
      current = nil

      unfolded_lines.each do |line|
        case line
        when "BEGIN:VEVENT"
          current = []
        when "END:VEVENT"
          yield current if current.present?
          current = nil
        else
          current << line if current
        end
      end
    end

    def parse_event(event_lines)
      properties = event_lines.each_with_object({}) do |line, acc|
        key_part, value = line.split(":", 2)
        next if key_part.blank? || value.nil?

        name, *params = key_part.split(";")
        acc[name] ||= []
        acc[name] << { value: value, params: params }
      end

      uid = fetch_value(properties, "UID")
      start_on = parse_date_property(properties["DTSTART"]&.first)
      end_on = parse_date_property(properties["DTEND"]&.first)

      if uid.blank? || start_on.blank? || end_on.blank? || end_on <= start_on
        log_skipped_event(uid: uid, reason: "missing_or_invalid_required_fields")
        return nil
      end

      {
        uid: uid,
        start_on: start_on,
        end_on: end_on,
        summary: fetch_value(properties, "SUMMARY").presence || "Unavailable",
        description: unescape_text(fetch_value(properties, "DESCRIPTION")),
        dtstamp: parse_datetime(fetch_value(properties, "DTSTAMP"))
      }
    rescue StandardError
      log_skipped_event(uid: uid, reason: "malformed_vevent")
      nil
    end

    def fetch_value(properties, key)
      properties[key]&.first&.fetch(:value, nil)&.to_s&.strip
    end

    def parse_date_property(property)
      return nil unless property

      raw_value = property[:value].to_s.strip
      params = property[:params] || []
      value_type = params.find { |param| param.start_with?("VALUE=") }&.split("=", 2)&.last

      if value_type == "DATE" || raw_value.match?(/\A\d{8}\z/)
        Date.strptime(raw_value, "%Y%m%d")
      else
        Time.iso8601(raw_value).to_date
      end
    end

    def parse_datetime(value)
      return nil if value.blank?

      Time.strptime(value, "%Y%m%dT%H%M%SZ").utc
    rescue ArgumentError
      nil
    end

    def unescape_text(value)
      return nil if value.blank?

      value.to_s
           .gsub("\\n", "\n")
           .gsub("\\N", "\n")
           .gsub("\\,", ",")
           .gsub("\\;", ";")
           .gsub("\\\\", "\\")
    end

    def log_skipped_event(uid:, reason:)
      Observability::StructuredLogger.warn(
        event: "calendar_sync.event.skipped",
        source: "airbnb",
        external_uid: uid,
        reason: reason
      )
    end
  end
end
