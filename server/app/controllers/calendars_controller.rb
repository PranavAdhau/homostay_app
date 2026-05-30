require "icalendar"

class CalendarsController < ApplicationController
  def show
    homestay = Homestay.find(params[:homestay_id])

    bookings = homestay.bookings
                       .unscope(:order)
                       .where(status: %i[approved confirmed])
                       .select(:id, :homestay_id, :check_in_date, :check_out_date, :updated_at)
    manual_blocks = homestay.manual_inventory_blocks
                           .active
                           .select(:id, :starts_on, :ends_on, :updated_at)

    last_updated = [
      bookings.maximum(:updated_at),
      manual_blocks.maximum(:updated_at),
      homestay.updated_at
    ].compact.max

    fresh_when(
      etag: [homestay.id, last_updated],
      last_modified: last_updated,
      public: true
    )
    return if performed?

    response.headers["Cache-Control"] = "public, max-age=300"
    render plain: build_ics(homestay, bookings, manual_blocks), content_type: "text/calendar"
  end

  private

  def build_ics(homestay, bookings, manual_blocks)
    calendar = Icalendar::Calendar.new
    calendar.prodid = "-//Sacred Homes//Availability Calendar//EN"
    calendar.version = "2.0"
    calendar.calscale = "GREGORIAN"

    bookings.each do |booking|
      calendar.event do |event|
        event.uid = "booking-#{booking.id}-homestay-#{booking.homestay_id}@#{ical_domain}"
        event.dtstamp = booking.updated_at.utc
        event.last_modified = booking.updated_at.utc
        event.dtstart = Icalendar::Values::Date.new(booking.check_in_date)
        event.dtend = Icalendar::Values::Date.new(booking.check_out_date)
        event.summary = "Reserved"
        event.transp = "OPAQUE"
      end
    end

    manual_blocks.each do |block|
      calendar.event do |event|
        event.uid = "manual-block-#{homestay.id}-#{block.id}-#{block.starts_on}-#{block.ends_on}@#{ical_domain}"
        event.dtstamp = block.updated_at.utc
        event.last_modified = block.updated_at.utc
        event.dtstart = Icalendar::Values::Date.new(block.starts_on)
        event.dtend = Icalendar::Values::Date.new(block.ends_on)
        event.summary = "Not available"
        event.transp = "OPAQUE"
      end
    end

    calendar.publish
    calendar.to_ical
  end

  def ical_domain
    ENV["ICAL_DOMAIN"].presence || request.host || "thesacredhomes.com"
  end
end
