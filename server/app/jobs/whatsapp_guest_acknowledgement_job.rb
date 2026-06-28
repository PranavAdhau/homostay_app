class WhatsappGuestAcknowledgementJob < ApplicationJob
  queue_as :default

  retry_on WhatsappService::TransientError, wait: :polynomially_longer, attempts: 5

  def perform(booking)
    return unless booking

    WhatsappService.new(
      phone_number: booking.guest_phone,
      template_name: "booking_request_received",
      template_parameters: [
        booking.guest_name
      ],
      booking_id: booking.id
    ).call
  end
end
