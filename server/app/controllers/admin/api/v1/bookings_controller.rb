class Admin::Api::V1::BookingsController < Admin::Api::V1::BaseController
  before_action :set_booking, only: [:show, :update, :approve, :reject, :confirm]

  def index
    bookings = Booking.includes(:homestay).order(created_at: :desc)
    bookings = bookings.where(status: params[:status]) if params[:status].present?
    
    render_success(data: bookings.map { |b| serialize_booking(b) })
  end

  def show
    render_success(data: serialize_booking(@booking))
  end

  def update
    if @booking.update(booking_params)
      render_success(data: serialize_booking(@booking))
    else
      render_error(message: "Failed to update booking", errors: @booking.errors.full_messages)
    end
  end

  def approve
    service = BookingLifecycle::ApproveBooking.new(@booking)

    if service.call
      render_success(data: serialize_booking(@booking), message: "Booking approved successfully")
    else
      render_error(
        message: service.error_message || "Unable to approve this booking right now. Please try again.",
        errors: @booking.errors.full_messages,
        status: service.status || :unprocessable_entity
      )
    end
  end

  def reject
    if @booking.reject!
      render_success(data: serialize_booking(@booking), message: "Booking rejected successfully")
    else
      render_error(message: "Failed to reject booking", errors: @booking.errors.full_messages)
    end
  end

  def confirm
    if @booking.confirm!
      render_success(data: serialize_booking(@booking), message: "Booking confirmed successfully")
    else
      render_error(message: "Failed to confirm booking", errors: @booking.errors.full_messages)
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

  def serialize_booking(booking)
    {
      id: booking.id,
      homestay_id: booking.homestay_id,
      homestay_name: booking.homestay.name,
      guest_name: booking.guest_name,
      guest_email: booking.guest_email,
      guest_phone: booking.guest_phone,
      check_in_date: booking.check_in_date.to_s,
      check_out_date: booking.check_out_date.to_s,
      number_of_guests: booking.number_of_guests,
      total_price: booking.total_price.to_f,
      status: booking.status,
      whatsapp_message_sent: booking.whatsapp_message_sent,
      created_at: booking.created_at,
      updated_at: booking.updated_at
    }
  end
end
