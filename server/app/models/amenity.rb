class Amenity < ApplicationRecord
  has_many :homestay_amenities, dependent: :destroy
  has_many :homestays, through: :homestay_amenities

  validates :name, presence: true, uniqueness: true
end
