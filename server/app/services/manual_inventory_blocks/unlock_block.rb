module ManualInventoryBlocks
  class UnlockBlock
    attr_reader :message

    def initialize(manual_inventory_block:, admin_user:)
      @manual_inventory_block = manual_inventory_block
      @admin_user = admin_user
      @message = "Manual lock removed successfully."
    end

    def call
      return invalid!("This manual lock has already been removed.") unless manual_inventory_block.active?

      homestay = manual_inventory_block.homestay
      start_date = manual_inventory_block.starts_on
      end_date = manual_inventory_block.ends_on

      ManualInventoryBlock.transaction do
        manual_inventory_block.lock!
        raise ActiveRecord::Rollback unless manual_inventory_block.active?

        manual_inventory_block.unlock!(admin_user: admin_user)
        CalendarSync::ExternalBlockReconciler.call(homestay)
      end

      return invalid!("This manual lock has already been removed.") unless manual_inventory_block.unlocked_at.present?

      if BookingAvailability::OverlapChecker.new(
        homestay: homestay,
        check_in_date: start_date,
        check_out_date: end_date,
        consider_holds: false
      ).conflict?
        @message = "This manual lock was removed, but the dates remain unavailable because they are still blocked by another inventory source."
      end

      true
    rescue ActiveRecord::RecordInvalid
      invalid!("Unable to remove this manual lock right now.")
    end

    private

    attr_reader :manual_inventory_block, :admin_user

    def invalid!(message)
      @message = message
      false
    end
  end
end
