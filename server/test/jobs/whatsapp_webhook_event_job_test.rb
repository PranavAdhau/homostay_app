require "test_helper"

class WhatsappWebhookEventJobTest < ActiveSupport::TestCase
  FakeRedis = Struct.new(:results) do
    def set(*)
      results.shift
    end
  end

  def create_homestay!
    Homestay.create!(
      name: "Webhook Stay",
      slug: SecureRandom.hex(6),
      description: "Webhook stay description",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true
    )
  end

  def create_booking!(homestay)
    homestay.bookings.create!(
      guest_name: "Webhook Guest",
      guest_email: "webhook@example.com",
      guest_phone: "+91 9309800427",
      check_in_date: Date.new(2026, 11, 10),
      check_out_date: Date.new(2026, 11, 12),
      number_of_guests: 2,
      total_price: 1000,
      status: :pending
    )
  end

  def stub_redis(results:)
    fake_redis = FakeRedis.new(results)
    original_with = Infrastructure::RedisClient.method(:with)

    Infrastructure::RedisClient.define_singleton_method(:with) do |&block|
      block.call(fake_redis)
    end

    yield
  ensure
    Infrastructure::RedisClient.define_singleton_method(:with) do |&block|
      original_with.call(&block)
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

  def capture_logs
    info_logs = []
    original_info = Observability::StructuredLogger.method(:info)

    Observability::StructuredLogger.define_singleton_method(:info) do |payload|
      info_logs << payload
    end

    yield info_logs
  ensure
    Observability::StructuredLogger.define_singleton_method(:info) do |payload|
      original_info.call(payload)
    end
  end

  test "webhook event job processes messages and statuses" do
    create_booking!(create_homestay!)
    payload = {
      object: "whatsapp_business_account",
      entry: [
        {
          id: "waba-123",
          changes: [
            {
              field: "messages",
              value: {
                metadata: { phone_number_id: "phone-number-id" },
                messages: [
                  {
                    id: "wamid.message.1",
                    from: "919309800427",
                    timestamp: "1710000000",
                    type: "text",
                    text: { body: "Hello" }
                  }
                ],
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

    capture_logs do |logs|
      with_modified_env("WHATSAPP_BUSINESS_ACCOUNT_ID" => "waba-123") do
        stub_redis(results: [true, true]) do
          WhatsappWebhookEventJob.perform_now(payload)
        end
      end

      assert logs.any? { |payload| payload[:event] == "whatsapp.webhook.message_received" }
      assert logs.any? { |payload| payload[:event] == "whatsapp.webhook.status_received" }
    end
  end

  test "duplicate webhook events are ignored idempotently" do
    create_booking!(create_homestay!)
    event = {
      "event_type" => "message",
      "event_id" => "wamid.message.duplicate",
      "entry_id" => "waba-123",
      "message_id" => "wamid.message.duplicate",
      "from_phone" => "919309800427",
      "to_phone_number_id" => "phone-number-id",
      "timestamp" => "1710000000",
      "message_type" => "text",
      "payload" => { "text" => { "body" => "Hello" } }
    }

    capture_logs do |logs|
      stub_redis(results: [true, nil]) do
        assert_equal :processed, Whatsapp::WebhookEventProcessor.new(event).call
        assert_equal :duplicate, Whatsapp::WebhookEventProcessor.new(event).call
      end

      assert logs.any? { |payload| payload[:event] == "whatsapp.webhook.duplicate_ignored" }
    end
  end

  test "webhook processing prefers active bookings when phone matches multiple bookings" do
    homestay = create_homestay!
    older_booking = create_booking!(homestay)
    older_booking.update_column(:status, Booking.statuses[:rejected])
    newer_booking = homestay.bookings.create!(
      guest_name: "Webhook Guest Followup",
      guest_email: "webhook-followup@example.com",
      guest_phone: "0091 9309800427",
      check_in_date: Date.new(2026, 12, 10),
      check_out_date: Date.new(2026, 12, 12),
      number_of_guests: 2,
      total_price: 1000,
      status: :pending
    )

    event = {
      "event_type" => "status",
      "event_id" => "wamid.status.multi",
      "entry_id" => "waba-123",
      "message_id" => "wamid.status.multi",
      "recipient_phone" => "919309800427",
      "to_phone_number_id" => "phone-number-id",
      "timestamp" => "1710000001",
      "status" => "delivered",
      "payload" => { "id" => "wamid.status.multi" }
    }

    capture_logs do |logs|
      stub_redis(results: [true]) do
        assert_equal :processed, Whatsapp::WebhookEventProcessor.new(event).call
      end

      status_log = logs.find { |payload| payload[:event] == "whatsapp.webhook.status_received" }
      assert_equal newer_booking.id, status_log[:booking_id]
      refute_equal older_booking.id, status_log[:booking_id]
    end
  end
end
