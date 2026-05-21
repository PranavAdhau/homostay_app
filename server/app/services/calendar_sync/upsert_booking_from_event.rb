module CalendarSync
  class UpsertBookingFromEvent
    def self.call(homestay, event)
      new(homestay, event).call
    end

    def initialize(homestay, event)
      @homestay = homestay
      @event = event
    end

    def call
      return if event[:end_on] <= Date.current

      block = ExternalCalendarBlock.lock.where(
        homestay_id: homestay.id,
        source: "airbnb",
        external_uid: event[:uid]
      ).first_or_initialize

      block.assign_attributes(
        starts_on: event[:start_on],
        ends_on: event[:end_on],
        summary: event[:summary],
        description: event[:description],
        dtstamp: event[:dtstamp],
        last_seen_at: Time.current
      )
      block.save!
    end

    private

    attr_reader :homestay, :event
  end
end

