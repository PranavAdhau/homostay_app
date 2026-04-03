class Homestay < ApplicationRecord

  has_many :bookings, dependent: :destroy
  has_many :availability_slots, dependent: :destroy
  has_many :homestay_amenities, dependent: :destroy
  has_many :amenities, through: :homestay_amenities

  has_many_attached :images
  has_one_attached :featured_image

  # has_rich_text :description

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true
  validates :capacity, presence: true, numericality: { greater_than: 0 }
  validates :rooms, presence: true, numericality: { only_integer: true, greater_than: 0 }
  validates :price_per_night, presence: true, numericality: { greater_than: 0 }

  validates :latitude, numericality: true, allow_nil: true
  validates :longitude, numericality: true, allow_nil: true

  validates :airbnb_ical_url,
            format: { with: URI::DEFAULT_PARSER.make_regexp, message: "must be a valid URL" },
            allow_blank: true

  validate :airbnb_calendar_requires_url
  validate :airbnb_ical_must_be_ics

  before_validation :generate_slug, on: :create

  scope :active, -> { where(is_active: true) }
  scope :with_min_capacity, lambda { |guests|
    if guests.present? && guests.to_i.positive?
      where("capacity >= ?", guests.to_i)
    else
      all
    end
  }
  scope :with_min_rooms, lambda { |rooms_count|
    if rooms_count.present? && rooms_count.to_i.positive?
      where("rooms >= ?", rooms_count.to_i)
    else
      all
    end
  }
  scope :excluding_conflicts, lambda { |check_in, check_out|
    unless check_in.present? && check_out.present? && check_out > check_in
      next all
    end

    where.not(id: conflicting_booking_homestay_ids(check_in, check_out))
      .where.not(id: conflicting_slot_homestay_ids(check_in, check_out))
  }

  # -------------------------------------------------
  # AVAILABILITY LOGIC
  # -------------------------------------------------

  def available_dates(start_date, end_date)
    return [] unless start_date && end_date

    requested_dates = (start_date...end_date).to_a

    unavailable_slots = availability_slots
      .where(
        "start_datetime < ? AND end_datetime > ?",
        end_date.beginning_of_day,
        start_date.beginning_of_day
      )
      .where("booking_id IS NOT NULL OR is_blocked = TRUE")

    unavailable_dates = unavailable_slots.map do |slot|
      slot.start_datetime.to_date
    end

    requested_dates - unavailable_dates
  end

  # Hour-based booking removed
  def available_time_slots(date)
    []
  end

  def self.search(filters = {})
    includes(:amenities, images_attachments: :blob, featured_image_attachment: :blob)
      .active
      .with_min_capacity(filters[:guests])
      .with_min_rooms(filters[:rooms])
      .excluding_conflicts(filters[:check_in], filters[:check_out])
  end

  private

  def self.conflicting_booking_homestay_ids(check_in, check_out)
    Booking
      .where(status: %i[approved confirmed])
      .where(
        "check_in_date < ? AND check_out_date > ?",
        check_out,
        check_in
      )
      .select(:homestay_id)
  end

  def self.conflicting_slot_homestay_ids(check_in, check_out)
    AvailabilitySlot
      .where(
        "start_datetime < ? AND end_datetime > ?",
        check_out.beginning_of_day,
        check_in.beginning_of_day
      )
      .where("booking_id IS NOT NULL OR is_blocked = ?", true)
      .select(:homestay_id)
  end

  # -------------------------------------------------
  # AIRBNB CALENDAR VALIDATIONS
  # -------------------------------------------------

  def airbnb_calendar_requires_url
    if calendar_sync_enabled && airbnb_ical_url.blank?
      errors.add(:airbnb_ical_url, "is required when calendar sync is enabled")
    end
  end

  def airbnb_ical_must_be_ics
    return if airbnb_ical_url.blank?

    unless airbnb_ical_url.to_s.strip.downcase.ends_with?(".ics")
      errors.add(:airbnb_ical_url, "must end with .ics")
    end
  end

  # -------------------------------------------------
  # SLUG GENERATION
  # -------------------------------------------------

  def generate_slug
    return if slug.present?

    base_slug = name.parameterize
    candidate_slug = base_slug
    counter = 1

    while Homestay.exists?(slug: candidate_slug)
      candidate_slug = "#{base_slug}-#{counter}"
      counter += 1
    end

    self.slug = candidate_slug
  end

end
