module Whatsapp
  class WebhookEventProcessor
    IDEMPOTENCY_TTL = 2.days.to_i

    def initialize(event)
      @event = event.deep_stringify_keys
    end

    def call
      return duplicate_result if duplicate_event?

      case event.fetch("event_type")
      when "message"
        log_message_event
      when "status"
        log_status_event
      else
        log_ignored_event
      end

      :processed
    end

    private

    attr_reader :event

    def duplicate_event?
      event_id = event["event_id"].to_s
      return false if event_id.blank?

      Infrastructure::RedisClient.with do |redis|
        !redis.set(idempotency_key(event_id), "1", nx: true, ex: IDEMPOTENCY_TTL)
      end
    rescue Redis::BaseError, IOError, SystemCallError => e
      Observability::StructuredLogger.warn(
        event: "whatsapp.webhook.idempotency_unavailable",
        error_class: e.class.name,
        error_message: e.message,
        webhook_event_id: event_id
      )
      false
    end

    def duplicate_result
      Observability::StructuredLogger.info(
        base_log_payload.merge(
          event: "whatsapp.webhook.duplicate_ignored"
        )
      )
      :duplicate
    end

    def log_message_event
      Observability::StructuredLogger.info(
        base_log_payload.merge(
          event: "whatsapp.webhook.message_received",
          booking_id: matching_booking&.id,
          sender_phone: normalized_from_phone,
          message_type: event["message_type"]
        )
      )
    end

    def log_status_event
      Observability::StructuredLogger.info(
        base_log_payload.merge(
          event: "whatsapp.webhook.status_received",
          booking_id: matching_booking&.id,
          recipient_phone: normalized_recipient_phone,
          status: event["status"]
        )
      )
    end

    def log_ignored_event
      Observability::StructuredLogger.info(
        base_log_payload.merge(
          event: "whatsapp.webhook.ignored"
        )
      )
    end

    def matching_booking
      return @matching_booking if defined?(@matching_booking)

      phone = normalized_from_phone.presence || normalized_recipient_phone.presence
      @matching_booking =
        if phone.blank?
          nil
        else
          Booking.order(created_at: :desc).detect do |booking|
            Whatsapp::PhoneNumberNormalizer.normalize(booking.guest_phone) == phone
          end
        end
    end

    def normalized_from_phone
      @normalized_from_phone ||= Whatsapp::PhoneNumberNormalizer.normalize(event["from_phone"])
    end

    def normalized_recipient_phone
      @normalized_recipient_phone ||= Whatsapp::PhoneNumberNormalizer.normalize(event["recipient_phone"])
    end

    def idempotency_key(event_id)
      "whatsapp:webhook:event:#{event_id}"
    end

    def base_log_payload
      {
        webhook_event_id: event["event_id"],
        event_type: event["event_type"],
        meta_message_id: event["message_id"],
        entry_id: event["entry_id"],
        phone_number_id: event["to_phone_number_id"],
        timestamp: event["timestamp"],
        payload: event["payload"]
      }
    end
  end
end
