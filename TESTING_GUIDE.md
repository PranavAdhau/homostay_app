### Full Application Testing Guide

#### Backend — API Endpoints

- **GET /api/v1/homestays**
  - Returns list of active homestays.
  - Each item includes: id, slug, name, description, capacity, size, price_per_night, latitude, longitude, address, amenities, images, featured_image.
  - Verify:
    - Response status 200.
    - `success` flag is true.
    - At least one homestay is returned (after seeding).

- **GET /api/v1/homestays/:slug**
  - Fetch a single homestay by slug.
  - Verify:
    - Passing a valid slug returns 200 and `success: true`.
    - Data includes all fields from index plus timestamps and `is_active`.
    - Invalid slug returns 404 with error message.

- **GET /api/v1/homestays/:slug/availability**
  - Returns available and unavailable dates for the next 90 days.
  - Verify:
    - Default range works without explicit params.
    - Passing `start_date` / `end_date` limits the range.
    - `available_dates` + `unavailable_dates` cover the full range with no gaps.

- **POST /api/v1/bookings**
  - Creates a new booking.
  - Payload:
    - `booking[homestay_id]`
    - `booking[guest_name]`
    - `booking[guest_email]`
    - `booking[guest_phone]`
    - `booking[check_in_date]`
    - `booking[check_out_date]`
    - `booking[number_of_guests]`
    - `booking[total_price]`
  - Verify:
    - Valid payload returns 201 and `success: true`.
    - Booking is persisted in DB with correct totals and dates.
    - Overlapping / invalid dates are rejected with 422.

- **GET /api/v1/bookings/:id**
  - Fetch a single booking.
  - Verify:
    - Returns correct booking and associated homestay info.
    - Invalid id returns 404.

- **GET /api/v1/site_settings**
  - Returns current public site settings.
  - Verify:
    - Fields: phone, email, instagram, address, whatsapp_number.
    - Values match what is configured in the admin “Site Settings” page.

- **Admin API (authenticated via Devise)**
  - `GET /admin/api/v1/homestays`
  - `POST /admin/api/v1/homestays`
  - `PATCH /admin/api/v1/homestays/:id`
  - `GET /admin/api/v1/amenities`
  - `GET /admin/api/v1/bookings`
  - `PATCH /admin/api/v1/bookings/:id/approve|reject|confirm`
  - `GET /admin/api/v1/site_setting`
  - `PATCH /admin/api/v1/site_setting`
  - Verify:
    - All endpoints require admin authentication.
    - CRUD flows for homestays and settings work end‑to‑end.

---

#### Frontend — Desktop Web

- **Homepage (`/`)**
  - Hero section:
    - Shows “Sacred Homes – Varanasi” headline.
    - Subtext mentions ghats, temples, and Kashi / Benaras.
    - Background image loads correctly.
  - Navigation:
    - Clicking “Home / Homestays / Booking / Reviews / Contact” smooth‑scrolls to the correct section.
    - Logo click scrolls to top.
  - Content:
    - No references to Melaka, Kontento, Malaysia, or container homestays.
    - Copy is Varanasi/Sacred Homes specific throughout hero, homestays, booking, reviews, and contact sections.

- **Homestays Section**
  - Cards load dynamically from `GET /api/v1/homestays`.
  - Each card shows:
    - Name, short description, price per night.
    - Capacity chip (“Up to X guests”).
    - Amenities badges.
  - Amenity badges:
    - Use icons from centralized `amenityIcons` mapping.
    - Layout remains responsive for many badges (wraps nicely, no overflow).

- **Booking Section**
  - Homestay dropdown:
    - Populated from API.
    - Selecting a homestay updates capacity limits for guests.
  - Date pickers:
    - Check‑in cannot be in the past.
    - Check‑out must be at least 1 day after check‑in.
    - Dates disabled according to availability API.
  - Summary:
    - "Nights" and "Total" update when dates/homestay change.
  - Submission:
    - All required fields validated on client (no empty name/email/phone/dates).
    - On success, confirmation modal appears and form resets.

