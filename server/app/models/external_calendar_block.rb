class ExternalCalendarBlock < ApplicationRecord
  belongs_to :homestay

  validates :source, presence: true
  validates :external_uid, presence: true
  validates :starts_on, presence: true
  validates :ends_on, presence: true
  validates :last_seen_at, presence: true
  validate :ends_on_after_starts_on

  scope :for_source, ->(source) { where(source: source) }
  scope :future_or_current, -> { where("ends_on > ?", Date.current) }

  private

  def ends_on_after_starts_on
    return unless starts_on && ends_on

    errors.add(:ends_on, "must be after starts_on") if ends_on <= starts_on
  end
end
