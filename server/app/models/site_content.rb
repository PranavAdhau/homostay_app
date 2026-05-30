class SiteContent < ApplicationRecord
  has_one_attached :house_rules_pdf
  has_one_attached :cancellation_policy_pdf
  has_many_attached :little_more_images
  has_many_attached :host_property_images

  validate :single_row_only, on: :create
  validate :validate_pdf_types
  validate :validate_gallery_types
  validates :donation_percentage,
            numericality: { greater_than_or_equal_to: 0, only_integer: true },
            allow_nil: true
  validates :total_contribution_amount,
            numericality: { greater_than_or_equal_to: 0, only_integer: true },
            allow_nil: true

  def self.instance
    first_or_create!
  end

  private

  def single_row_only
    return unless self.class.exists?

    errors.add(:base, "Only one site content record is allowed")
  end

  def validate_pdf_types
    [house_rules_pdf, cancellation_policy_pdf].each do |file|
      next unless file.attached?
      next if file.blob.content_type == "application/pdf"

      errors.add(:base, "Only PDF files are allowed for policy documents")
    end
  end

  def validate_gallery_types
    (little_more_images.attachments + host_property_images.attachments).each do |attachment|
      next if attachment.blob.content_type.to_s.start_with?("image/")

      errors.add(:base, "Only image files are allowed for gallery uploads")
    end
  end
end
