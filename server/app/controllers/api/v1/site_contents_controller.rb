class Api::V1::SiteContentsController < Api::V1::BaseController
  include Rails.application.routes.url_helpers

  def show
    site_content = SiteContent.instance
    render_success(data: serialize(site_content))
  end

  private

  def serialize(site_content)
    {
      house_rules_pdf_url: blob_url(site_content.house_rules_pdf),
      cancellation_policy_pdf_url: blob_url(site_content.cancellation_policy_pdf),
      little_more_image_urls: blob_urls(site_content.little_more_images),
      host_property_image_urls: blob_urls(site_content.host_property_images),
      donation_percentage: site_content.donation_percentage,
      total_contribution_amount: site_content.total_contribution_amount
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
