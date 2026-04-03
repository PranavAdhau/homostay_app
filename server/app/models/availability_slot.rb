class AvailabilitySlot < ApplicationRecord
  belongs_to :homestay
  belongs_to :booking, optional: true

  validates :start_datetime, presence: true
  validates :end_datetime, presence: true
  validate :end_after_start
  validate :no_overlap, on: :create

  scope :available, -> { where(booking_id: nil, is_blocked: false) }
  scope :locked, -> { where.not(booking_id: nil) }
  scope :blocked, -> { where(is_blocked: true) }

  private

  def end_after_start
    return unless start_datetime && end_datetime
    
    if end_datetime <= start_datetime
      errors.add(:end_datetime, "must be after start datetime")
    end
  end

def no_overlap
  return unless homestay && start_datetime && end_datetime

  overlapping = homestay.availability_slots
                        .where.not(id: id)
                        .where(
                          "start_datetime < ? AND end_datetime > ?",
                          end_datetime,
                          start_datetime
                        )

  if overlapping.exists?
    errors.add(:base, "Availability slot overlaps with existing slot")
  end
end
end
