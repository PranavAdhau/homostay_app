class WhatsappBookingJob < ApplicationJob
  queue_as :default

  retry_on WhatsappService::TransientError, wait: :polynomially_longer, attempts: 5

  def perform(booking)
    return unless booking

    result = WhatsappService.new(
      phone_number: ENV["ADMIN_WHATSAPP_NUMBER"],
      template_name: "booking_request_host",
      template_parameters: [
        booking.homestay.name,
        booking.guest_name,
        booking.guest_phone,
        booking.check_in_date.strftime("%d %b %Y"),
        booking.check_out_date.strftime("%d %b %Y"),
        booking.number_of_guests.to_s,
        booking.id.to_s
      ],
      booking_id: booking.id
    ).call

    booking.update_column(:whatsapp_message_sent, true) if result.success?
  end
end
