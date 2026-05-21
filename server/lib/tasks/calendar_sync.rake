namespace :calendar_sync do
  desc "Enqueue due Airbnb calendar sync jobs"
  task enqueue_due: :environment do
    CalendarSync::EnqueueDueHomestays.call
  end
end
