require "test_helper"

class TelegramBookingJobTest < ActiveSupport::TestCase
  def create_homestay!
    Homestay.create!(
      name: "Telegram Job Stay",
      slug: SecureRandom.hex(6),
      description: "Telegram job stay description",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true
    )
  end

  def create_booking!(homestay)
    homestay.bookings.create!(
      guest_name: "Telegram Guest",
      guest_email: "telegram@example.com",
      guest_phone: "+91 9309800427",
      check_in_date: Date.new(2026, 10, 10),
      check_out_date: Date.new(2026, 10, 12),
      number_of_guests: 2,
      total_price: 1000,
      status: :pending
    )
  end

  def stub_telegram_service(result:)
    captured = []
    original_new = TelegramService.method(:new)

    TelegramService.define_singleton_method(:new) do |**kwargs|
      captured << kwargs
      Struct.new(:call).new(result)
    end

    yield captured
  ensure
    TelegramService.define_singleton_method(:new) do |**kwargs|
      original_new.call(**kwargs)
    end
  end

  test "booking job sends telegram host notification and marks host notification sent on success" do
    booking = create_booking!(create_homestay!)
    result = Struct.new(:success?).new(true)

    stub_telegram_service(result: result) do |calls|
      TelegramBookingJob.perform_now(booking)

      assert_equal 1, calls.size
      assert_equal booking, calls.first[:booking]
    end

    assert_equal true, booking.reload.host_notification_sent?
  end

  test "booking job skips telegram send when host notification has already been recorded" do
    booking = create_booking!(create_homestay!)
    booking.update_column(:whatsapp_message_sent, true)

    stub_telegram_service(result: Struct.new(:success?).new(true)) do |calls|
      TelegramBookingJob.perform_now(booking)
      assert_empty calls
    end
  end
end
