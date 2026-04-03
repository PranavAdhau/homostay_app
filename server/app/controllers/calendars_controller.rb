class CalendarsController < ApplicationController
  def show
    homestay = Homestay.find(params[:homestay_id])

    bookings = homestay.bookings
                       .unscope(:order)
                       .where(status: [:pending, :approved, :confirmed])
                       .select(
                         :id,
                         :homestay_id,
                         :check_in_date,
                         :check_out_date,
                         :source,
                         :external_event_id,
                         :status,
                         :updated_at
                       )

    last_updated = bookings.maximum(:updated_at) || homestay.updated_at

    fresh_when(
      etag: [homestay.id, last_updated],
      last_modified: last_updated,
      public: true
    )
    return if performed?

    response.headers["Cache-Control"] = "public, max-age=300"

    ics_body = build_ics(homestay, bookings)
    render plain: ics_body, content_type: "text/calendar"
  end

  private

  def build_ics(homestay, bookings)
    lines = []
    lines << "BEGIN:VCALENDAR"
    lines << "VERSION:2.0"
    lines << "PRODID:-//HomestayApp//EN"

    bookings.each do |booking|
      uid =
        if booking.source == "airbnb" && booking.external_event_id.present?
          booking.external_event_id
        else
          domain =
            ENV["ICAL_DOMAIN"].presence ||
            request.host ||
            "localhost"

          "booking-#{booking.id}-homestay-#{booking.homestay_id}@#{domain}"
        end

      check_in = booking.check_in_date
      check_out = booking.check_out_date

      lines << "BEGIN:VEVENT"
      lines << "UID:#{uid}"
      dtstamp = booking.updated_at.utc.strftime("%Y%m%dT%H%M%SZ")
      lines << "DTSTAMP:#{dtstamp}"
      last_modified = booking.updated_at.utc.strftime("%Y%m%dT%H%M%SZ")
      lines << "LAST-MODIFIED:#{last_modified}"

      lines << "DTSTART;VALUE=DATE:#{check_in.strftime('%Y%m%d')}"
      lines << "DTEND;VALUE=DATE:#{check_out.strftime('%Y%m%d')}"

      lines << "TRANSP:OPAQUE"
      lines << "SUMMARY:Booking for #{homestay.name}"
      lines << "END:VEVENT"
    end

    lines << "END:VCALENDAR"
    lines.join("\r\n")
  end
end

