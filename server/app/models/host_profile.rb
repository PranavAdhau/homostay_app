class HostProfile < ApplicationRecord
  has_one_attached :image

  validates :role, presence: true, uniqueness: true, inclusion: { in: %w[host co_host] }
  validates :name, :bio, :contact, presence: true
  validates :phone, length: { maximum: 30 }, format: { with: /\A[+\d\s()-]*\z/, message: "is invalid" }, allow_blank: true
  validates :description, length: { maximum: 2000 }, allow_blank: true

  # Helper method to get or initialize the hosts to ensure they always exist for API payloads
  def self.ensure_exists(role)
    find_or_create_by!(role: role) do |p|
      if role == 'host'
        p.name = "Sacred Homes Host"
        p.bio = "Your local host in Varanasi."
        p.contact = "hello@thesacredhomes.com"
      else
        p.name = "Sacred Homes Co-Host"
        p.bio = "Helping make every stay comfortable."
        p.contact = "cohost@thesacredhomes.com"
      end
    end
  end
end
