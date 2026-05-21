class Booking < ApplicationRecord
  include BookingLifecycle

  belongs_to :homestay
  has_many :availability_slots, dependent: :destroy
  has_one :reservation_hold, dependent: :destroy

  # ----------------------------
  # VALIDATIONS
  # ----------------------------

  validates :guest_name, presence: true
  validates :guest_email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :guest_phone, presence: true
  validates :check_in_date, presence: true
  validates :check_out_date, presence: true
  validates :number_of_guests, presence: true, numericality: { greater_than: 0 }
  validates :total_price, presence: true, numericality: { greater_than: 0 }

  validate :must_be_future_dated
  validate :check_out_after_check_in
  validate :dates_must_be_available

  # ----------------------------
  # ENUMS
  # ----------------------------

  enum :source, {
    website: 0,
    airbnb: 1,
    manual: 2
  }

  enum :status, {
    pending: 0,
    approved: 1,
    confirmed: 2,
    rejected: 3,
    completed: 4
  }

  # ----------------------------
  # CALLBACKS
  # ----------------------------

  after_commit :send_notifications_after_commit

  # ----------------------------
  # DATE HELPERS
  # ----------------------------

  def check_in_datetime
    check_in_date.beginning_of_day
  end

  def check_out_datetime
    check_out_date.end_of_day
  end

  def finalized?
    approved? || confirmed?
  end

  private

  # ----------------------------
  # AVAILABILITY VALIDATION
  # ----------------------------

  def dates_must_be_available
    return unless homestay && check_in_date && check_out_date

    if BookingAvailability::OverlapChecker.new(
      homestay: homestay,
      check_in_date: check_in_date,
      check_out_date: check_out_date,
      booking_to_ignore: self
    ).conflict?
      errors.add(:base, "Selected dates are already booked")
    end
  end

  # ----------------------------
  # DATE VALIDATIONS
  # ----------------------------

  def must_be_future_dated
    return unless check_in_date

    today = Date.current

    if check_in_date < today
      errors.add(:check_in_date, "must be today or later")
    end
  end

  def check_out_after_check_in
    return unless check_in_date && check_out_date

    if check_out_date <= check_in_date
      errors.add(:check_out_date, "must be after check-in date")
    end
  end

  # ----------------------------
  # NOTIFICATIONS
  # ----------------------------

  def send_notifications_after_commit
    if previous_changes.key?("id") && status == "pending"
      notify_owner
    elsif previous_changes.key?("status")
      case status
      when "approved"
        notify_user_confirmation
      when "rejected"
        notify_user_rejection
      end
    end
  end

  def notify_owner
    return if whatsapp_message_sent?

    WhatsappBookingJob.perform_later(self)
  end

  def notify_user_confirmation
    WhatsappUserConfirmationJob.perform_later(self)
  end

  def notify_user_rejection
    WhatsappUserRejectionJob.perform_later(self)
  end
end
