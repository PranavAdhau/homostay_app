# Final Application Testing Guide

## Quick Smoke Test (2 Minutes)

Steps:

1. Start backend and frontend servers.
2. Open homepage.
3. Verify homestay cards load.
4. Click **Book Now** on a property.
5. Submit booking form.
6. Verify booking saved via:

```ruby
Booking.last
```

This helps developers quickly verify system health.

## 1. Application Startup Verification

Steps to confirm:

* Rails server runs
* React frontend runs
* API communication works

Include commands such as:

```bash
cd /home/pranav/homostay_app/server
rails db:prepare
rails db:migrate:status
rails routes
rails s
```
Ensure no migration errors exist and the server binds to `localhost:3000`.

**Frontend (React/Vite)**
```bash
cd /home/pranav/homostay_app/client
npm run dev
```
Ensure the development server starts without errors and binds to `localhost:5173`.

## 2. Database Verification

Using **Rails console**, verify database integrity.

Examples:

```ruby
Homestay.count
Amenity.count
Booking.count
AvailabilitySlot.count
```

Test relationships:

```ruby
Homestay.first.amenities
Homestay.first.bookings

Amenity.first.homestays

AvailabilitySlot.first.homestay
AvailabilitySlot.first.booking
```

## 3. Model Validation Testing

Use Rails console to test validations.

Examples:

```ruby
booking = Booking.new(
  homestay_id: Homestay.first.id,
  guest_name: "John Doe",
  guest_email: "john@example.com",
  guest_phone: "1234567890",
  check_in_date: Date.tomorrow,
  check_out_date: Date.tomorrow + 2.days,
  number_of_guests: 2,
  total_price: 300
)
booking.valid? # Expected output: true
```

Include invalid cases:

* missing guest name
* invalid email
* check_out_date before check_in_date
* guest count exceeding homestay capacity

Explain expected validation errors.

```ruby
# Missing guest name
booking.guest_name = nil
booking.valid? # Expected output: false (Presence validation triggers)
booking.errors.full_messages

# Invalid email
booking.guest_name = "John Doe"
booking.guest_email = "not-an-email"
booking.valid? # Expected output: false (Format validation triggers)
booking.errors.full_messages

# Check-out before Check-in
booking.guest_email = "john@example.com"
booking.check_in_date = Date.tomorrow + 3.days
booking.check_out_date = Date.tomorrow
booking.valid? # Expected output: false (Chronological validation triggers)
booking.errors.full_messages

# Guest count exceeds capacity
booking.check_in_date = Date.tomorrow
booking.check_out_date = Date.tomorrow + 2.days
booking.number_of_guests = 50 
booking.valid? # Expected output: false (Capacity validation triggers)
```

## 4. Availability System Testing

Test availability logic.

Using Rails console:

```ruby
hs = Homestay.first

# 1. Create a base booking
Booking.create!(homestay_id: hs.id, guest_name: "Test1", guest_email: "test1@test.com", guest_phone: "1234567890", number_of_guests: 1, check_in_date: Date.today + 10.days, check_out_date: Date.today + 15.days, total_price: 500)

# 2. Attempt an overlapping booking (Starts during existing)
overlap1 = Booking.new(homestay_id: hs.id, guest_name: "Test2", guest_email: "test2@test.com", guest_phone: "1234567890", number_of_guests: 1, check_in_date: Date.today + 12.days, check_out_date: Date.today + 16.days, total_price: 400)
overlap1.valid? # Expected output: false (Overlapping dates error)

# 3. Attempt a same-date-range booking
overlap2 = Booking.new(homestay_id: hs.id, guest_name: "Test3", guest_email: "test3@test.com", guest_phone: "1234567890", number_of_guests: 1, check_in_date: Date.today + 10.days, check_out_date: Date.today + 15.days, total_price: 500)
overlap2.valid? # Expected output: false (Overlapping dates error)
```

Test edge cases:

* overlapping booking
* same date range
* booking across month boundaries

Verification of **AvailabilitySlot records**:

```ruby
Booking.last.availability_slots
AvailabilitySlot.where(is_blocked: true)
AvailabilitySlot.where(homestay: Homestay.first)
```

Also verify slot date ranges:

```ruby
AvailabilitySlot.where(homestay: Homestay.first).pluck(:start_datetime, :end_datetime)
```

Expected behavior:

* slots should be created for booked date ranges mapping exactly to the booked boundaries.
* overlapping bookings should not be allowed.

## 5. API Endpoint Testing

Document all API endpoints such as:

```bash
GET /api/v1/homestays
GET /api/v1/homestays/:slug
GET /api/v1/homestays/:slug/availability
POST /api/v1/bookings
GET /api/v1/amenities
```

Provide examples using `curl`.

Example:

```bash
curl http://localhost:3000/api/v1/homestays
```

Availability example:

```bash
curl "http://localhost:3000/api/v1/homestays/kontena-deluxe/availability?start_date=2026-06-01&end_date=2026-06-10"
```

Expected response:

```json
{
  "blocked_dates": [
    "2026-06-01",
    "2026-06-02",
    "2026-06-03"
  ]
}
```

Dates returned in blocked_dates should appear disabled in the frontend calendar UI.

Booking example:

