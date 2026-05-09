class Admin::Api::V1::BlogsController < Admin::Api::V1::BaseController
  include Rails.application.routes.url_helpers

  before_action :set_blog, only: [:show, :update, :destroy]

  def index
    blogs = Blog.includes(image_attachment: :blob).order(created_at: :desc)
    render_success(data: blogs.map { |blog| serialize_blog(blog, include_details: true) })
  end

  def show
    render_success(data: serialize_blog(@blog, include_details: true))
  end

  def create
    blog = Blog.new(blog_params)

    if blog.save
      render_success(data: serialize_blog(blog, include_details: true), status: :created)
    else
      render_error(message: "Failed to create blog", errors: blog.errors.full_messages)
    end
  end

  def update
    if @blog.update(blog_params)
      render_success(data: serialize_blog(@blog, include_details: true))
    else
      render_error(message: "Failed to update blog", errors: @blog.errors.full_messages)
    end
  end

  def destroy
    if @blog.destroy
      render_success(message: "Blog deleted successfully")
    else
      render_error(message: "Failed to delete blog", errors: @blog.errors.full_messages)
    end
  end

  private

  def set_blog
    @blog = Blog.includes(image_attachment: :blob).find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error(message: "Blog not found", status: :not_found)
  end

  def blog_params
    raw_params = params.require(:blog).permit(
      :title,
      :content,
      :is_published,
      :image,
      :seo_summary,
      :featured_locality,
      :locality_tags_text,
      :nearby_landmark_tags_text,
      :faq_entries_text,
      related_homestay_ids: [],
      related_blog_ids: [],
    )

    raw_params.to_h.symbolize_keys.merge(
      Seo::ManagedContentParser.extract(raw_params.to_h.symbolize_keys, reject_blog_id: @blog&.id),
    ).except(
      :locality_tags_text,
      :nearby_landmark_tags_text,
      :faq_entries_text,
    )
  end

  def serialize_blog(blog, include_details: false)
    data = {
      id: blog.id,
      slug: blog.slug,
      title: blog.title,
      content: blog.content.to_s,
      image_url: blog.image.attached? ? url_for(blog.image) : nil,
      is_published: blog.is_published,
      created_at: blog.created_at,
      seo_summary: blog.seo_summary,
      featured_locality: blog.featured_locality,
      locality_tags: blog.normalized_locality_tags,
      nearby_landmark_tags: blog.normalized_nearby_landmark_tags,
      related_homestay_ids: blog.normalized_related_homestay_ids.map(&:to_i),
      related_blog_ids: blog.normalized_related_blog_ids.map(&:to_i),
      faq_entries: blog.normalized_faq_entries,
    }

    if include_details
      data[:updated_at] = blog.updated_at
    end

    data
  end
end
