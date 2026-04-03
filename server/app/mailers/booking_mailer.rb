class BookingMailer < ApplicationMailer
  default from: 'no-reply@homestay.com'

  def booking_confirmed(booking)
    @booking = booking
    @homestay = booking.homestay

    mail(
      to: booking.guest_email,
      subject: "Booking Confirmed - #{@homestay.name}"
    )
  end
end