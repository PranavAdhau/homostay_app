class Api::V1::HomestaysController < Api::V1::BaseController
  include Rails.application.routes.url_helpers
  
  before_action :set_homestay, only: [:show, :availability]

  def index
    filters = build_search_filters
    return if performed?

    homestays = Homestay.search(filters)

    render_success(
      data: homestays.map { |h| serialize_homestay(h) }
    )
  end

  def show
    render_success(data: serialize_homestay(@homestay, include_details: true))
  end

  def availability
    start_date = params[:start_date] ? Date.parse(params[:start_date]) : Date.today
    end_date = params[:end_date] ? Date.parse(params[:end_date]) : 3.months.from_now.to_date

    available_dates = @homestay.available_dates(start_date, end_date)
    unavailable_dates = (start_date..end_date).to_a - available_dates

    time_slots = {}

    render_success(
      data: {
        available_dates: available_dates.map(&:to_s),
        unavailable_dates: unavailable_dates.map(&:to_s),
        time_slots: time_slots
      }
    )
  rescue ArgumentError => e
    render_error(message: "Invalid date format: #{e.message}", status: :bad_request)
  end

  private

  def build_search_filters
    check_in = parse_date_param(:check_in)
    check_out = parse_date_param(:check_out)
    guests = parse_positive_integer_param(:guests)
    rooms = parse_positive_integer_param(:rooms)

    if performed?
      return {}
    end

    if check_in.present? && check_out.present? && check_out <= check_in
      render_error(message: "check_out must be after check_in", status: :bad_request)
      return {}
    end

    {
      check_in: check_in,
      check_out: check_out,
      guests: guests,
      rooms: rooms,
    }
  end

  def parse_date_param(key)
    raw_value = params[key]
    return nil if raw_value.blank?

    Date.iso8601(raw_value)
  rescue ArgumentError
    render_error(message: "Invalid #{key} date format", status: :bad_request)
    nil
  end

  def parse_positive_integer_param(key)
    raw_value = params[key]
    return nil if raw_value.blank?

    value = Integer(raw_value, 10)
    raise ArgumentError unless value.positive?

    value
  rescue ArgumentError
    render_error(message: "#{key} must be a positive integer", status: :bad_request)
    nil
  end

  def set_homestay
    @homestay = Homestay.active.find_by!(slug: params[:id]) || Homestay.active.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error(message: "Homestay not found", status: :not_found)
  end

  def serialize_homestay(homestay, include_details: false)
    data = {
      id: homestay.id,
      slug: homestay.slug,
      name: homestay.name,
      description: homestay.description.to_s,
      capacity: homestay.capacity,
      rooms: homestay.rooms,
      size: homestay.size,
      price_per_night: homestay.price_per_night.to_f,
      latitude: homestay.latitude,
      longitude: homestay.longitude,
      address: homestay.address,
      seo_summary: homestay.seo_summary,
      seo_locality_focus: homestay.seo_locality_focus,
      locality_tags: homestay.normalized_locality_tags,
      nearby_landmark_tags: homestay.normalized_nearby_landmark_tags,
      related_blog_ids: homestay.normalized_related_blog_ids.map(&:to_i),
      related_homestay_ids: homestay.normalized_related_homestay_ids.map(&:to_i),
      faq_entries: homestay.normalized_faq_entries,
      amenities: homestay.amenities.map { |a| { id: a.id, name: a.name, icon_name: a.icon_name } },
      images: homestay.images.map { |img| rails_blob_url(img, only_path: false) },
      featured_image: homestay.featured_image.attached? ? rails_blob_url(homestay.featured_image, only_path: false) : nil
    }

    if include_details
      data.merge!({
        is_active: homestay.is_active,
        created_at: homestay.created_at,
        updated_at: homestay.updated_at
      })
    end

    data
  end
end
