class Admin::BookingsController < Admin::BaseController
  before_action :set_booking, only: [:show, :update, :approve, :reject, :confirm]

  def index
    @bookings = Booking.includes(:homestay).order(created_at: :desc)
    @bookings = @bookings.where(status: params[:status]) if params[:status].present?
  end

  def show
  end

  def update
    if @booking.update(booking_params)
      redirect_to admin_booking_path(@booking), notice: 'Booking was successfully updated.'
    else
      render :show, status: :unprocessable_entity
    end
  end

  def approve
    if @booking.approve!
      redirect_to admin_booking_path(@booking), notice: 'Booking was successfully approved.'
    else
      redirect_to admin_booking_path(@booking), alert: @booking.errors.full_messages.join(', ')
    end
  end

  def reject
    if @booking.reject!
      redirect_to admin_booking_path(@booking), notice: 'Booking was successfully rejected.'
    else
      redirect_to admin_booking_path(@booking), alert: @booking.errors.full_messages.join(', ')
    end
  end

  def confirm
    if @booking.confirm!
      redirect_to admin_booking_path(@booking), notice: 'Booking was successfully confirmed.'
    else
      redirect_to admin_booking_path(@booking), alert: @booking.errors.full_messages.join(', ')
    end
  end

  private

  def set_booking
    @booking = Booking.find(params[:id])
  end

  def booking_params
    params.require(:booking).permit(
      :guest_name,
      :guest_email,
      :guest_phone,
      :check_in_date,
      :check_out_date,
      :number_of_guests,
      :total_price
    )
  end
end
