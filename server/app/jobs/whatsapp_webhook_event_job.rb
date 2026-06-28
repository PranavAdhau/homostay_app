class WhatsappWebhookEventJob < ApplicationJob
  queue_as :default

  def perform(payload)
    parser_result = Whatsapp::WebhookPayloadParser.new(payload).call
    return unless parser_result.valid?

    parser_result.events.each do |event|
      Whatsapp::WebhookEventProcessor.new(event).call
    end
  end
end
