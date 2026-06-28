class Webhooks::WhatsappController < ApplicationController
  skip_before_action :verify_authenticity_token

  def verify
    mode = params["hub.mode"] || params[:hub_mode]
    verify_token = params["hub.verify_token"] || params[:hub_verify_token]
    challenge = params["hub.challenge"] || params[:hub_challenge]

    if mode == "subscribe" && Whatsapp::WebhookVerifier.verify_token?(verify_token)
      render plain: challenge.to_s, status: :ok
    else
      head :forbidden
    end
  end

  def receive
    raw_body = request.raw_post
    signature = request.headers["X-Hub-Signature-256"].to_s

    return head :unauthorized unless Whatsapp::WebhookVerifier.valid_signature?(raw_body: raw_body, signature: signature)

    payload = JSON.parse(raw_body)
    parser_result = Whatsapp::WebhookPayloadParser.new(payload).call
    return head :bad_request unless parser_result.valid?

    WhatsappWebhookEventJob.perform_later(payload.deep_stringify_keys)
    head :ok
  rescue JSON::ParserError
    head :bad_request
  end
end
