module BookingLifecycle
  extend ActiveSupport::Concern

  included do
    after_update :handle_status_change, if: :saved_change_to_status?
  end

  # ----------------------------
  # STATE TRANSITIONS
  # ----------------------------

  def approve!
    service = BookingLifecycle::ApproveBooking.new(self)
    return true if service.call

    errors.add(:base, service.error_message) if service.error_message.present?
    false
  end

  def reject!
    return false unless pending? || approved?

    rejected = false
    transaction do
      update!(status: :rejected)
      release_inventory!
      rejected = true
    end
    rejected
  end

  def complete!
    return false unless approved?

    completed = false
    transaction do
      update!(status: :completed)
      release_inventory!
      completed = true
    end
    completed
  end

  private

  # ----------------------------
  # STATUS SIDE EFFECTS
  # ----------------------------

  def handle_status_change
    nil
  end

  # ----------------------------
  # AVAILABILITY VALIDATION
  # ----------------------------

  def validate_availability_for_approval
    return false unless homestay && check_in_date && check_out_date

    !BookingAvailability::OverlapChecker.new(
      homestay: homestay,
      check_in_date: check_in_date,
      check_out_date: check_out_date,
      booking_to_ignore: self,
      hold_to_ignore: reservation_hold
    ).conflict?
  end

  # ----------------------------
  # SLOT CREATION
  # ----------------------------

  def create_availability_slots
    return unless homestay && check_in_date && check_out_date
    return if availability_slots.exists?

    CalendarSync::SlotReconciler.call(self)
  end

  def release_availability_slots
    availability_slots.delete_all
  end

  def release_inventory!
    release_availability_slots
    BookingAvailability::HoldManager.release_for_booking!(self)
  end
end
