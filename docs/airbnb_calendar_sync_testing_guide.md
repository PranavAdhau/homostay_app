---

## Airbnb Calendar Sync Testing Guide

Two-Way Sync: Platform ↔ Airbnb

The system supports **two-way calendar synchronization** using iCal (`.ics`) feeds:

- **Platform → Airbnb (export)**: The platform exposes an ICS calendar for each homestay, which Airbnb can import to block dates.
- **Airbnb → Platform (import)**: Airbnb exposes an ICS calendar that the platform imports via background jobs to create/update bookings.

All synchronization happens through **ICS files only**. There are **no live API calls during web requests**; all sync work is done by background workers.

---

## 1. Pre-Setup Requirements

Before testing Airbnb calendar sync, ensure the following:

- **Homestay in the platform**: A property/homestay record already exists in the platform.
- **Admin access**: You can access the **Admin → Homestays** section and edit that homestay.
- **Airbnb listing**: A corresponding Airbnb listing exists for the same physical property.
- **Airbnb calendar access**: You can open the Airbnb listing’s **Availability → Sync calendars** settings.

The system uses these two key configuration fields on `Homestay`:

- **`airbnb_ical_url`**: The Airbnb **export** calendar URL (points to a `.ics` file).
- **`calendar_sync_enabled`**: Boolean flag that turns Airbnb ←→ platform sync **on or off**.

Both fields are managed in the **Admin homestay edit** screen under **Airbnb Calendar Sync**.

---

## 2. Platform → Airbnb Sync (Export Test)

The platform exposes an ICS calendar feed per homestay:

```text
GET /calendars/:homestay_id.ics
```

This feed is read-only and is intended for Airbnb and other calendar consumers.

### Step 1 — Open the ICS link in a browser

1. Determine the homestay’s numeric ID (e.g. `12`).
2. Construct the ICS URL:

   ```text
   https://your-real-domain.com/calendars/12.ics
   ```

3. Open this URL in a browser.

**Expected result:**

- Browser downloads or displays a valid ICS file.
- The content should look similar to:

```text
BEGIN:VCALENDAR
BEGIN:VEVENT
UID:booking-145-homestay-12@your-real-domain.com
DTSTART;VALUE=DATE:20260401
DTEND;VALUE=DATE:20260405
END:VEVENT
END:VCALENDAR
```

Notes:

- `UID` is a unique identifier for the event.
- `DTSTART` / `DTEND` use the **exclusive end date** convention (Airbnb style).

### Step 2 — Add the platform calendar to Airbnb (Import into Airbnb)

In Airbnb:

1. Go to **Hosting → Listings → [Your Listing]**.
2. Open **Availability**.
3. Scroll to **Sync calendars**.
4. Choose **Import calendar**.
5. In **Calendar address (URL)**, paste the platform ICS URL (for example):

   ```text
   https://your-real-domain.com/calendars/12.ics
   ```

6. Give it a name (e.g. “Platform Calendar”) and save.

**Expected behavior:**

- Airbnb periodically fetches this ICS.
- Dates with bookings on the platform should appear as **blocked** in Airbnb’s calendar view.

### Step 3 — Create a booking in the platform

1. In the platform admin or public booking flow, create a **new booking** for that homestay:
   - Ensure the dates are in the future.
2. Confirm the booking is **approved** so it appears in the export feed.

**Expected result:**

- The new booking appears as a `VEVENT` in the homestay’s ICS.
- After Airbnb’s next refresh (typically **30–60 minutes**):
  - The same dates should become **blocked** in Airbnb’s calendar UI.

If the dates do not appear after ~1 hour, refer to **Section 9: Troubleshooting**.

---

## 3. Airbnb → Platform Sync (Import Test)

Airbnb can export its calendar as an ICS feed that the platform imports via `CalendarSyncJob`.

### Step 1 — Copy the Airbnb ICS link

In Airbnb:

1. Go to **Hosting → Listings → [Your Listing]**.
2. Open **Availability**.
3. Scroll to **Sync calendars**.
4. Choose **Export calendar**.
5. Copy the `.ics` link that Airbnb provides, for example:

   ```text
   https://www.airbnb.com/calendar/ical/123456789.ics
   ```

Keep this URL safe; it is the **`airbnb_ical_url`** used by the platform.

### Step 2 — Configure this URL in the platform

In the platform admin:

1. Go to **Admin → Homestays → Edit** for the corresponding property.
2. Scroll to **Airbnb Calendar Sync**.
3. In **Airbnb Calendar URL**, paste the Airbnb ICS link you copied:

   ```text
   https://www.airbnb.com/calendar/ical/123456789.ics
   ```

4. Turn **Enable Calendar Sync** **ON**.
5. Save the homestay.

Under the hood:

- `airbnb_ical_url` is stored with the URL.
- `calendar_sync_enabled` is set to `true`.

### Step 3 — Wait for the background worker to run

- `CalendarSyncJob` executes on a schedule (typically **every 15 minutes**).
- The job:
  - Downloads the Airbnb ICS.
  - Parses `VEVENT` entries.
  - Upserts `Booking` records with:
    - `source = airbnb`
    - `status = confirmed`
  - Calls `SlotReconciler` to reconcile `AvailabilitySlot` records for each booking.

**Expected result after the next few runs (15–45 minutes):**

- Airbnb reservations appear as bookings in the platform:
  - They have `source = airbnb`.
  - They are in `confirmed` status.
- Matching `AvailabilitySlot` records exist for those dates and are **blocked**.

Use Rails console or your DB client to verify:

- `Booking.where(source: :airbnb)` shows imported bookings.
- `AvailabilitySlot` entries exist for each night of the imported stays.

---

## 4. Deletion Test

This test verifies that cancelling an Airbnb reservation is correctly reflected in the platform.

1. In Airbnb, **cancel** or **remove** a reservation for the test listing.
2. Wait for `CalendarSyncJob` to run again (15–45 minutes).

**Expected result:**

- The corresponding platform `Booking`:
  - Has `source = airbnb`.
  - Changes `status` from `confirmed` to `rejected`.
- `AvailabilitySlot` records associated with that booking are **released**:
  - The nights of that stay become available again in the platform.

Confirm via:

- Rails console:

  ```ruby
  b = Booking.find_by(external_event_id: "…", source: :airbnb)
  b.status          # => "rejected"
  b.availability_slots.exists? # => false (or only non-booked slots remain)
  ```

- Platform availability UI:
  - The dates previously blocked by that Airbnb booking are now open.

---

## 5. Slot Safety Verification

This section ensures that the **Slot Reconciliation** logic is safe and idempotent.

Key guarantees (from the architecture plan):

- Slots are **never mass-deleted**.
- Only **missing** slots are inserted.
- Only **stale/extra** slots are removed.
- Re-running sync with the same ICS is **idempotent**.

### How to verify

1. Pick a homestay with Airbnb sync enabled and at least one imported booking.
2. In Rails console:

   ```ruby
   h = Homestay.find(<id>)
   before_slots = h.availability_slots.where(booking_id: <airbnb_booking_id>).pluck(:id, :start_datetime, :end_datetime)
   ```

3. Manually trigger (if you have such a task) or wait for another `CalendarSyncJob` run against the **same ICS content**.
4. After sync:

   ```ruby
   after_slots = h.availability_slots.where(booking_id: <airbnb_booking_id>).pluck(:id, :start_datetime, :end_datetime)
   ```

**Expected checks:**

- **No mass deletion**:
  - `AvailabilitySlot.count` for that homestay should not suddenly drop to zero.
- **Idempotence**:
  - If the ICS didn’t change, `before_slots` and `after_slots` should be identical.
- **Minimal changes on ICS update**:
  - When a booking date range changes in Airbnb, only the **necessary** slots are added/removed (no full rebuild of all slots).