- **Reviews Section**
  - Reviews text references Varanasi / Kashi, not Melaka.
  - Avatar images:
    - Perfect circles.
    - `object-fit: cover` (no stretching).
    - Consistent size on all cards.

- **Contact Section**
  - Phone, email, and address values come from dynamic Site Settings.
  - Clicking phone opens dialer; clicking email opens mail client.
  - Text references homestays in Varanasi and staying near ghats/temples.

- **Footer**
  - Contact info (phone, email, address) uses Site Settings values.
  - Instagram link uses Site Settings `instagram` URL.
  - Copyright:
    - Shows “© Sacred Homes Varanasi”.
    - No references to Kontento or Melaka.

- **WhatsApp Floating Button**
  - Visible on all public pages.
  - On click:
    - Opens `https://wa.me/{whatsapp_number}` where `whatsapp_number` comes from Site Settings.
    - Pre‑filled message works.
  - Position:
    - Bottom‑right.
    - Does not overlap footer or key CTA buttons on common viewport sizes.

---

#### Property Detail Page (`/properties/:slug`)

- **Gallery**
  - Swipe/arrow navigation works on desktop and mobile.
  - Thumbnails update active state correctly.
  - No layout shift when changing images.

- **Details Card**
  - Title, capacity, size, and description render correctly for the chosen homestay.
  - Price formatted correctly (currency and unit).
  - Amenities:
    - Use centralized amenity icon mapping.
    - Missing icons fall back to a generic check icon.

- **Map Section**
  - “Where you’ll be” block shows:
    - Address from homestay if provided, else fallback message.
  - Map:
    - Loads interactive Leaflet map immediately (no static‐image gate).
    - Shows a single marker at adjusted display coordinates.
    - Allows zoom in/out, drag, and scroll wheel zoom.
  - Zoom controls:
    - Appear as two vertically stacked rounded buttons.
    - Have hover state and subtle shadow.
    - No distorted or stretched shapes.
  - “View larger map” link opens Google Maps with correct coordinates.

---

#### Admin Dashboard & Forms

- **Admin Login**
  - Devise login works.
  - After login, redirected to Admin Dashboard.

- **Admin → Homestays**
  - List:
    - Shows all homestays with status and basic info.
  - New/Edit Homestay:
    - Property Details card includes:
      - Name, description, capacity, size, price per night.
      - Location section with:
        - Address.
        - Google Maps URL.
        - Latitude.
        - Longitude.
      - Confirm that there is **no separate standalone Location card**.
    - Price field:
      - Starts empty for new homestays.
      - User can clear and retype without a leading `0` reappearing.
      - Numeric only; no spinner arrows visible in Chrome/Edge.
    - Calendar sync block behaves as expected:
      - Enabling sync requires valid Airbnb iCal URL.
      - Read‑only sync status fields populate when sync runs.

- **Admin → Amenities**
  - (Read‑only from API)
  - Ensure all amenities that appear in frontend have corresponding names that map to icons where applicable.

- **Admin → Bookings**
  - List bookings with correct statuses.
  - Approve / Reject / Confirm actions:
    - Update booking status via admin API.
    - Trigger expected side effects (emails / WhatsApp jobs if configured).

- **Admin → Site Settings**
  - Initial load:
    - Form is prefilled with values from `SiteSetting.instance`.
  - Update:
    - Changing phone, email, instagram, address, or WhatsApp number:
      - Persists to DB.
      - Immediately reflected in:
        - Header contact info.
        - Footer contact info and Instagram link.
        - Contact section cards.
        - WhatsApp floating button number.

---

#### Mobile & Responsive Testing

- **Navigation**
  - Mobile menu opens/closes smoothly.
  - Menu items scroll to the correct sections after closing.
  - Header remains sticky and does not overlap content.

- **Cards & Sections**
  - Homestay cards stack as a single column on small screens.
  - Text remains readable (no clipping or overflow).
  - Buttons are easily tappable.

- **Map**
  - Property map remains interactive on mobile:
    - Drag and pinch/zoom work.
    - Zoom buttons are accessible and not too small.
  - Map container height is appropriate for small screens.

- **WhatsApp Button**
  - Floating button visible and tappable on mobile.
  - Does not cover bottom navigation or main CTAs.

