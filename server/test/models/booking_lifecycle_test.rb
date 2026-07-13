require "test_helper"

class BookingLifecycleTest < ActiveSupport::TestCase
  setup do
    clear_enqueued_jobs
  end

  teardown do
    clear_enqueued_jobs
  end

  def create_homestay!
    Homestay.create!(
      name: "Lifecycle Stay",
      slug: SecureRandom.hex(6),
      description: "Lifecycle stay description",
      capacity: 4,
      rooms: 2,
      price_per_night: 500,
      is_active: true
    )
  end

  def create_pending_booking!(homestay)
    homestay.bookings.create!(
      guest_name: "Lifecycle Guest",
      guest_email: "lifecycle@example.com",
      guest_phone: "+91 9309800427",
      check_in_date: Date.new(2026, 9, 10),
      check_out_date: Date.new(2026, 9, 13),
      number_of_guests: 2,
      total_price: 1500,
      status: :pending
    )
  end

  test "reject! returns true when reservation hold has expired and enqueues guest rejection notification" do
    homestay = create_homestay!
    booking = create_pending_booking!(homestay)
    booking.create_reservation_hold!(
      homestay: homestay,
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      expires_at: 10.minutes.ago,
      token: SecureRandom.uuid
    )

    assert_enqueued_with(job: WhatsappUserRejectionJob) do
      assert_equal true, booking.reject!
    end
    assert_equal "rejected", booking.reload.status
  end

  test "complete! returns true after releasing inventory" do
    homestay = create_homestay!
    booking = create_pending_booking!(homestay)
    booking.update_column(:status, :approved)
    CalendarSync::SlotReconciler.call(booking)

    assert_equal true, booking.complete!
    assert_equal "completed", booking.reload.status
    assert_empty booking.reload.availability_slots
  end
end
