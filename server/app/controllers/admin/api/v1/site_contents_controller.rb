class Admin::Api::V1::SiteContentsController < Admin::Api::V1::BaseController
  include Rails.application.routes.url_helpers

  def show
    site_content = SiteContent.instance
    render_success(data: serialize(site_content))
  end

  def update
    site_content = SiteContent.instance

    if site_content.update(site_content_params)
      render_success(data: serialize(site_content))
    else
      render_error(message: "Failed to update site content", errors: site_content.errors.full_messages)
    end
  end

  private

  def site_content_params
    params.require(:site_content).permit(
      :house_rules_pdf,
      :cancellation_policy_pdf,
      little_more_images: [],
      host_property_images: []
    )
  end

  def serialize(site_content)
    {
      house_rules_pdf_url: blob_url(site_content.house_rules_pdf),
      cancellation_policy_pdf_url: blob_url(site_content.cancellation_policy_pdf),
      little_more_image_urls: blob_urls(site_content.little_more_images),
      host_property_image_urls: blob_urls(site_content.host_property_images)
    }
  end

  def blob_url(attachment)
    return nil unless attachment.attached?

    rails_blob_url(attachment, only_path: false)
  end

  def blob_urls(attachments)
    attachments.map { |attachment| rails_blob_url(attachment, only_path: false) }
  end
end