---

#### Final Regression Checklist

- No references to:
  - Melaka
  - Malaysia
  - Kontento
  - Container homestays
- All site‑wide contact details (phone, email, address, Instagram, WhatsApp) load from Site Settings.
- Map behavior:
  - Loads immediately.
  - Has correct zoom and drag behavior.
  - Zoom buttons look clean and rounded.
- Amenity icons:
  - Render via centralized mapping on:
    - Homestay cards.
    - Property detail pages.
- Admin flows:
  - Homestay CRUD.
  - Booking listing and status updates.
  - Calendar sync configuration.
  - Site settings edit and save.

# Sacred Homes Application Testing Guide

## Backend API

- Verify `GET /api/v1/homestays` returns a list of homestays with location and amenities.
- Verify `GET /api/v1/homestays/:slug` returns a single homestay with images and amenities.
- Verify `GET /api/v1/homestays/:slug/availability` respects existing bookings and blocked slots.
- Verify `POST /api/v1/bookings`:
  - Creates a booking with valid payload.
  - Returns validation errors for missing fields or invalid dates.
  - Enqueues WhatsApp jobs (check logs or Sidekiq UI).
- Verify admin APIs:
  - `GET /admin/api/v1/homestays`
  - `POST /admin/api/v1/homestays`
  - `PATCH /admin/api/v1/homestays/:id`
  - `GET /admin/api/v1/bookings`
  - `PATCH /admin/api/v1/bookings/:id/approve|reject|confirm`
  - `GET /admin/api/v1/site_setting`
  - `PATCH /admin/api/v1/site_setting`

## WhatsApp & Background Jobs

- Create a new booking and confirm:
  - Booking is saved immediately.
  - Sidekiq enqueues `WhatsappBookingJob` and user jobs.
  - `WhatsappService` calls WhatsApp Cloud API (check logs for `[WhatsAppCloud]`).
- Temporarily break `WHATSAPP_ACCESS_TOKEN` and confirm:
  - Booking still saves.
  - Errors are logged but do not crash the request.

## Frontend – Main Site

- Home page:
  - Header brand shows “Sacred Homes” with circular logo mark.
  - Navigation scrolls smoothly to Home, Homestays, Booking, Reviews, Contact.
- Property page:
  - Gallery slider arrows and thumbnails work on desktop and mobile.
  - Info card and booking form cards are visually consistent.
  - Map section appears as a separate card below property details.
  - Static map shows blur overlay with text “Tap to interact with map”.
  - First tap loads the interactive map; Leaflet zoom buttons are rounded with shadow.
- Booking form:
  - Date pickers open/close correctly and respect unavailable dates.
  - Total price matches nights × price per night.
  - Submit creates a booking and shows confirmation overlay.

## Frontend – Admin

- Admin layout:
  - Sidebar links for Dashboard, Homestays, Bookings, Settings.
  - Active menu item matches current route.
- Homestay form:
  - Property details and location live in a single card.
  - Price field accepts normal numeric input without stuck leading zero or spinners.
  - Amenities list can be checked/unchecked and persists.
- Settings page:
  - `Admin → Settings` loads current phone, email, Instagram, address, WhatsApp number.
  - Updating values saves via API and is reflected on reload.

## Frontend – Shared Content

- Contact section:
  - Phone: `9743340477` tel link.
  - Email: `pranavadhau2003@gmail.com` mailto link.
  - Location text shows Sacred Homes address copy.
- Footer:
  - Brand shows Sacred Homes.
  - Contact info matches settings (phone, email, address).
  - Instagram link points to `https://www.instagram.com/sacredhomes.in`.
- Reviews:
  - Avatars are circular and not stretched (object-fit: cover).

## WhatsApp Floating Button

- Button appears bottom-right on all pages.
- On desktop:
  - Clicking opens `https://wa.me/9743340477` with prefilled message.
  - Does not cover primary CTAs or important UI.
- On mobile:
  - Button is still accessible and not obscured by browser chrome.

## Mobile Testing

- Test on narrow viewport (≤ 640px):
  - Header collapses to mobile menu.
  - Property gallery is swipeable.
  - Map height shrinks appropriately.
  - Admin forms remain readable, with sensible stacking.

