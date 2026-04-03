class Api::V1::SiteSettingsController < Api::V1::BaseController
  def show
    settings = SiteSetting.instance

    render_success(data: serialize(settings))
  end

  private

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

