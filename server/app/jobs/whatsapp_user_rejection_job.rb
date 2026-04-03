class WhatsappUserRejectionJob < ApplicationJob
  queue_as :default

  def perform(booking)
    return unless booking

    message = <<~MESSAGE
      ❌ Booking Update

      Unfortunately, your booking request for:

      Property: #{booking.homestay.name}
      Dates: #{booking.check_in_date} to #{booking.check_out_date}

      Booking ID: #{booking.id}

      could not be approved.

      Please try different dates or contact us for assistance.
    MESSAGE

    WhatsappService.new(
      booking.guest_phone,
      message
    ).call
  end
end