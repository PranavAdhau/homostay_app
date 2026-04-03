class WhatsappUserConfirmationJob < ApplicationJob
  queue_as :default

  def perform(booking)
    return unless booking

    message = <<~MESSAGE
      🎉 Booking Confirmed!

      Property: #{booking.homestay.name}
      Booking ID: #{booking.id}
      Check-in: #{booking.check_in_date}
      Check-out: #{booking.check_out_date}
      Guests: #{booking.number_of_guests}

      We look forward to hosting you!

      If you have any questions, feel free to reply here.
    MESSAGE

    WhatsappService.new(
      booking.guest_phone,
      message
    ).call
  end
end