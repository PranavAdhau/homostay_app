require "test_helper"

class WhatsappBookingJobTest < ActiveSupport::TestCase
  def with_modified_env(overrides)
    original = overrides.transform_values { nil }
    overrides.each_key { |key| original[key] = ENV[key] }
    overrides.each { |key, value| ENV[key] = value }
    yield
  ensure
    original.each { |key, value| ENV[key] = value }
  end

  def create_homestay!
    Homestay.create!(
      name: "WhatsApp Job Stay",
      slug: SecureRandom.hex(6),
      description: "WhatsApp job stay description",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true
    )
  end

  def create_booking!(homestay)
    homestay.bookings.create!(
      guest_name: "WhatsApp Guest",
      guest_email: "whatsapp@example.com",
      guest_phone: "+91 9309800427",
      check_in_date: Date.new(2026, 10, 10),
      check_out_date: Date.new(2026, 10, 12),
      number_of_guests: 2,
      total_price: 1000,
      status: :pending
    )
  end

  def stub_whatsapp_service(result:)
    captured = []
    original_new = WhatsappService.method(:new)

    WhatsappService.define_singleton_method(:new) do |**kwargs|
      captured << kwargs
      Struct.new(:call).new(result)
    end

    yield captured
  ensure
    WhatsappService.define_singleton_method(:new) do |**kwargs|
      original_new.call(**kwargs)
    end
  end

  test "booking job sends host template and marks whatsapp_message_sent on success" do
    booking = create_booking!(create_homestay!)
    result = Struct.new(:success?).new(true)

    with_modified_env("ADMIN_WHATSAPP_NUMBER" => "919309800427") do
      stub_whatsapp_service(result: result) do |calls|
        WhatsappBookingJob.perform_now(booking)

        assert_equal 1, calls.size
        assert_equal "919309800427", calls.first[:phone_number]
        assert_equal "booking_request_host", calls.first[:template_name]
        assert_equal booking.id, calls.first[:booking_id]
      end

      assert_equal true, booking.reload.whatsapp_message_sent
    end
  end

  test "guest confirmation job sends the booking confirmed template" do
    booking = create_booking!(create_homestay!)
    result = Struct.new(:success?).new(true)

    stub_whatsapp_service(result: result) do |calls|
      WhatsappUserConfirmationJob.perform_now(booking)

      assert_equal 1, calls.size
      assert_equal booking.guest_phone, calls.first[:phone_number]
      assert_equal "booking_confirmed", calls.first[:template_name]
      assert_equal [booking.guest_name], calls.first[:template_parameters]
    end
  end

  test "guest acknowledgement job sends the booking request received template" do
    booking = create_booking!(create_homestay!)
    result = Struct.new(:success?).new(true)

    stub_whatsapp_service(result: result) do |calls|
      WhatsappGuestAcknowledgementJob.perform_now(booking)

      assert_equal 1, calls.size
      assert_equal booking.guest_phone, calls.first[:phone_number]
      assert_equal "booking_request_received", calls.first[:template_name]
      assert_equal [booking.guest_name], calls.first[:template_parameters]
    end
  end

  test "guest rejection job sends the booking rejected template" do
    booking = create_booking!(create_homestay!)
    result = Struct.new(:success?).new(true)

    stub_whatsapp_service(result: result) do |calls|
      WhatsappUserRejectionJob.perform_now(booking)

      assert_equal 1, calls.size
      assert_equal booking.guest_phone, calls.first[:phone_number]
      assert_equal "booking_rejected", calls.first[:template_name]
      assert_equal [booking.guest_name], calls.first[:template_parameters]
    end
  end
end
