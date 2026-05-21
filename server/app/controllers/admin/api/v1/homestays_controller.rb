class Admin::Api::V1::HomestaysController < Admin::Api::V1::BaseController
  include Rails.application.routes.url_helpers
  
  before_action :set_homestay, only: [:show, :update, :destroy, :sync_calendar]

  def index
    homestays = Homestay.all.includes(:amenities, images_attachments: :blob)
    render_success(data: homestays.map { |h| serialize_homestay(h, include_details: true) })
  end

  def show
    render_success(data: serialize_homestay(@homestay, include_details: true))
  end

  def create
    homestay = Homestay.new(homestay_params.except(:google_maps_url))
    apply_location_from_params(homestay)

    if homestay.errors.empty? && homestay.save
      update_amenities(homestay)
      render_success(data: serialize_homestay(homestay, include_details: true), status: :created)
    else
      render_error(message: "Failed to create homestay", errors: homestay.errors.full_messages)
    end
  end

  def update
    @homestay.assign_attributes(homestay_params.except(:google_maps_url))
    apply_location_from_params(@homestay)

    if @homestay.errors.empty? && @homestay.save
      update_amenities(@homestay)
      render_success(data: serialize_homestay(@homestay, include_details: true))
    else
      render_error(message: "Failed to update homestay", errors: @homestay.errors.full_messages)
    end
  end

  def destroy
    if @homestay.destroy
      render_success(message: "Homestay deleted successfully")
    else
      render_error(message: "Failed to delete homestay", errors: @homestay.errors.full_messages)
    end
  end

  def sync_calendar
    if @homestay.airbnb_ical_url.blank? || !@homestay.calendar_sync_enabled?
      return render_error(
        message: "Add a valid Airbnb calendar before retrying sync",
        status: :unprocessable_entity
      )
    end

    if sync_in_progress?(@homestay)
      return render_success(
        data: serialize_homestay(@homestay.reload, include_details: true),
        message: "Calendar sync is already in progress"
      )
    end

    CalendarSyncJob.perform_later(@homestay.id, trigger: "manual_retry")
    render_success(
      data: serialize_homestay(@homestay.reload, include_details: true),
      message: "Calendar sync started"
    )
  end

  private

  def set_homestay
    @homestay = Homestay.find(params[:id])
  end

  def homestay_params
    raw_params = params.require(:homestay).permit(
      :name,
      :description,
      :capacity,
      :rooms,
      :size,
      :price_per_night,
      :is_active,
      :seo_summary,
      :seo_locality_focus,
      :airbnb_ical_url,
      :calendar_sync_enabled,
      :latitude,
      :longitude,
      :address,
      :google_maps_url,
      :locality_tags_text,
      :nearby_landmark_tags_text,
      :faq_entries_text,
      :featured_image,
      related_blog_ids: [],
      related_homestay_ids: [],
      images: [],
    )

    permitted_hash = raw_params.to_h.deep_symbolize_keys

    permitted_hash.merge(
      Seo::ManagedContentParser.extract(
        {
          seo_summary: permitted_hash[:seo_summary],
          locality_tags_text: permitted_hash[:locality_tags_text],
          nearby_landmark_tags_text: permitted_hash[:nearby_landmark_tags_text],
          faq_entries_text: permitted_hash[:faq_entries_text],
        },
        reject_homestay_id: @homestay&.id,
      ),
    ).tap do |attrs|
      attrs[:related_blog_ids] = raw_params[:related_blog_ids]
      attrs[:related_homestay_ids] = raw_params[:related_homestay_ids]
    end.except(
      :locality_tags_text,
      :nearby_landmark_tags_text,
      :faq_entries_text,
    )
  end

  def apply_location_from_params(homestay)
    homestay_attrs = params[:homestay] || {}

    raw_lat = homestay_attrs[:latitude] || homestay_attrs["latitude"]
    raw_lng = homestay_attrs[:longitude] || homestay_attrs["longitude"]
    maps_url = homestay_attrs[:google_maps_url] || homestay_attrs["google_maps_url"]

    if raw_lat.present? && raw_lng.present?
      lat = raw_lat.to_f
      lng = raw_lng.to_f

      if lat.between?(-90, 90) && lng.between?(-180, 180)
        homestay.latitude = lat
        homestay.longitude = lng
        address = homestay_attrs[:address] || homestay_attrs["address"]
        homestay.address = address if address.present?
      else
        homestay.errors.add(:base, "Latitude/Longitude are out of range")
      end
    elsif maps_url.present?
      coords = GoogleMapsUrlParser.call(maps_url)
      if coords
        homestay.latitude, homestay.longitude = coords
        address = homestay_attrs[:address] || homestay_attrs["address"]
        homestay.address = address if address.present?
      else
        homestay.errors.add(:base, "Could not extract coordinates from Google Maps URL")
      end
    end
  end

  def update_amenities(homestay)
    return unless params[:homestay][:amenity_ids]

    amenity_ids = params[:homestay][:amenity_ids].reject(&:blank?)
    homestay.amenity_ids = amenity_ids
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
      is_active: homestay.is_active,
      airbnb_ical_url: homestay.airbnb_ical_url,
      calendar_sync_enabled: homestay.calendar_sync_enabled,
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
      sync_state = sync_state_for(homestay)
      data.merge!({
        last_calendar_sync_at: homestay.last_calendar_sync_at,
        last_calendar_sync_success_at: homestay.last_calendar_sync_success_at,
        sync_error_count: homestay.sync_error_count,
        last_calendar_sync_error: homestay.last_calendar_sync_error,
        sync_state: sync_state,
        sync_state_label: sync_state_label_for(sync_state),
        sync_state_message: sync_state_message_for(homestay, sync_state),
        created_at: homestay.created_at,
        updated_at: homestay.updated_at
      })
    end

    data
  end

  def sync_in_progress?(homestay)
    Infrastructure::RedisLock.exists?(CalendarSync::FreshnessPolicy.sync_lock_key(homestay.id))
  rescue Redis::BaseError, IOError, SystemCallError
    false
  end

  def sync_state_for(homestay)
    return "syncing" if sync_in_progress?(homestay)
    return "disabled" unless homestay.calendar_sync_enabled?
    return "error" if homestay.last_calendar_sync_error.present?
    return "stale" if CalendarSync::FreshnessPolicy.stale?(homestay)

    "healthy"
  end

  def sync_state_label_for(sync_state)
    {
      "syncing" => "Sync in progress",
      "error" => "Calendar connection issue",
      "stale" => "Availability may be outdated",
      "disabled" => "Sync disabled",
      "healthy" => "Synced recently"
    }.fetch(sync_state, "Synced recently")
  end

  def sync_state_message_for(homestay, sync_state)
    case sync_state
    when "syncing"
      "We’re refreshing Airbnb availability now."
    when "error"
      homestay.last_calendar_sync_error.presence || "We couldn’t refresh this calendar recently."
    when "stale"
      "Availability may be outdated. Retry sync before confirming bookings."
    when "disabled"
      "Airbnb calendar sync is currently turned off."
    else
      "Calendar synced successfully."
    end
  end
end
