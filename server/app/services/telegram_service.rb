# app/services/telegram_service.rb

require "cgi"
require "erb"
require "json"
require "net/http"
require "uri"

class TelegramService
  include ERB::Util

  DASHBOARD_URL = "https://thesacredhomes.com/admin/bookings".freeze
  WEBSITE_URL = "https://thesacredhomes.com".freeze

  Result = Struct.new(
    :success?,
    :message_id,
    :response_code,
    :response_body,
    :error_code,
    keyword_init: true
  )

  class TransientError < StandardError; end

  def initialize(booking:)
    @booking = booking
  end

  def call
    return failure_result(error_code: "missing_booking") if booking.blank?
    return failure_result(error_code: "missing_configuration") if missing_configuration?

    response = http_client.request(build_request)
    parsed_body = parse_json(response.body)

    result = Result.new(
      success?: response.is_a?(Net::HTTPSuccess) && parsed_body["ok"] == true,
      message_id: parsed_body.dig("result", "message_id"),
      response_code: response.code.to_i,
      response_body: parsed_body
    )

    if result.success?
      log_success(result)
      result
    elsif transient_response?(response.code.to_i)
      log_failure(result, error_code: "transient_http_error")
      raise TransientError, "Telegram API transient failure (HTTP #{response.code})"
    else
      log_failure(result, error_code: "http_error")
      result
    end
  rescue Net::OpenTimeout,
         Net::ReadTimeout,
         Timeout::Error,
         EOFError,
         IOError,
         SocketError => e
    log_exception(e, error_code: "network_error")
    raise TransientError, e.message
  rescue JSON::ParserError => e
    log_exception(e, error_code: "invalid_json_response")
    raise TransientError, e.message
  end

  private

  attr_reader :booking

  def missing_configuration?
    bot_token.blank? || chat_id.blank?
  end

  def failure_result(error_code:)
    result = Result.new(success?: false, error_code: error_code)
    log_failure(result, error_code: error_code)
    result
  end

  def bot_token
    ENV["TELEGRAM_BOT_TOKEN"]
  end

  def chat_id
    ENV["TELEGRAM_CHAT_ID"]
  end

  def endpoint_uri
    URI("https://api.telegram.org/bot#{bot_token}/sendMessage")
  end

  def http_client
    http = Net::HTTP.new(endpoint_uri.host, endpoint_uri.port)
    http.use_ssl = true
    http.open_timeout = 5
    http.read_timeout = 10
    http
  end

  def build_request
    request = Net::HTTP::Post.new(endpoint_uri)
    request["Content-Type"] = "application/json"
    request.body = request_payload.to_json
    request
  end

  def request_payload
    {
      chat_id: chat_id,
      text: telegram_message,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: inline_keyboard
      }
    }
  end

  def telegram_message
    <<~HTML
      🏡 <b>New Booking Request</b>

      ━━━━━━━━━━━━━━━━━━━━

      🏠 <b>Property</b>
      #{html_escape(booking.homestay.name)}

      👤 <b>Guest</b>
      #{html_escape(booking.guest_name)}

      📞 <b>Phone</b>
      #{html_escape(booking.guest_phone)}

      📧 <b>Email</b>
      #{html_escape(booking.guest_email)}

      📅 <b>Check-in</b>
      #{booking.check_in_date.strftime("%d %b %Y")}

      📅 <b>Check-out</b>
      #{booking.check_out_date.strftime("%d %b %Y")}

      👥 <b>Guests</b>
      #{booking.number_of_guests}

      💰 <b>Total</b>
      ₹#{ActiveSupport::NumberHelper.number_to_delimited(booking.total_price.to_i)}

      🕒 <b>Booked At</b>
      #{booking.created_at.in_time_zone.strftime("%d %b %Y %I:%M %p")}

      ━━━━━━━━━━━━━━━━━━━━

      The guest has submitted a booking request.

      Use the buttons below to contact the guest or manage the booking.
    HTML
  end

  def inline_keyboard
    [
      [
        {
          text: "💬 Chat with Guest",
          url: whatsapp_chat_url
        }
      ],
      [
        {
          text: "📋 Open Booking Dashboard",
          url: DASHBOARD_URL
        }
      ]
    ]
  end

  def whatsapp_chat_url
    "https://wa.me/#{normalized_guest_phone}?text=#{CGI.escape(prefilled_message)}"
  end

  def normalized_guest_phone
    Whatsapp::PhoneNumberNormalizer.normalize(booking.guest_phone)
  end
    def prefilled_message
    <<~TEXT.strip
      Hi #{booking.guest_name},

      Thank you for your interest in staying at Sacred Homes.

      We have received your booking request for #{booking.homestay.name}.

      Your booking request is currently under review and has not been confirmed yet.

      Before confirming your stay, we'd like to connect with you to discuss your travel plans, answer any questions, and ensure everything is perfect for your visit.

      Please feel free to reply to this message at your convenience. We'll be happy to assist you.

      We look forward to hosting you!

      Warm regards,
      Sacred Homes

      #{WEBSITE_URL}
    TEXT
  end

  def parse_json(body)
    return {} if body.blank?

    JSON.parse(body)
  end

  def transient_response?(status_code)
    status_code == 429 || status_code >= 500
  end

    def log_success(result)
    Observability::StructuredLogger.info(
        log_payload(result).merge(
        event: "telegram.outbound.sent",
        result: "success"
        )
    )
    end

  def log_failure(result, error_code:)
  Observability::StructuredLogger.error(
    log_payload(result).merge(
      event: "telegram.outbound.failed",
      result: "failure",
      error_code: error_code
    )
  )
end

  def log_exception(error, error_code:)
  Observability::StructuredLogger.error(
    log_payload(nil).merge(
      event: "telegram.outbound.exception",
      result: "failure",
      error_code: error_code,
      error_class: error.class.name,
      error_message: error.message
    )
  )
end
 def log_payload(result)
  {
    booking_id: booking.id,
    guest_phone: booking.guest_phone,
    guest_name: booking.guest_name,
    property: booking.homestay&.name,
    telegram_message_id: result&.message_id,
    http_status: result&.response_code,
    response: result&.response_body
  }
end
end
