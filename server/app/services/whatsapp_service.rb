require 'net/http'
require 'uri'
require 'json'

class WhatsappService
  def initialize(phone_number, booking)
    @phone_number = format_number(phone_number)
    @booking = booking
  end

  def call
    return unless booking
    send_via_whatsapp_cloud
  end

  private

  attr_reader :phone_number, :booking

  def format_number(number)
    number.to_s.gsub(/\D/, '')
  end

  def send_via_whatsapp_cloud
    phone_number_id = ENV['WHATSAPP_PHONE_NUMBER_ID']
    access_token    = ENV['WHATSAPP_ACCESS_TOKEN']

    if phone_number_id.blank? || access_token.blank?
      Rails.logger.error "[WhatsAppCloud] Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_ACCESS_TOKEN – skipping send"
      return
    end

    uri = URI("https://graph.facebook.com/v22.0/#{phone_number_id}/messages")

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 5
    http.read_timeout = 10

    request = Net::HTTP::Post.new(uri)
    request['Content-Type']  = 'application/json'
    request['Authorization'] = "Bearer #{access_token}"

    request.body = {
      messaging_product: "whatsapp",
      to: phone_number,
      type: "template",
      template: {
        name: "booking_request",
        language: {
          code: "en_US"
        },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: booking.homestay.name },
              { type: "text", text: booking.guest_name },
              { type: "text", text: booking.guest_phone },
              { type: "text", text: booking.check_in_date.strftime("%d %b %Y") },
              { type: "text", text: booking.check_out_date.strftime("%d %b %Y") },
              { type: "text", text: booking.number_of_guests.to_s }
            ]
          }
        ]
      }
    }.to_json

    response = http.request(request)

    Rails.logger.info "[WhatsAppCloud] Response: #{response.code} #{response.body}"

    if response.is_a?(Net::HTTPSuccess)
      Rails.logger.info "[WhatsAppCloud] ✅ Message sent successfully to #{phone_number}"
    else
      Rails.logger.error "[WhatsAppCloud] ❌ Failed to send message to #{phone_number}"
    end

  rescue StandardError => e
    Rails.logger.error "[WhatsAppCloud] ❌ Error sending message to #{phone_number} - #{e.class}: #{e.message}"
  end
end