## Performance & UX

- Initial load:
  - No blocking errors in browser console.
  - Map tiles and images load progressively.
- Interactions:
  - Navigation and calendar open/close without jank.
  - Admin pages respond promptly on form submit and navigation.

# Complete Testing Guide - Homostay App

## Prerequisites Setup

### 1. Install Dependencies

**Backend (Rails):**
```bash
cd server
bundle install
```

**Frontend (React):**
```bash
cd client
npm install
```

### 2. Database Setup

```bash
cd server

# Create database
rails db:create

# Run migrations
rails db:migrate

# Seed initial data (creates admin user, amenities, sample homestays)
rails db:seed
```

**Verify seed data:**
```bash
rails console
> AdminUser.count  # Should be 1
> Homestay.count   # Should be 3
> Amenity.count    # Should be 8
> exit
```

### 3. Start Services

**Terminal 1 - Rails Server:**
```bash
cd server
rails server
# Server runs on http://localhost:3000
```

**Terminal 2 - Vite Dev Server:**
```bash
cd client
npm run dev
# Dev server runs on http://localhost:5173
```

**Terminal 3 - Redis (for Sidekiq):**
```bash
redis-server
# Redis runs on localhost:6379
```

**Terminal 4 - Sidekiq (Background Jobs):**
```bash
cd server
bundle exec sidekiq
# Sidekiq processes background jobs
```

---

## Full User Flow Testing

### Test 1: Browse Properties (Public)

1. **Open Browser:** Navigate to `http://localhost:3000`
2. **Verify Homepage:**
   - Header with navigation links
   - Hero section
   - Homestays section showing 3 properties (from seed data)
   - Each property card shows: name, description, price, capacity, amenities
3. **Check API:** Open browser DevTools → Network tab
   - Verify `GET /api/v1/homestays` returns 200 with homestay data
   - Check that images array is present in response

**Expected Result:** All 3 homestays display correctly with their details.

---

### Test 2: View Property Details

1. **Click "Details" button** on any homestay card
2. **Verify Navigation:**
   - URL changes to `/properties/{slug}` (e.g., `/properties/kontena-deluxe`)
   - PropertyDetailPage loads
3. **Check Left Column:**
   - Image slider displays (if images exist)
   - Property name, capacity, size visible
   - Description text visible
   - Amenities list displayed
4. **Check Right Column:**
   - Booking form visible
   - Calendar component rendered
   - Guest details fields (name, email, phone)
5. **Check API Calls:**
   - `GET /api/v1/homestays/{slug}` - Returns property details
   - `GET /api/v1/homestays/{slug}/availability` - Returns availability data

**Expected Result:** Property detail page loads with all information and booking form.

---

### Test 3: Check Availability

1. **On Property Detail Page:**
   - Calendar should be visible
   - Click on calendar dates
2. **Verify Availability API:**
   - Open DevTools → Network
   - Select a date range
   - Check `GET /api/v1/homestays/{id}/availability?start_date=...&end_date=...`
   - Response should include: `available_dates`, `unavailable_dates`, `time_slots`
3. **Test Date Selection:**
   - Select check-in date
   - Select check-out date (must be after check-in)
   - Calendar should disable unavailable dates

**Expected Result:** Availability API returns correct data, calendar disables unavailable dates.

---

### Test 4: Submit Booking (Public - No Auth)

1. **Fill Booking Form:**
   - Select homestay (if on booking section) OR use property detail page
   - Select check-in date
   - Select check-out date
   - Enter guest name: "John Doe"
   - Enter email: "john@example.com"
   - Enter phone: "+60123456789"
   - Select number of guests
2. **Verify Price Calculation:**
   - Total price = (nights × price_per_night)
   - Price summary card shows correct calculation
3. **Submit Booking:**
   - Click "Reserve Now" button
   - Check Network tab for `POST /api/v1/bookings`
4. **Verify Response:**
   - Status: 201 Created
   - Response includes booking ID and status: "pending"
