class CalendarSyncJob < ApplicationJob
  queue_as :default

  MAX_HOMESTAYS_PER_RUN = 50
  MAX_CONCURRENT_FETCHES = 10

  def perform
    homestays = Homestay.where(calendar_sync_enabled: true)
                        .where.not(airbnb_ical_url: [nil, ""])
                        .order(Arel.sql("last_calendar_sync_at NULLS FIRST"))
                        .limit(MAX_HOMESTAYS_PER_RUN)

    threads = []
    semaphore = Mutex.new
    queue = homestays.to_a

    MAX_CONCURRENT_FETCHES.times do
      threads << Thread.new do
        loop do
          homestay = semaphore.synchronize { queue.shift }
          break unless homestay

          CalendarSync::SyncHomestay.call(homestay)
        end
      end
    end

    threads.each(&:join)
  end
end

