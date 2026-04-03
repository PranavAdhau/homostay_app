class Admin::Api::V1::AmenitiesController < Admin::Api::V1::BaseController
  def index
    amenities = Amenity.all.order(:name)
    render_success(data: amenities.map { |a| { id: a.id, name: a.name, icon_name: a.icon_name } })
  end
end