```bash
curl -X POST http://localhost:3000/api/v1/bookings \
-H "Content-Type: application/json" \
-d '{
  "booking": {
    "homestay_id": 1,
    "guest_name": "Test User",
    "guest_email": "test@test.com",
    "guest_phone": "9999999999",
    "check_in_date": "2026-05-01",
    "check_out_date": "2026-05-03",
    "number_of_guests": 2,
    "total_price": 300
  }
}'
```

Add Booking Status Verification using Rails console:

```ruby
Booking.last.status
```

Confirm default status behavior. Also test:

```ruby
Booking.last.homestay
Booking.last.availability_slots
```

## 6. Booking Flow Testing

Step-by-step browser interaction:

1. Open homepage
2. View homestays
3. Click **Details**
4. Click **Book Now**
5. Verify booking form auto-prefill
6. Select dates using calendar
7. Submit booking

Verify booking appears in backend.

After submitting a booking, verify the price:

Verify that:

```
total_price = nights × price_per_night
```

Example check in Rails console:

```ruby
Booking.last.total_price
Booking.last.check_out_date - Booking.last.check_in_date
Booking.last.homestay.price_per_night
```

Ensure calculations match expected pricing logic.

Also test deep-link booking behavior.

Example route:

```
http://localhost:5173/?homestay_id=1#booking
```

Verify:

* page scrolls to booking section
* homestay dropdown auto-selects the correct property

## 7. Calendar Testing

Verify:

* month grid selection
* year grid selection
* disabled past dates
* blocked availability dates
* range selection behavior

Add edge case:

Selecting same check_in_date and check_out_date

Expected result:

Validation error.

Test scenario:

Selecting a start date, navigating to a different month, then selecting the end date.

Expected behavior:

* Date range selection persists correctly.
* Calendar does not reset the start date unexpectedly.

## 8. Navigation Testing

Test header and footer links.

Verify anchor navigation:

```
#homestays
#booking
#amenities
```

Test:

* from homepage
* from property page
* from admin page

Ensure scroll behavior works.

## 9. Mobile UI Testing

Using browser mobile view:

Verify:

* hamburger menu navigation
* smooth scroll after menu close
* responsive card layout
* calendar rendering
* viewport width constraints

Add device rotation test.

## 10. Admin Panel Testing

Navigate to:

```
/admin
```

Test:

* admin login
* create homestay
* edit homestay
* upload images
* add amenities
* deactivate homestay

Verify **no booking_type field exists**.

Add slug verification.

Example:

Create property:

```
My Test Villa
```

Expected slug:

```
my-test-villa
```

Also verify API access:

```bash
GET /api/v1/homestays/my-test-villa
```

## 11. Calendar Sync Testing

Verify iCal sync functionality.

Test:

* importing bookings
* blocking availability
* duplicate prevention

Add Rails console checks:

```ruby
Homestay.first.airbnb_ical_url
Homestay.first.calendar_sync_enabled
```

After sync:

```ruby
AvailabilitySlot.where(is_blocked: true).count
```

Ensure external bookings block local availability.

## 12. Edge Case Testing

Include tests such as:

* overlapping bookings
* booking with past dates
* check_out_date before check_in_date
* guest count exceeding capacity
* malformed JSON payload
* empty homestay dataset
* homestay deletion

Document expected behavior for each case.

## 13. Production QA Checklist

### Concurrency tests

Simultaneous booking requests.

Example:

```bash
curl -X POST http://localhost:3000/api/v1/bookings \
-H "Content-Type: application/json" \
-d '{"booking": {"homestay_id": 1, "guest_name": "T1", "guest_email": "t@t.com", "guest_phone": "1", "check_in_date": "2026-06-01", "check_out_date": "2026-06-05", "number_of_guests": 2, "total_price": 400}}' & \
curl -X POST http://localhost:3000/api/v1/bookings \
-H "Content-Type: application/json" \
-d '{"booking": {"homestay_id": 1, "guest_name": "T2", "guest_email": "t@t.com", "guest_phone": "1", "check_in_date": "2026-06-01", "check_out_date": "2026-06-05", "number_of_guests": 2, "total_price": 400}}' &
```

Note: Run these commands in a terminal while the Rails server is running.

Expected result:

Only one booking succeeds. The trailing request hits the database validation lock and fails cleanly detailing a booking collision.

### API abuse tests

Test:

```
missing parameters
invalid date format
malformed JSON
```

Expected result:

400 or 422 errors. The API must respond without throwing a backend 500 fatal exception.

### Rate limiting / spam

Simulate repeated requests.

Expected:

* requests handled safely
* system does not crash.

### Data integrity tests

Verify AvailabilitySlot lifecycle.

Example:

```ruby
booking = Booking.create!(homestay_id: 1, guest_name: "T1", guest_email: "t@t.com", guest_phone: "1", check_in_date: Date.tomorrow, check_out_date: Date.tomorrow + 3.days, number_of_guests: 1, total_price: 150)
puts AvailabilitySlot.where(booking_id: booking.id).count

booking.destroy

puts AvailabilitySlot.where(booking_id: booking.id).count
```

Expected behavior:

* AvailabilitySlot records should be **deleted when a booking is destroyed**.
* There must be **no orphaned slots blocking availability**.

Expected result:

```
0
```

### Frontend resilience

Test:

* offline network
* duplicate form submission
* slow API response

Expected:

* UI error handling catches and displays friendly responses smoothly.
* no crashes. Double-click submissions are trapped dynamically.
