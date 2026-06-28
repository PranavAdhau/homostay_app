require "json"
require "net/http"
require "uri"

class WhatsappService
  GRAPH_API_VERSION = "v22.0".freeze
  DEFAULT_LANGUAGE_CODE = "en_US".freeze

  Result = Struct.new(
    :success?,
    :message_id,
    :response_code,
    :response_body,
    :error_code,
    keyword_init: true
  )

  class TransientError < StandardError; end

  def initialize(phone_number:, template_name:, template_parameters:, booking_id: nil, language_code: DEFAULT_LANGUAGE_CODE)
    @phone_number = Whatsapp::PhoneNumberNormalizer.normalize(phone_number)
    @template_name = template_name.to_s
    @template_parameters = Array(template_parameters).map { |value| value.to_s }
    @booking_id = booking_id
    @language_code = language_code
  end

  def call
    return failure_result(error_code: "invalid_phone_number") if invalid_phone_number?
    return failure_result(error_code: "missing_configuration") if missing_configuration?

    response = http_client.request(build_request)
    parsed_body = parse_json(response.body)
    message_id = parsed_body.dig("messages", 0, "id")
    result = Result.new(
      success?: response.is_a?(Net::HTTPSuccess),
      message_id: message_id,
      response_code: response.code.to_i,
      response_body: parsed_body
    )

    if result.success?
      log_success(result)
      result
    elsif transient_response?(response.code.to_i)
      log_failure(result, error_code: "transient_http_error")
      raise TransientError, "WhatsApp Cloud API transient failure (HTTP #{response.code})"
    else
      log_failure(result, error_code: "http_error")
      result
    end
  rescue Net::OpenTimeout, Net::ReadTimeout, Timeout::Error, EOFError, IOError, SocketError => e
    log_exception(e, error_code: "network_error")
    raise TransientError, e.message
  rescue JSON::ParserError => e
    log_exception(e, error_code: "invalid_json_response")
    raise TransientError, e.message
  end

  private

  attr_reader :phone_number, :template_name, :template_parameters, :booking_id, :language_code

  def invalid_phone_number?
    phone_number.blank?
  end

  def missing_configuration?
    phone_number_id.blank? || access_token.blank?
  end

  def failure_result(error_code:)
    result = Result.new(success?: false, error_code: error_code)
    log_failure(result, error_code: error_code)
    result
  end

  def phone_number_id
    ENV["WHATSAPP_PHONE_NUMBER_ID"]
  end

  def access_token
    ENV["WHATSAPP_ACCESS_TOKEN"]
  end

  def endpoint_uri
    URI("https://graph.facebook.com/#{GRAPH_API_VERSION}/#{phone_number_id}/messages")
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
    request["Authorization"] = "Bearer #{access_token}"
    request.body = request_payload.to_json
    request
  end

  def request_payload
    {
      messaging_product: "whatsapp",
      to: phone_number,
      type: "template",
      template: {
        name: template_name,
        language: {
          code: language_code
        },
        components: [
          {
            type: "body",
            parameters: template_parameters.map do |value|
              { type: "text", text: value }
            end
          }
        ]
      }
    }
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
        event: "whatsapp.outbound.sent",
        result: "success"
      )
    )
  end

  def log_failure(result, error_code:)
    Observability::StructuredLogger.error(
      log_payload(result).merge(
        event: "whatsapp.outbound.failed",
        result: "failure",
        error_code: error_code
      )
    )
  end

  def log_exception(error, error_code:)
    Observability::StructuredLogger.error(
      log_payload(nil).merge(
        event: "whatsapp.outbound.exception",
        result: "failure",
        error_code: error_code,
        error_class: error.class.name,
        error_message: error.message
      )
    )
  end

  def log_payload(result)
    {
      booking_id: booking_id,
      phone_number: phone_number,
      template_name: template_name,
      meta_message_id: result&.message_id,
      http_status: result&.response_code,
      response: result&.response_body
    }
  end
end
