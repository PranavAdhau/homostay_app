class HomestaySlugRedirect < ApplicationRecord
  belongs_to :homestay

  validates :slug, presence: true, uniqueness: true
end
