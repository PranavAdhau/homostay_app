class Api::V1::BookingsController < Api::V1::BaseController
  before_action :set_booking, only: [:show]

  def create
    service = BookingLifecycle::CreatePendingBooking.new(booking_params)

    if service.call
      booking = service.booking
      render_success(
        data: serialize_booking(booking),
        message: "Booking request submitted successfully",
        status: :created
      )
    else
      render_error(
        message: service.error_message || "Unable to submit your booking right now. Please try again.",
        errors: service.booking&.errors&.full_messages,
        status: service.status || :unprocessable_entity
      )
    end
  end

  def show
    render_success(data: serialize_booking(@booking))
  end

  private

  def set_booking
    @booking = Booking.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render_error(message: "Booking not found", status: :not_found)
  end

  def booking_params
    params.require(:booking).permit(
      :homestay_id,
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
