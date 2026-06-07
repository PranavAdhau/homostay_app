module InventoryCalendarSerialization
  extend ActiveSupport::Concern

  SOURCE_DEFINITIONS = {
    "booking" => {
      label: "Website Booking",
      badge_color: "bg-primary/10 text-primary",
      tooltip: "Dates blocked by an approved booking."
    },
    "airbnb_sync" => {
      label: "Airbnb Reservation",
      badge_color: "bg-warning/10 text-warning",
      tooltip: "Dates blocked by the latest Airbnb calendar import."
    },
    "manual_lock" => {
      label: "Manual Lock",
      badge_color: "bg-destructive/10 text-destructive",
      tooltip: "Dates blocked manually by an admin."
    }
  }.freeze

  private

  def serialize_calendar_inventory(homestay, start_date, end_date)
    events = []
    homestay.bookings.where(status: :approved)
            .where("check_in_date < ? AND check_out_date > ?", end_date, start_date)
            .order(:check_in_date)
            .each do |booking|
      events << serialize_booking_event(booking)
    end

    homestay.external_calendar_blocks.future_or_current
            .where("starts_on < ? AND ends_on > ?", end_date, start_date)
            .order(:starts_on)
            .each do |block|
      events << serialize_external_block_event(homestay, block)
    end

    homestay.manual_inventory_blocks.active
            .where("starts_on < ? AND ends_on > ?", end_date, start_date)
            .order(:starts_on)
            .each do |block|
      events << serialize_manual_block_event(block)
    end

    {
      homestay: {
        id: homestay.id,
        name: homestay.name,
        slug: homestay.slug,
        sync_enabled: homestay.calendar_sync_enabled
      },
      visible_range: {
        start_date: start_date.to_s,
        end_date: end_date.to_s
      },
      source_definitions: SOURCE_DEFINITIONS,
      events: events.sort_by { |event| [event[:start_date], event[:source], event[:title]] }
    }
  end

  def serialize_manual_block_event(block)
    serialize_event(
      source: "manual_lock",
      source_id: block.id,
      title: "Manual Lock",
      homestay: block.homestay,
      start_date: block.starts_on,
      end_date: block.ends_on,
      reason: block.reason,
      notes: block.notes,
      created_by: block.created_by_admin_user&.email,
      created_at: block.created_at,
      unlockable: block.active?,
      booking_reference: nil
    )
  end

  def serialize_external_block_event(homestay, block)
    serialize_event(
      source: "airbnb_sync",
      source_id: block.id,
      title: block.summary.presence || "Airbnb Reservation",
      homestay: homestay,
      start_date: block.starts_on,
      end_date: block.ends_on,
      reason: nil,
      notes: block.description,
      created_by: "Airbnb Sync",
      created_at: block.created_at,
      unlockable: false,
      booking_reference: nil
    )
  end

  def serialize_booking_event(booking)
    title = booking.source == "manual" ? "Admin Booking ##{booking.id}" : "Website Booking ##{booking.id}"
    created_by = booking.source == "manual" ? "Admin Booking" : "Website Booking"

    serialize_event(
      source: "booking",
      source_id: booking.id,
      title: title,
      homestay: booking.homestay,
      start_date: booking.check_in_date,
      end_date: booking.check_out_date,
      reason: booking.status,
      notes: nil,
      created_by: created_by,
      created_at: booking.created_at,
      unlockable: false,
      booking_reference: booking.id
    )
  end

  def serialize_event(source:, source_id:, title:, homestay:, start_date:, end_date:, reason:, notes:, created_by:, created_at:, unlockable:, booking_reference:)
    {
      id: "#{source}-#{source_id}",
      source: source,
      title: title,
      start_date: start_date.to_s,
      end_date: end_date.to_s,
      reason: reason,
      reason_label: reason.present? ? human_reason(reason) : nil,
      notes: notes,
      created_by: created_by,
      created_at: created_at,
      unlockable: unlockable,
      booking_reference: booking_reference,
      blocking_sources: blocking_sources_for_range(
        homestay: homestay,
        start_date: start_date,
        end_date: end_date,
        current_source: source,
        current_id: source_id,
        current_reason: reason
      )
    }
  end

  def blocking_sources_for_range(homestay:, start_date:, end_date:, current_source:, current_id:, current_reason:)
    checker = BookingAvailability::OverlapChecker.new(
      homestay: homestay,
      check_in_date: start_date,
      check_out_date: end_date,
      booking_to_ignore: current_source == "booking" ? homestay.bookings.find_by(id: current_id) : nil,
      manual_inventory_block_to_ignore: current_source == "manual_lock" ? homestay.manual_inventory_blocks.find_by(id: current_id) : nil,
      consider_holds: false
    )

    current_label = SOURCE_DEFINITIONS.fetch(current_source, {}).fetch(:label, current_source.humanize)
    sources = [
      {
        id: current_id,
        source: current_source,
        label: current_source == "booking" ? "#{current_label} ##{current_id}" : current_label,
        reason: current_reason
      }
    ]

    sources.concat(
      checker.blocking_sources(include_holds: false).reject do |source|
        source[:source] == current_source && source[:id] == current_id
      end
    )

    sources.uniq { |source| "#{source[:source]}-#{source[:id]}" }
  end

  def human_reason(reason)
    reason.to_s.tr("_", " ").split.map(&:capitalize).join(" ")
  end
end
