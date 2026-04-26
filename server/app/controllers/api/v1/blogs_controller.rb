class Api::V1::BlogsController < Api::V1::BaseController
  include Rails.application.routes.url_helpers

  before_action :set_blog, only: [:show]

  def index
    blogs = Blog.where(is_published: true)
      .includes(image_attachment: :blob)
      .order(created_at: :desc)
      .limit(10)

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
      created_at: blog.created_at
    }
  end
end
