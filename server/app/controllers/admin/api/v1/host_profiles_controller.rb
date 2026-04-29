class Admin::Api::V1::HostProfilesController < Admin::Api::V1::BaseController
  include Rails.application.routes.url_helpers

  def show
    host = HostProfile.ensure_exists('host')
    co_host = HostProfile.ensure_exists('co_host')
    render_success(data: serialize(host, co_host))
  end

  def update
    role = params[:host_profile][:role]
    if %w[host co_host].include?(role)
      profile = HostProfile.find_by(role: role)
      if profile.update(host_profile_params)
        host = HostProfile.ensure_exists('host')
        co_host = HostProfile.ensure_exists('co_host')
        render_success(data: serialize(host, co_host))
      else
        render_error(message: "Failed to update host profile", errors: profile.errors.full_messages)
      end
    else
      render_error(message: "Invalid role specified", errors: ["Role must be host or co_host"])
    end
  end

  private

  def host_profile_params
    params.require(:host_profile).permit(:name, :bio, :contact, :image)
  end

  def serialize(host, co_host)
    {
      host_name: host.name,
      host_bio: host.bio,
      host_contact: host.contact,
      co_host_name: co_host.name,
      co_host_bio: co_host.bio,
      co_host_contact: co_host.contact,
      host_image_url: blob_url(host.image),
      co_host_image_url: blob_url(co_host.image)
    }
  end

  def blob_url(attachment)
    return nil unless attachment.attached?

    rails_blob_url(attachment, only_path: false)
  end
end

