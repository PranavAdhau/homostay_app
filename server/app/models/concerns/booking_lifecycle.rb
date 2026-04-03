module BookingLifecycle
  extend ActiveSupport::Concern

  included do
    after_update :handle_status_change, if: :saved_change_to_status?
  end

  # ----------------------------
  # STATE TRANSITIONS
  # ----------------------------

  def approve!
    return false unless pending?

    transaction do
      homestay.with_lock do
        return false unless validate_availability_for_approval
        update!(status: :approved)
      end
    end
  end

  def reject!
    return false unless pending? || approved?

    transaction do
      update_column(:status, :rejected)
      release_availability_slots
    end
  end

  def confirm!
    return false unless approved?
    update_column(:status, :confirmed)
  end

  def complete!
    return false unless approved? || confirmed?

    transaction do
      update_column(:status, :completed)
      release_availability_slots
    end
  end

  private

  # ----------------------------
  # STATUS SIDE EFFECTS
  # ----------------------------

  def handle_status_change
    case status
    when "approved"
      create_availability_slots unless availability_slots.exists?
    end
  end

  # ----------------------------
  # AVAILABILITY VALIDATION
  # ----------------------------

  def validate_availability_for_approval
    return false unless homestay && check_in_date && check_out_date

    available_dates = homestay.available_dates(check_in_date, check_out_date)
    requested_dates = (check_in_date...check_out_date).to_a

    (requested_dates - available_dates).empty?
  end

  # ----------------------------
  # SLOT CREATION
  # ----------------------------

  def create_availability_slots
    return unless homestay && check_in_date && check_out_date
    return if availability_slots.exists?

    (check_in_date...check_out_date).each do |date|
      availability_slots.create!(
        homestay: homestay,
        start_datetime: date.beginning_of_day,
        end_datetime: date.end_of_day,
        booking: self,
        is_blocked: false
      )
    end
  end

  def release_availability_slots
    availability_slots.update_all(booking_id: nil)
  end
end