5. **Check Success Dialog:**
   - Success animation appears
   - Message: "Booking Confirmed! We'll contact you shortly..."
   - Dialog auto-closes after 3 seconds

**Expected Result:** Booking created successfully with status "pending", success dialog shown.

---

### Test 5: Verify Booking in Database

```bash
cd server
rails console

# Check booking was created
booking = Booking.last
puts "Status: #{booking.status}"           # Should be "pending"
puts "Guest: #{booking.guest_name}"       # Should be "John Doe"
puts "Homestay: #{booking.homestay.name}" # Should match selected property
puts "Total: RM#{booking.total_price}"    # Should match calculated price

# Verify availability slots NOT created yet (pending bookings don't lock)
puts "Availability slots: #{booking.availability_slots.count}" # Should be 0

exit
```

**Expected Result:** Booking exists with status "pending", no availability slots locked yet.

---

## Admin Flow Testing

### Test 6: Admin Login

1. **Navigate to Admin Login:**
   - Go to `http://localhost:3000/admin/sign_in`
   - Or `http://localhost:3000/admin/admin_users/sign_in`
2. **Login Credentials (from seeds):**
   - Email: `admin@homostay.com`
   - Password: `password123`
3. **Verify Login:**
   - Redirected to admin dashboard
   - AdminLayout sidebar visible
   - Dashboard stats displayed

**Expected Result:** Admin successfully logs in and sees dashboard.

---

### Test 7: View Bookings (Admin)

1. **Navigate to Bookings:**
   - Click "Bookings" in sidebar
   - Or go to `http://localhost:3000/admin/bookings`
2. **Verify Booking List:**
   - All bookings displayed (including the one you just created)
   - Booking shows: homestay name, guest name, dates, status badge
   - Status filter dropdown works
3. **Check API:**
   - DevTools → Network: `GET /admin/api/v1/bookings`
   - Response includes all bookings with full details

**Expected Result:** Booking list displays all bookings with correct information.

---

### Test 8: Approve Booking (Admin)

1. **On Booking List:**
   - Find the "pending" booking you created
   - Click "Approve" button
2. **Verify API Call:**
   - Network tab: `PATCH /admin/api/v1/bookings/{id}/approve`
   - Status: 200 OK
3. **Check Database:**
```bash
rails console
booking = Booking.find_by(guest_email: "john@example.com")
puts "Status: #{booking.status}" # Should be "approved"
puts "Availability slots: #{booking.availability_slots.count}" # Should be > 0
exit
```
4. **Verify Availability Locked:**
   - Go back to property detail page
   - Check calendar - approved dates should now be unavailable
   - API: `GET /api/v1/homestays/{id}/availability` should exclude those dates

**Expected Result:** Booking status changes to "approved", availability slots created, dates locked.

---

### Test 9: Reject Booking (Admin)

1. **Create Another Test Booking:**
   - Submit a new booking via frontend
   - Note the booking ID
2. **Reject It:**
   - Admin panel → Bookings
   - Click "Reject" on the new booking
