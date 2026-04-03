class Admin::DashboardController < Admin::BaseController
  def index
    @total_homestays = Homestay.count
    @active_homestays = Homestay.active.count
    @total_bookings = Booking.count
    @pending_bookings = Booking.pending.count
    @approved_bookings = Booking.approved.count
    @recent_bookings = Booking.order(created_at: :desc).limit(5)
  end
end
