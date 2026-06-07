class Admin::Api::V1::DashboardController < Admin::Api::V1::BaseController
  def stats
    stats = {
      total_homestays: Homestay.count,
      active_homestays: Homestay.active.count,
      total_bookings: Booking.count,
      pending_bookings: Booking.pending.count,
      approved_bookings: Booking.approved.count,
      rejected_bookings: Booking.rejected.count,
      completed_bookings: Booking.completed.count
    }
    
    render_success(data: stats)
  end
end
