class ManualInventoryBlock < ApplicationRecord
  REASONS = %w[maintenance owner_stay offline_booking emergency_closure other].freeze

  belongs_to :homestay
  belongs_to :created_by_admin_user, class_name: "AdminUser", optional: true
  belongs_to :unlocked_by_admin_user, class_name: "AdminUser", optional: true

  validates :starts_on, presence: true
  validates :ends_on, presence: true
  validates :reason, presence: true, inclusion: { in: REASONS }
  validates :created_by_admin_user, presence: true, on: :create
  validate :ends_on_after_starts_on
  validate :dates_must_remain_available, on: :create

  scope :active, -> { where(unlocked_at: nil) }
  scope :overlapping, lambda { |start_date, end_date|
    where("starts_on < ? AND ends_on > ?", end_date, start_date)
  }

  def active?
    unlocked_at.nil?
  end

  def unlock!(admin_user:)
    return if unlocked_at.present?

    update!(
      unlocked_at: Time.current,
      unlocked_by_admin_user: admin_user
    )
  end

  private

  def ends_on_after_starts_on
    return unless starts_on && ends_on

    errors.add(:ends_on, "must be after starts_on") if ends_on <= starts_on
  end

  def dates_must_remain_available
    return unless homestay && starts_on && ends_on

    if BookingAvailability::OverlapChecker.new(
      homestay: homestay,
      check_in_date: starts_on,
      check_out_date: ends_on,
      manual_inventory_block_to_ignore: self,
      consider_holds: false
    ).conflict?
      errors.add(:base, "Selected dates are already blocked")
    end
  end
end
