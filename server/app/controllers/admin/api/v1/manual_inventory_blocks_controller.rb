class Admin::Api::V1::ManualInventoryBlocksController < Admin::Api::V1::BaseController
  include InventoryCalendarSerialization

  before_action :set_homestay
  before_action :set_manual_inventory_block, only: [:unlock]

  def create
    service = ManualInventoryBlocks::CreateBlock.new(
      homestay: @homestay,
      admin_user: current_admin_user,
      attributes: manual_inventory_block_params
    )

    if service.call
      render_success(
        data: {
          event: serialize_manual_block_event(service.manual_inventory_block),
          warnings: service.warnings
        },
        message: "Manual lock created successfully",
        status: :created
      )
    else
      render_error(
        message: "Unable to create manual lock",
        errors: service.manual_inventory_block&.errors&.full_messages
      )
    end
  end

  def unlock
    service = ManualInventoryBlocks::UnlockBlock.new(
      manual_inventory_block: @manual_inventory_block,
      admin_user: current_admin_user
    )

    if service.call
      render_success(
        data: {
          event: serialize_manual_block_event(@manual_inventory_block.reload)
        },
        message: service.message
      )
    else
      render_error(message: service.message)
    end
  end

  private

  def set_homestay
    @homestay = Homestay.find(params[:homestay_id])
  end

  def set_manual_inventory_block
    @manual_inventory_block = @homestay.manual_inventory_blocks.find(params[:id])
  end

  def manual_inventory_block_params
    params.require(:manual_inventory_block).permit(:starts_on, :ends_on, :reason, :notes)
  end
end
