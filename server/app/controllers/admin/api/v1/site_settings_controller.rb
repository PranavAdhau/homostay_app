class Admin::Api::V1::SiteSettingsController < Admin::Api::V1::BaseController
  def show
    settings = SiteSetting.instance
    render_success(data: serialize(settings))
  end

  def update
    settings = SiteSetting.instance

    if settings.update(site_setting_params)
      render_success(data: serialize(settings))
    else
      render_error(message: "Failed to update settings", errors: settings.errors.full_messages)
    end
  end

  private

  def site_setting_params
    params.require(:site_setting).permit(:phone, :email, :instagram, :address, :whatsapp_number)
  end

  def serialize(settings)
    {
      phone: settings.phone,
      email: settings.email,
      instagram: settings.instagram,
      address: settings.address,
      whatsapp_number: settings.whatsapp_number
    }
  end
end