3. **Verify:**
   - Status changes to "rejected"
   - No availability slots created (rejected bookings don't lock dates)

**Expected Result:** Booking rejected, no availability impact.

---

### Test 10: Create/Edit Homestay (Admin)

1. **Navigate to Homestays:**
   - Admin sidebar → "Homestays"
   - Or `http://localhost:3000/admin/homestays`
2. **Create New Homestay:**
   - Click "New Homestay" (or navigate to `/admin/homestays/new`)
   - Fill form:
     - Name: "Test Property"
     - Description: "A test property for testing"
     - Capacity: 4
     - Size: "600 sqft"
     - Price: 180.00
     - Booking Type: "date_based"
     - Select amenities (checkboxes)
   - Click "Save Homestay"
3. **Verify Creation:**
   - Redirected to homestays list
   - New property appears
   - Check API: `GET /admin/api/v1/homestays` includes new property
4. **Edit Homestay:**
   - Click on property to edit
   - Change price to 200.00
   - Save
   - Verify changes reflected

**Expected Result:** Homestay created/edited successfully, appears in public listing.

---

## Edge Cases & Validation Testing

### Test 11: Booking Overlap Prevention

1. **Create Booking 1:**
   - Property: Kontena Deluxe
   - Dates: Jan 1-5, 2024
   - Submit and approve (as admin)
2. **Try Booking 2 (Same Dates):**
   - Same property
   - Dates: Jan 3-7, 2024 (overlaps with Booking 1)
   - Submit booking
3. **Expected Result:**
   - Booking created with status "pending" (validation allows it)
   - When admin tries to approve:
     - Should fail or show warning
     - Availability revalidation should detect overlap
     - Booking should be rejected automatically or admin warned

**Test in Console:**
```bash
rails console
booking1 = Booking.create!(
  homestay: Homestay.first,
  guest_name: "Test 1",
  guest_email: "test1@test.com",
  guest_phone: "123",
  check_in_date: Date.today + 1,
  check_out_date: Date.today + 5,
  number_of_guests: 2,
  total_price: 600
)
booking1.approve! # Should create availability slots

booking2 = Booking.create!(
  homestay: Homestay.first,
  guest_name: "Test 2",
  guest_email: "test2@test.com",
  guest_phone: "456",
  check_in_date: Date.today + 3, # Overlaps
  check_out_date: Date.today + 7,
  number_of_guests: 2,
  total_price: 800
)

booking2.approve! # Should fail or show error
exit
```

---

### Test 12: Hour-Based Booking

1. **Find/Create Hour-Based Property:**
   - Use "Glamping Paradise" (has `both` booking type)
   - Or create new property with `hour_based` or `both`
2. **On Property Detail Page:**
   - Select check-in date
   - Select check-in time (e.g., 10:00)
   - Select check-out date
   - Select check-out time (e.g., 18:00)
3. **Verify:**
   - Time fields appear for hour-based properties
   - Total price calculated based on hours
   - Booking includes time information
4. **Check Availability:**
   - API should return `time_slots` for the selected date
   - Calendar should show available time windows

**Expected Result:** Hour-based booking works correctly with time slots.

---

### Test 13: Same-Day Booking

1. **Create Booking:**
   - Check-in: Today
   - Check-out: Today (same day)
   - For hour-based property, select times
2. **Verify:**
   - Validation allows same-day if times are different
   - Or validation prevents same-day for date-based
   - Total price calculated correctly

---

### Test 14: WhatsApp Job (Background)

1. **Create and Approve Booking:**
   - Submit booking via frontend
   - Approve as admin
2. **Check Sidekiq:**
   - Sidekiq dashboard should show job enqueued
   - Job: `WhatsappBookingJob`
3. **Verify Job Execution:**
   - Check Sidekiq logs
   - Job should attempt to send WhatsApp message
   - (Note: Actual sending requires WhatsApp API credentials)

**Test in Console:**
```bash
rails console
booking = Booking.last
WhatsappBookingJob.perform_now(booking)
# Check logs for WhatsApp API call
exit
```

---

## API Testing (Using curl or Postman)

### Test 15: Public API Endpoints

```bash
# List all homestays
curl http://localhost:3000/api/v1/homestays

# Get specific homestay
curl http://localhost:3000/api/v1/homestays/kontena-deluxe

# Get availability
curl "http://localhost:3000/api/v1/homestays/1/availability?start_date=2024-01-01&end_date=2024-03-31"

# Create booking
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: YOUR_TOKEN" \
  -d '{
    "booking": {
      "homestay_id": 1,
      "guest_name": "Test User",
      "guest_email": "test@example.com",
      "guest_phone": "+60123456789",
      "check_in_date": "2024-02-01",
      "check_out_date": "2024-02-05",
      "number_of_guests": 2,
      "total_price": 600.00
    }
  }'
```

---

### Test 16: Admin API Endpoints (Requires Auth)

```bash
# First, get CSRF token and session cookie by logging in via browser
# Then use those in API calls:

# Get dashboard stats
curl http://localhost:3000/admin/api/v1/dashboard/stats \
  -H "Cookie: _homostay_app_session=YOUR_SESSION"

# List all bookings
curl http://localhost:3000/admin/api/v1/bookings \
  -H "Cookie: _homostay_app_session=YOUR_SESSION"

# Approve booking
curl -X PATCH http://localhost:3000/admin/api/v1/bookings/1/approve \
  -H "Cookie: _homostay_app_session=YOUR_SESSION" \
  -H "X-CSRF-Token: YOUR_TOKEN"
```

---

## Database Verification Tests

### Test 17: Verify Data Integrity

```bash
rails console

# Check associations
homestay = Homestay.first
puts "Bookings: #{homestay.bookings.count}"
puts "Amenities: #{homestay.amenities.count}"
puts "Availability Slots: #{homestay.availability_slots.count}"

# Check booking lifecycle
booking = Booking.pending.first
puts "Before approve - slots: #{booking.availability_slots.count}"
booking.approve!
puts "After approve - slots: #{booking.availability_slots.count}"
puts "Status: #{booking.status}"

# Check availability calculation
available = homestay.available_dates(Date.today, Date.today + 30)
puts "Available dates: #{available.count}"

exit
```

---

## Frontend Component Testing

### Test 18: React Router Navigation

1. **Test Routes:**
   - `/` → Homepage with all sections
   - `/properties/kontena-deluxe` → Property detail page
   - `/admin` → Admin dashboard (requires login)
   - `/admin/bookings` → Booking list
   - `/admin/homestays/new` → New homestay form

2. **Test Navigation:**
   - Click "Details" on homestay card → navigates to detail page
   - Click "Back to Home" → returns to homepage
   - Browser back/forward buttons work

**Expected Result:** All routes work, navigation is smooth.

---

### Test 19: Form Validation

1. **Booking Form:**
   - Try submitting without required fields → validation errors
   - Try invalid email format → validation error
   - Try checkout before checkin → validation error
   - Try selecting unavailable dates → should be disabled

2. **Admin Form:**
   - Try creating homestay without name → validation error
   - Try negative price → validation error
   - Try capacity 0 → validation error

**Expected Result:** All validations work correctly.

---

## Performance & Load Testing

### Test 20: Multiple Concurrent Bookings

```bash
# Create multiple bookings simultaneously
rails console
5.times do |i|
  Booking.create!(
    homestay: Homestay.first,
    guest_name: "User #{i}",
    guest_email: "user#{i}@test.com",
    guest_phone: "123#{i}",
    check_in_date: Date.today + i,
    check_out_date: Date.today + i + 2,
    number_of_guests: 2,
    total_price: 300
  )
end
exit
```

**Verify:** All bookings created, no conflicts, availability calculated correctly.

---

## Troubleshooting Common Issues

### Issue: API returns 404
**Solution:** Check routes.rb, verify API namespace is correct

### Issue: CORS errors
**Solution:** Ensure `withCredentials: true` in axios config, check Rails CORS settings

### Issue: Images not loading
**Solution:** Check ActiveStorage configuration, verify `rails_blob_url` helper works

### Issue: Booking approval fails
**Solution:** Check availability revalidation logic, verify no overlapping slots exist

### Issue: React Router not working
**Solution:** Ensure catch-all route in Rails is last, verify BrowserRouter is set up

### Issue: Admin login redirects to wrong page
**Solution:** Check Devise configuration, verify `authenticated` block in routes

---

## Quick Test Checklist

- [ ] Homepage loads with all sections
- [ ] Homestays fetch from API and display
- [ ] Property detail page loads with correct data
- [ ] Availability API returns correct dates
- [ ] Calendar disables unavailable dates
- [ ] Booking submission works
- [ ] Booking appears in database with "pending" status
- [ ] Admin can login
- [ ] Admin sees dashboard stats
- [ ] Admin can view bookings list
- [ ] Admin can approve booking
- [ ] Approved booking locks availability
- [ ] Admin can reject booking
- [ ] Admin can create/edit homestays
- [ ] WhatsApp job enqueues on approval
- [ ] All validations work
- [ ] React Router navigation works
- [ ] No console errors

---

## Next Steps After Testing

1. **Fix any bugs found during testing**
2. **Add error handling for edge cases**
3. **Set up production environment**
4. **Configure WhatsApp API credentials**
5. **Deploy to VPS following deployment guide**
