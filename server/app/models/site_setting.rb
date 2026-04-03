class SiteSetting < ApplicationRecord
  validates :phone, :email, :instagram, :whatsapp_number, presence: true

  def self.instance
    first_or_create!(
      phone: "9743340477",
      email: "pranavadhau2003@gmail.com",
      instagram: "https://www.instagram.com/sacredhomes.in",
      address: "India",
      whatsapp_number: "9743340477"
    )
  end
end

