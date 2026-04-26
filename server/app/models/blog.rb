class Blog < ApplicationRecord
  has_one_attached :image, dependent: :purge_later

  validates :title, presence: true
  validates :content, presence: true

  scope :published, -> { where(is_published: true) }

  def slug
    base_slug = title.to_s.parameterize
    return base_slug if new_record?

    older_duplicates = Blog.where(title: title).where("id < ?", id).count
    if older_duplicates > 0
      "#{base_slug}-#{older_duplicates + 1}"
    else
      base_slug
    end
  end
end
