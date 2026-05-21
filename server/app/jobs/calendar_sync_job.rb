class CalendarSyncJob < ApplicationJob
  queue_as :default

  retry_on StandardError, wait: :polynomially_longer, attempts: 5

  def perform(homestay_id, trigger: "background")
    homestay = Homestay.find_by(id: homestay_id)
    return unless homestay

    CalendarSync::SyncHomestay.call(homestay, trigger: trigger)
  end
end

