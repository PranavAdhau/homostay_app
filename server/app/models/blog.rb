class Blog < ApplicationRecord
  include SeoContentFields

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

  def published_related_blogs
    Blog.published.where(id: normalized_related_blog_ids)
  end

  def active_related_homestays
    Homestay.active.where(id: normalized_related_homestay_ids)
  end
end
