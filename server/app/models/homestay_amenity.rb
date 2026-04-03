class HomestayAmenity < ApplicationRecord
  belongs_to :homestay
  belongs_to :amenity

  validates :homestay_id, uniqueness: { scope: :amenity_id }
end
