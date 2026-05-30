module ManualInventoryBlocks
  class CreateBlock
    attr_reader :manual_inventory_block, :warnings

    def initialize(homestay:, admin_user:, attributes:)
      @homestay = homestay
      @admin_user = admin_user
      @attributes = attributes
      @warnings = []
    end

    def call
      @manual_inventory_block = homestay.manual_inventory_blocks.new(@attributes)
      manual_inventory_block.created_by_admin_user = admin_user
      return false unless manual_inventory_block.valid?

      overlap_checker = BookingAvailability::OverlapChecker.new(
        homestay: homestay,
        check_in_date: manual_inventory_block.starts_on,
        check_out_date: manual_inventory_block.ends_on,
        manual_inventory_block_to_ignore: manual_inventory_block,
        consider_holds: true
      )

      @warnings = overlap_checker.blocking_sources(include_holds: true)
                                 .select { |source| source[:source] == "reservation_hold" }
                                 .map { "There is currently an active reservation hold for these dates." }
                                 .uniq

      return false unless manual_inventory_block.save

      CalendarSync::ExternalBlockReconciler.call(homestay)
      true
    rescue ActiveRecord::RecordInvalid
      false
    end

    private

    attr_reader :homestay, :admin_user
  end
end
