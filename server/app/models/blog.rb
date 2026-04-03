class Blog < ApplicationRecord
  has_one_attached :image, dependent: :purge_later

  validates :title, presence: true
  validates :content, presence: true

  scope :published, -> { where(is_published: true) }
end
