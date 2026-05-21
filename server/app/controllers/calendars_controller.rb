require "icalendar"

class CalendarsController < ApplicationController
  def show
    homestay = Homestay.find(params[:homestay_id])

    bookings = homestay.bookings
                       .unscope(:order)
                       .where(status: %i[approved confirmed])
                       .select(:id, :homestay_id, :check_in_date, :check_out_date, :updated_at)
    manual_blocks = homestay.availability_slots
                           .manual_blocks
                           .select(:id, :start_datetime, :end_datetime, :updated_at)

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

    contiguous_manual_ranges(manual_blocks).each do |start_date, end_date, updated_at, source_id|
      calendar.event do |event|
        event.uid = "manual-block-#{homestay.id}-#{source_id}-#{start_date}-#{end_date}@#{ical_domain}"
        event.dtstamp = updated_at.utc
        event.last_modified = updated_at.utc
        event.dtstart = Icalendar::Values::Date.new(start_date)
        event.dtend = Icalendar::Values::Date.new(end_date)
        event.summary = "Not available"
        event.transp = "OPAQUE"
      end
    end

    calendar.publish
    calendar.to_ical
  end

  def contiguous_manual_ranges(manual_blocks)
    dates = manual_blocks.map { |slot| [slot.start_datetime.to_date, slot.updated_at, slot.id] }.sort_by(&:first)
    return [] if dates.empty?

    ranges = []
    range_start = dates.first[0]
    range_end = range_start + 1.day
    range_updated_at = dates.first[1]
    range_id = dates.first[2]

    dates.drop(1).each do |date, updated_at, slot_id|
      if date == range_end
        range_end = date + 1.day
        range_updated_at = [range_updated_at, updated_at].compact.max
      else
        ranges << [range_start, range_end, range_updated_at, range_id]
        range_start = date
        range_end = date + 1.day
        range_updated_at = updated_at
        range_id = slot_id
      end
    end

    ranges << [range_start, range_end, range_updated_at, range_id]
    ranges
  end

  def ical_domain
    ENV["ICAL_DOMAIN"].presence || request.host || "thesacredhomes.com"
  end
end