---

## 6. No Same-Day Booking Verification

The architecture enforces **no same-day bookings** to avoid last-minute conflicts.

### Backend rules

The booking validations enforce:

```text
check_in_date >= tomorrow
check_out_date > check_in_date
```

### How to test backend behavior

1. In Rails console, attempt to create a booking that starts **today**:

   ```ruby
   b = Booking.new(
     homestay: Homestay.first,
     guest_name: "Test Guest",
     guest_email: "test@example.com",
     guest_phone: "123456789",
     check_in_date: Date.today,
     check_out_date: Date.today + 2,
     number_of_guests: 2,
     total_price: 100,
     status: :pending
   )
   b.valid?                # => false
   b.errors.full_messages  # should mention same-day / must be future dated
   ```

2. Then create a booking starting **tomorrow**:

   ```ruby
   b.check_in_date = Date.tomorrow
   b.check_out_date = Date.tomorrow + 2
   b.valid?  # => true
   ```

### Frontend date picker

In the web UI booking flow:

- **Minimum check-in date** should be **tomorrow**, not today.
- **Minimum checkout date** should be at least **one day after** the selected check-in.

**Expected behavior:**

- You cannot pick **today** as check-in.
- If you bypass the UI (e.g., by API call), the backend validation still rejects same-day bookings.

---

## 7. Sync Health Monitoring

Each homestay tracks sync health via these fields:

- `last_calendar_sync_at` — Last time a sync attempt (success or failure) ran.
- `last_calendar_sync_success_at` — Last **successful** sync time.
- `sync_error_count` — Number of consecutive sync failures.
- `last_calendar_sync_error` — Last error message for debugging.

### How to monitor

1. Enable sync for a homestay with a valid `airbnb_ical_url`.
2. After a few `CalendarSyncJob` runs, inspect the homestay in Rails console:

   ```ruby
   h = Homestay.find(<id>)
   h.last_calendar_sync_at
   h.last_calendar_sync_success_at
   h.sync_error_count
   h.last_calendar_sync_error
   ```

3. Observe how these fields change with:
   - Successful runs (`sync_error_count` resets to 0, error becomes `nil`).
   - Failed runs (error count increments, error message stored).

### Auto-disabling on repeated failures

If:

```text
sync_error_count >= 5
```

then the system will **automatically disable** calendar sync:

- `calendar_sync_enabled` is set to `false`.
- Future jobs will stop processing that homestay until an admin fixes the issue and re-enables sync.

---

## 8. Client Setup Guide (For Property Owners)

### How to Connect Your Airbnb Calendar

This guide is for **non-technical property owners**.

You only need to do this **once per property**.

#### Step 1 — Copy your Airbnb calendar export link

1. Log in to Airbnb.
2. Go to **Hosting → Listings → [Your Listing]**.
3. Open **Availability**.
4. Find **Sync calendars** and choose **Export calendar**.
5. Copy the link that Airbnb shows.  
   It will look like:

   ```text
   https://www.airbnb.com/calendar/ical/123456789.ics
   ```

#### Step 2 — Paste the link into our platform

1. Log in to the platform’s **Admin Dashboard**.
2. Go to **Homestays / Properties** and click **Edit** on your property.
3. Scroll to **Airbnb Calendar Sync**.
4. In **Airbnb Calendar URL**, paste the link you copied from Airbnb.
5. Turn **Enable Calendar Sync** **ON**.
6. Click **Save**.

Now our system will regularly read your Airbnb calendar and block those dates.

#### Step 3 — Copy the platform calendar link

1. Ask your admin contact (or check the documentation) for your property’s platform calendar link.  
   It will look like:

   ```text
   https://your-real-domain.com/calendars/12.ics
   ```

2. Copy this link.

#### Step 4 — Paste the platform link into Airbnb

1. Go back to Airbnb **Availability → Sync calendars**.
2. Choose **Import calendar**.
3. Paste the platform link into **Calendar address (URL)**.
4. Give it a name like “Website Calendar”.
5. Save.

