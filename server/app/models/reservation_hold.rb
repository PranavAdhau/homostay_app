class ReservationHold < ApplicationRecord
  HOLD_DURATION = 5.minutes

  belongs_to :homestay
  belongs_to :booking, optional: true

  validates :check_in_date, presence: true
  validates :check_out_date, presence: true
  validates :expires_at, presence: true
  validates :token, presence: true, uniqueness: true
  validate :check_out_after_check_in

  scope :active, -> { where(released_at: nil).where("expires_at > ?", Time.current) }
  scope :expired, -> { where(released_at: nil).where("expires_at <= ?", Time.current) }
  scope :overlapping, lambda { |check_in, check_out|
    where("check_in_date < ? AND check_out_date > ?", check_out, check_in)
  }

  def active?
    released_at.nil? && expires_at.future?
  end

  def release!
    return if released_at.present?

    update!(released_at: Time.current)
  end

  private

  def check_out_after_check_in
    return unless check_in_date && check_out_date

    errors.add(:check_out_date, "must be after check_in date") if check_out_date <= check_in_date
  end
end
