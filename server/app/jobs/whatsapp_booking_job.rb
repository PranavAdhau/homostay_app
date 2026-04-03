class WhatsappBookingJob < ApplicationJob
  queue_as :default

  def perform(booking)
    return unless booking

    WhatsappService.new(
      ENV['ADMIN_WHATSAPP_NUMBER'],
      booking
    ).call
  end
end