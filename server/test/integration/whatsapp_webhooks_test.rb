require "test_helper"
require "openssl"

class WhatsappWebhooksTest < ActionDispatch::IntegrationTest
  setup do
    clear_enqueued_jobs
    clear_performed_jobs
  end

  teardown do
    clear_enqueued_jobs
    clear_performed_jobs
  end

  test "verification returns the challenge for a valid token" do
    with_modified_env("WHATSAPP_WEBHOOK_VERIFY_TOKEN" => "verify-token") do
      get "/webhooks/whatsapp", params: {
        "hub.mode" => "subscribe",
        "hub.verify_token" => "verify-token",
        "hub.challenge" => "challenge-token"
      }
    end

    assert_response :success
    assert_equal "challenge-token", response.body
  end

  test "verification rejects an invalid token" do
    with_modified_env("WHATSAPP_WEBHOOK_VERIFY_TOKEN" => "verify-token") do
      get "/webhooks/whatsapp", params: {
        "hub.mode" => "subscribe",
        "hub.verify_token" => "wrong-token",
        "hub.challenge" => "challenge-token"
      }
    end

    assert_response :forbidden
  end

  test "messages webhook validates, enqueues, and returns ok immediately" do
    payload = message_payload

    with_webhook_env do
      assert_enqueued_with(job: WhatsappWebhookEventJob) do
        post "/webhooks/whatsapp",
          params: payload.to_json,
          headers: signed_headers(payload)
      end
    end

    assert_response :success
  end

  test "statuses webhook validates, enqueues, and returns ok immediately" do
    payload = status_payload

    with_webhook_env do
      assert_enqueued_with(job: WhatsappWebhookEventJob) do
        post "/webhooks/whatsapp",
          params: payload.to_json,
          headers: signed_headers(payload)
      end
    end

    assert_response :success
  end

  test "webhook rejects an invalid signature" do
    with_webhook_env do
      post "/webhooks/whatsapp",
        params: message_payload.to_json,
        headers: {
          "CONTENT_TYPE" => "application/json",
          "X-Hub-Signature-256" => "sha256=invalid"
        }
    end

    assert_response :unauthorized
  end

  test "webhook rejects malformed json" do
    with_webhook_env do
      post "/webhooks/whatsapp",
        params: "{invalid-json",
        headers: {
          "CONTENT_TYPE" => "application/json",
          "X-Hub-Signature-256" => signature_for("{invalid-json")
        }
    end

    assert_response :bad_request
  end

  private

  def with_webhook_env(&block)
    with_modified_env(
      "WHATSAPP_APP_SECRET" => "app-secret",
      "WHATSAPP_BUSINESS_ACCOUNT_ID" => "waba-123",
      "WHATSAPP_WEBHOOK_VERIFY_TOKEN" => "verify-token"
    ) do
      block.call
    end
  end

  def with_modified_env(overrides)
    original = overrides.transform_values { nil }
    overrides.each_key { |key| original[key] = ENV[key] }
    overrides.each { |key, value| ENV[key] = value }
    yield
  ensure
    original.each { |key, value| ENV[key] = value }
  end

  def signature_for(body)
    digest = OpenSSL::HMAC.hexdigest("SHA256", ENV.fetch("WHATSAPP_APP_SECRET"), body)
    "sha256=#{digest}"
  end

  def signed_headers(payload)
    body = payload.to_json
    {
      "CONTENT_TYPE" => "application/json",
      "X-Hub-Signature-256" => signature_for(body)
    }
  end

  def message_payload
    {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "waba-123",
          changes: [
            {
              field: "messages",
              value: {
                metadata: {
                  phone_number_id: "phone-number-id"
                },
                messages: [
                  {
                    id: "wamid.message.1",
                    from: "919309800427",
                    timestamp: "1710000000",
                    type: "text",
                    text: { body: "Hello" }
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  end

  def status_payload
    {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "waba-123",
          changes: [
            {
              field: "messages",
              value: {
                metadata: {
                  phone_number_id: "phone-number-id"
                },
                statuses: [
                  {
                    id: "wamid.status.1",
                    status: "delivered",
                    recipient_id: "919309800427",
                    timestamp: "1710000001"
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  end
end
