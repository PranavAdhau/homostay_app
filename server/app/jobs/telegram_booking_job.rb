# app/jobs/telegram_booking_job.rb

class TelegramBookingJob < ApplicationJob
  queue_as :default

  retry_on TelegramService::TransientError,
           wait: :polynomially_longer,
           attempts: 5

  def perform(booking)
    return unless booking
    return if booking.host_notification_sent?

    result = TelegramService.new(
      booking: booking
    ).call

    booking.mark_host_notification_sent! if result.success?
  end
end