From now on:

- Bookings made on your website will block dates in Airbnb.
- Bookings made on Airbnb will block dates in your website calendar (after a short delay).

You **do not** need to repeat these steps unless you change your listing or domain.

---

## 9. Troubleshooting

### Problem: Airbnb calendar is not updating

**Possible causes:**

- Airbnb has not refreshed its calendars yet.
- The platform ICS URL was entered incorrectly.
- Airbnb import/export was configured on the **wrong listing**.

**How to resolve:**

1. Wait at least **60 minutes** and refresh Airbnb’s calendar.
2. Double-check the imported URL in Airbnb:
   - Confirm it matches `https://your-real-domain.com/calendars/:homestay_id.ics`.
3. Confirm the platform ICS is valid:
   - Open the URL in a browser and ensure you see `BEGIN:VCALENDAR` and `VEVENT` entries.
4. Verify that bookings exist on those dates in the platform and are **approved**.

---

### Problem: Platform is not importing Airbnb bookings

**Possible causes:**

- `airbnb_ical_url` is missing or invalid.
- `calendar_sync_enabled` is `false`.
- `CalendarSyncJob` is not running.

**How to resolve:**

1. In the platform admin:
   - Edit the homestay and ensure:
     - **Airbnb Calendar URL** is a valid `.ics` link from Airbnb.
     - **Enable Calendar Sync** is switched **ON**.
2. In Rails console:

   ```ruby
   h = Homestay.find(<id>)
   h.airbnb_ical_url
   h.calendar_sync_enabled
   h.last_calendar_sync_at
   h.last_calendar_sync_error
   ```

3. Check logs or job dashboard to confirm `CalendarSyncJob` is running and not failing globally.

---

### Problem: Sync was disabled after errors

**Symptom:**

- `calendar_sync_enabled` has become `false` unexpectedly.

**Cause:**

- `sync_error_count` reached **5** consecutive failures.

**How to resolve:**

1. Inspect `last_calendar_sync_error` to see the root cause (e.g. 404 from Airbnb, timeout, invalid ICS).
2. Fix the underlying issue:
   - Correct `airbnb_ical_url`.
   - Ensure Airbnb listing and calendar are active.
3. Reset state:

   ```ruby
   h = Homestay.find(<id>)
   h.update!(
     calendar_sync_enabled: true,
     sync_error_count: 0,
     last_calendar_sync_error: nil
   )
   ```

4. Wait for the next scheduled sync.

---

### Problem: Timezone mismatch / shifted dates

**Symptoms:**

- Bookings appear one day early/late.
- Check-in/check-out times look offset.

**How to resolve:**

1. Confirm the platform’s `Time.zone` matches the property’s real timezone.
2. Inspect sample events in the Airbnb ICS:
   - Look for `TZID=` or `Z` suffix on `DTSTART` / `DTEND`.
3. Ensure the parser converts event times into Rails’ `Time.zone` as per the architecture:
   - If `TZID` is present, it should convert from that zone.
   - If missing, it assumes UTC.
4. Re-run sync and verify that the dates now line up between Airbnb and the platform.

---

## 10. Final Expected Behaviour

After correct setup and successful testing:

- **Airbnb bookings → Platform**
  - Airbnb reservations are automatically imported as `Booking` records with `source = airbnb`.
  - Availability is updated via `AvailabilitySlot`, preventing overlapping bookings.

- **Platform bookings → Airbnb**
  - Bookings made on the platform appear in the exported ICS.
  - Airbnb imports that ICS and blocks those dates on the listing.

- **No double bookings**
  - The reconciliation logic and two-way sync work together so that:
    - The same night is never simultaneously available on both systems.
    - Changes or cancellations propagate safely in both directions (with a short delay).

Once this behavior is confirmed in testing, the Airbnb calendar sync can be considered **production ready** for that homestay.

