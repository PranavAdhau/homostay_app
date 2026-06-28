module Whatsapp
  class WebhookPayloadParser
    Result = Struct.new(:valid?, :error_message, :events, keyword_init: true)

    def initialize(payload)
      @payload = payload.deep_stringify_keys
    end

    def call
      return Result.new(valid?: false, error_message: "Invalid WhatsApp object", events: []) unless payload["object"] == "whatsapp_business_account"
      return Result.new(valid?: false, error_message: "Missing webhook entries", events: []) unless payload["entry"].is_a?(Array)

      if configured_business_account_id.present? && payload["entry"].none? { |entry| entry["id"].to_s == configured_business_account_id }
        return Result.new(valid?: false, error_message: "Unexpected WhatsApp business account", events: [])
      end

      Result.new(valid?: true, events: extract_events, error_message: nil)
    end

    private

    attr_reader :payload

    def configured_business_account_id
      ENV["WHATSAPP_BUSINESS_ACCOUNT_ID"].to_s
    end

    def extract_events
      payload.fetch("entry", []).flat_map do |entry|
        entry.fetch("changes", []).flat_map do |change|
          next [] unless change["field"] == "messages"

          metadata = change.fetch("value", {}).fetch("metadata", {})
          messages = extract_message_events(entry, change, metadata)
          statuses = extract_status_events(entry, change, metadata)
          messages + statuses
        end
      end
    end

    def extract_message_events(entry, change, metadata)
      change.fetch("value", {}).fetch("messages", []).filter_map do |message|
        message_id = message["id"].to_s
        next if message_id.blank?

        {
          "event_type" => "message",
          "event_id" => message_id,
          "entry_id" => entry["id"].to_s,
          "message_id" => message_id,
          "from_phone" => message["from"].to_s,
          "to_phone_number_id" => metadata["phone_number_id"].to_s,
          "timestamp" => message["timestamp"].to_s,
          "message_type" => message["type"].to_s,
          "payload" => message.deep_stringify_keys
        }
      end
    end

    def extract_status_events(entry, change, metadata)
      change.fetch("value", {}).fetch("statuses", []).filter_map do |status|
        message_id = status["id"].to_s
        status_name = status["status"].to_s
        timestamp = status["timestamp"].to_s
        next if message_id.blank? || status_name.blank?

        {
          "event_type" => "status",
          "event_id" => [message_id, status_name, timestamp].join(":"),
          "entry_id" => entry["id"].to_s,
          "message_id" => message_id,
          "status" => status_name,
          "recipient_phone" => status["recipient_id"].to_s,
          "to_phone_number_id" => metadata["phone_number_id"].to_s,
          "timestamp" => timestamp,
          "payload" => status.deep_stringify_keys
        }
      end
    end
  end
end
