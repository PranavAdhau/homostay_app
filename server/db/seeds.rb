# frozen_string_literal: true

require "date"

ADMIN_EMAIL = ENV.fetch("SEED_ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = ENV.fetch("SEED_ADMIN_PASSWORD", "password123")

AMENITIES = [
  { name: "WiFi", icon_name: "wifi" },
  { name: "AC", icon_name: "snowflake" },
  { name: "Kitchen", icon_name: "utensils" },
  { name: "TV", icon_name: "tv" },
  { name: "Parking", icon_name: "car" },
  { name: "Bathroom", icon_name: "bath" },
  { name: "Hot Water", icon_name: "droplets" },
  { name: "Mountain View", icon_name: "mountain" },
  { name: "Workspace", icon_name: "briefcase" },
  { name: "Fire Pit", icon_name: "flame" }
].freeze

HOMESTAYS = [
  {
    name: "Sacred Peak Villa",
    description: "A peaceful hill-facing stay with a private deck, sunrise views, and a quiet workspace for longer stays.",
    capacity: 6,
    rooms: 3,
    size: "1200 sqft",
    price_per_night: 320.0,
    is_active: true,
    latitude: 12.971600,
    longitude: 77.594600,
    address: "Hillside Retreat Road, Bengaluru",
    amenity_names: ["WiFi", "AC", "Kitchen", "TV", "Parking", "Hot Water", "Mountain View", "Workspace"]
  },
  {
    name: "Forest Glass Cabin",
    description: "A romantic cabin for couples with panoramic windows, cozy interiors, and easy access to nearby walking trails.",
    capacity: 2,
    rooms: 1,
    size: "480 sqft",
    price_per_night: 210.0,
    is_active: true,
    latitude: 12.295810,
    longitude: 76.639381,
    address: "Misty Woods Trail, Mysuru",
    amenity_names: ["WiFi", "AC", "Bathroom", "Hot Water", "Mountain View", "Fire Pit"]
  },
  {
    name: "Lakeview Family Lodge",
    description: "A spacious family-friendly homestay with two bedrooms, a full kitchen, and easy outdoor access for group stays.",
    capacity: 8,
    rooms: 4,
    size: "1600 sqft",
    price_per_night: 390.0,
    is_active: true,
    latitude: 11.016846,
    longitude: 76.955833,
    address: "Lakeside Drive, Coimbatore",
    amenity_names: ["WiFi", "AC", "Kitchen", "TV", "Parking", "Bathroom", "Hot Water"]
  },
  {
    name: "Garden Courtyard Stay",
    description: "A calm courtyard stay designed for small families and weekend travelers who want a simple nature-focused escape.",
    capacity: 4,
    rooms: 2,
    size: "850 sqft",
    price_per_night: 180.0,
    is_active: true,
    latitude: 15.299326,
    longitude: 74.123996,
    address: "Green Grove Lane, Goa",
    amenity_names: ["WiFi", "Kitchen", "Parking", "Bathroom", "Hot Water", "Workspace"]
  }
].freeze

BLOGS = [
  {
    title: "How to Choose the Right Homestay for a Weekend Getaway",
    content: "Picking the right stay starts with location, guest capacity, and whether the amenities match the kind of trip you want to have. Look for flexible arrival windows, strong communication, and clear house rules before booking.",
    is_published: true
  },
  {
    title: "Packing Tips for a Scenic Nature Retreat",
    content: "Bring comfortable layers, simple walking shoes, and a charger setup that works even when you spend most of the day outside. If your trip includes a workation, confirm WiFi strength and bring a small desk-ready kit.",
    is_published: true
  }
].freeze

def upsert_site_setting!
  site_setting = SiteSetting.first_or_initialize
  site_setting.assign_attributes(
    phone: "9743340477",
    email: "pranavadhau2003@gmail.com",
    instagram: "https://www.instagram.com/sacredhomes.in",
    address: "India",
    whatsapp_number: "9743340477"
  )
  site_setting.save!
  puts "Site setting ready"
end

def upsert_admin_user!
  admin_user = AdminUser.find_or_initialize_by(email: ADMIN_EMAIL)
  admin_user.password = ADMIN_PASSWORD
  admin_user.password_confirmation = ADMIN_PASSWORD
  admin_user.save!
  puts "Admin user ready: #{ADMIN_EMAIL}"
end

def upsert_amenities!
  AMENITIES.each_with_object({}) do |attrs, amenities_by_name|
    amenity = Amenity.find_or_initialize_by(name: attrs[:name])
    amenity.icon_name = attrs[:icon_name]
    amenity.save!
    amenities_by_name[attrs[:name]] = amenity
  end
end

def upsert_homestays!(amenities_by_name)
  HOMESTAYS.each_with_object({}) do |attrs, homestays_by_name|
    amenity_names = attrs[:amenity_names]
    homestay = Homestay.find_or_initialize_by(name: attrs[:name])
    homestay.assign_attributes(attrs.except(:amenity_names))
    homestay.save!
    homestay.amenities = amenity_names.map { |name| amenities_by_name.fetch(name) }
    puts "Homestay ready: #{homestay.name}"
    homestays_by_name[attrs[:name]] = homestay
  end
end

def nights_between(check_in_date, check_out_date)
  (check_out_date - check_in_date).to_i
end

def create_or_update_booking_slot!(booking)
  booking.availability_slots.destroy_all

  (booking.check_in_date...booking.check_out_date).each do |date|
    AvailabilitySlot.create!(
      homestay: booking.homestay,
      booking: booking,
      start_datetime: date.beginning_of_day,
      end_datetime: date.end_of_day,
      is_blocked: false
    )
  end
end

def upsert_bookings!(homestays_by_name)
  today = Date.current
  booking_blueprints = [
    {
      homestay_name: "Sacred Peak Villa",
      guest_email: "aarav@example.com",
      guest_name: "Aarav Sharma",
      guest_phone: "+919999000111",
      check_in_date: today + 10,
      check_out_date: today + 13,
      number_of_guests: 4,
      status: :approved,
      source: :website,
      whatsapp_message_sent: true
    },
    {
      homestay_name: "Forest Glass Cabin",
      guest_email: "meera@example.com",
      guest_name: "Meera Nair",
      guest_phone: "+919999000222",
      check_in_date: today + 15,
      check_out_date: today + 17,
      number_of_guests: 2,
      status: :confirmed,
      source: :manual,
      whatsapp_message_sent: true
    },
    {
      homestay_name: "Lakeview Family Lodge",
      guest_email: "kabir@example.com",
      guest_name: "Kabir Patel",
      guest_phone: "+919999000333",
      check_in_date: today + 20,
      check_out_date: today + 24,
      number_of_guests: 6,
      status: :pending,
      source: :website,
      whatsapp_message_sent: true
    },
    {
      homestay_name: "Garden Courtyard Stay",
      guest_email: "ananya@example.com",
      guest_name: "Ananya Rao",
      guest_phone: "+919999000444",
      check_in_date: today + 28,
      check_out_date: today + 30,
      number_of_guests: 3,
      status: :rejected,
      source: :website,
      whatsapp_message_sent: true
    }
  ]

  booking_blueprints.each do |attrs|
    homestay = homestays_by_name.fetch(attrs[:homestay_name])
    check_in_date = attrs[:check_in_date]
    check_out_date = attrs[:check_out_date]
    total_price = homestay.price_per_night * nights_between(check_in_date, check_out_date)

    booking = Booking.find_or_initialize_by(
      homestay: homestay,
      guest_email: attrs[:guest_email],
      check_in_date: check_in_date,
      check_out_date: check_out_date
    )

    booking.assign_attributes(
      guest_name: attrs[:guest_name],
      guest_phone: attrs[:guest_phone],
      number_of_guests: attrs[:number_of_guests],
      total_price: total_price,
      status: attrs[:status],
      source: attrs[:source],
      whatsapp_message_sent: attrs[:whatsapp_message_sent]
    )
    booking.save!

    create_or_update_booking_slot!(booking) if booking.approved? || booking.confirmed?
    puts "Booking ready: #{booking.guest_name} -> #{homestay.name} (#{booking.status})"
  end
end

def upsert_manual_block!(homestays_by_name)
  homestay = homestays_by_name.fetch("Garden Courtyard Stay")
  start_date = Date.current + 35
  end_date = Date.current + 37

  AvailabilitySlot.where(
    homestay: homestay,
    booking_id: nil,
    start_datetime: start_date.beginning_of_day..end_date.end_of_day
  ).delete_all

  (start_date...end_date).each do |date|
    AvailabilitySlot.find_or_create_by!(
      homestay: homestay,
      booking: nil,
      start_datetime: date.beginning_of_day,
      end_datetime: date.end_of_day
    ) do |slot|
      slot.is_blocked = true
    end
  end

  puts "Manual availability block ready: #{homestay.name}"
end

def upsert_blogs!
  BLOGS.each do |attrs|
    blog = Blog.find_or_initialize_by(title: attrs[:title])
    blog.assign_attributes(attrs)
    blog.save!
    puts "Blog ready: #{blog.title}"
  end
end

ActiveRecord::Base.transaction do
  upsert_site_setting!
  upsert_admin_user!
  amenities_by_name = upsert_amenities!
  homestays_by_name = upsert_homestays!(amenities_by_name)
  upsert_bookings!(homestays_by_name)
  upsert_manual_block!(homestays_by_name)
  upsert_blogs!
end

puts "Seed data is ready for #{Rails.env}"
