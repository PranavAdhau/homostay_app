class Api::V1::HostProfilesController < Api::V1::BaseController
  include Rails.application.routes.url_helpers

  def show
    host = HostProfile.ensure_exists('host')
    co_host = HostProfile.ensure_exists('co_host')
    render_success(data: serialize(host, co_host))
  end

  private

  def serialize(host, co_host)
    {
      host_name: host.name,
      host_bio: host.bio,
      host_description: host.description,
      host_contact: host.contact,
      host_phone: host.phone,
      co_host_name: co_host.name,
      co_host_bio: co_host.bio,
      co_host_description: co_host.description,
      co_host_contact: co_host.contact,
      co_host_phone: co_host.phone,
      host_image_url: blob_url(host.image),
      co_host_image_url: blob_url(co_host.image)
    }
  end

  def blob_url(attachment)
    return nil unless attachment.attached?

    rails_blob_url(attachment, only_path: false)
  end
end

