class Api::V1::BlogsController < Api::V1::BaseController
  include Rails.application.routes.url_helpers

  before_action :set_blog, only: [:show]

  def index
    limit = params[:limit].to_i
    limit = 10 if limit <= 0
    limit = [limit, 50].min

    blogs = Blog.where(is_published: true)
      .includes(image_attachment: :blob)
      .order(created_at: :desc)
      .limit(limit)

    render_success(data: blogs.map { |blog| serialize_blog(blog) })
  end

  def show
    render_success(data: serialize_blog(@blog))
  end

  private

  def set_blog
    param_id = params[:id].to_s
    if param_id.match?(/^\d+$/)
      @blog = Blog.published.includes(image_attachment: :blob).find(params[:id])
    else
      @blog = Blog.published.includes(image_attachment: :blob).to_a.find do |b|
        b.slug == param_id
      end
      raise ActiveRecord::RecordNotFound unless @blog
    end
  rescue ActiveRecord::RecordNotFound
    render_error(message: "Blog not found", status: :not_found)
  end

  def serialize_blog(blog)
    {
      id: blog.id,
      slug: blog.slug,
      title: blog.title,
      content: blog.content.to_s,
      image_url: blog.image.attached? ? url_for(blog.image) : nil,
      created_at: blog.created_at,
      updated_at: blog.updated_at,
      seo_summary: blog.seo_summary,
      featured_locality: blog.featured_locality,
      locality_tags: blog.normalized_locality_tags,
      nearby_landmark_tags: blog.normalized_nearby_landmark_tags,
      related_homestay_ids: blog.normalized_related_homestay_ids.map(&:to_i),
      related_blog_ids: blog.normalized_related_blog_ids.map(&:to_i),
      faq_entries: blog.normalized_faq_entries,
    }
  end
end
