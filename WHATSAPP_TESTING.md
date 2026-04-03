# WhatsApp Testing Guide

## 1. Overview

This project integrates the WhatsApp Business Cloud API to send notifications from the backend and to allow users to open a direct chat with the admin from the frontend.

Implemented WhatsApp features:

- Booking Request Notification
  - When a user submits a booking request the backend enqueues a job which calls the WhatsApp Cloud API and sends a message to the owner/admin (`ADMIN_WHATSAPP_NUMBER`).
- Floating “Chat With Us” Button
  - A floating button in the frontend opens a WhatsApp chat with the admin using a deep link (`https://wa.me/<phone_number>`).

References in code:

- Backend service: server/app/services/whatsapp_service.rb
- Booking job: server/app/jobs/whatsapp_booking_job.rb
- Environment: server/.env
- Frontend float component: client/src/components/WhatsAppFloat.tsx

---

## 2. Required Environment Variables

Set these environment variables in `server/.env` (or your deployment environment):

- `WHATSAPP_ACCESS_TOKEN`
  - The long-lived access token (Bearer) issued for your Meta app / WhatsApp Business account. Used for `Authorization` header.
- `WHATSAPP_PHONE_NUMBER_ID`
  - The numeric Phone Number ID assigned to your WhatsApp Business phone number in Meta Business Manager. Used in the API URL path.
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
  - The Business Account ID (not always needed for sends, but present in repo/env for bookkeeping).
- `ADMIN_WHATSAPP_NUMBER`
  - Destination phone (admin/owner) in international format without the `+` (e.g., `919309800427`). This is the number used by the booking notification and the frontend float.

Notes:

- Ensure env entries use `KEY=value` syntax with no spaces around `=` so the app loads them correctly.
- The backend strips non-digit characters before sending, so provide the admin number as international digits (no `+`, no spaces, no dashes).

---

## 3. WhatsApp Cloud API Endpoint Used

The backend sends messages to the Meta Graph API endpoint:

```
https://graph.facebook.com/v22.0/{PHONE_NUMBER_ID}/messages
```

Required request headers:

- `Authorization: Bearer WHATSAPP_ACCESS_TOKEN`
- `Content-Type: application/json`

The backend implementation is in `server/app/services/whatsapp_service.rb` and posts a JSON payload matching the WhatsApp Cloud `text` message format.

---

## 4. Manual API Test (Direct WhatsApp API Test)

Use `curl` to test the WhatsApp Cloud API directly (replace placeholders):

```bash
curl -s -X POST "https://graph.facebook.com/v22.0/{PHONE_NUMBER_ID}/messages" \
  -H "Authorization: Bearer ${WHATSAPP_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "{ADMIN_WHATSAPP_NUMBER}",
    "type": "text",
    "text": { "body": "Test message from Homestay App" }
  }'
```

Expected response:

- On success: HTTP 200 with JSON containing a `messages` array and `id` fields for created message(s).
- On error: HTTP 4xx/5xx and JSON with an `error` object describing the problem (invalid token, invalid phone number ID, permission issues, etc.).

---

## 5. Backend Test (Rails Console)

Start the Rails console in the `server` directory and invoke the service directly.

From project root:

```bash
cd server
bundle exec rails console
```

Inside the console (use the real admin number or a test recipient):

```ruby
# Correct usage for this codebase:
WhatsappService.new("919309800427", "Test message from Homestay App").call
```

What to expect:

- The Rails logs should contain a line like:
  - Success: `[WhatsAppCloud] ✅ Message sent successfully to 919309800427`
  - Failure: `[WhatsAppCloud] ❌ Failed to send message to 919309800427 - status=<code> body=<response body>`
- The admin/test recipient should receive the text message in WhatsApp if the token and numbers are valid.

---

## 6. Booking Request Notification Test

This tests the end-to-end flow where a booking submission triggers a WhatsApp notification to the admin.

Steps:

1. Ensure environment variables are set in `server/.env` and the server can reach the Graph API.
2. Start the backend (and job processor if you use Sidekiq / ActiveJob adapter):

```bash
# Example (development):
cd server
bundle exec rails server
# If using Sidekiq for background jobs, in another terminal:
bundle exec sidekiq
```

3. Start the frontend (if testing via UI):

```bash
cd client
npm install # if needed
npm run dev
```

4. Submit a booking from the frontend for a property, or create a booking via the Rails console and enqueue the job manually:

```ruby
# Example to create a booking and trigger job immediately:
b = Booking.create!(homestay: Homestay.first, guest_name: 'John Doe', guest_email: 'john@example.com', guest_phone: '919XXXXXXXXX', check_in_date: Date.today + 14, check_out_date: Date.today + 16, number_of_guests: 2)
WhatsappBookingJob.perform_now(b)
```

5. Check server logs for WhatsApp API send attempt and success/failure lines.
6. Verify the admin receives the WhatsApp message.

Example message format (what the admin should see):

```
🏠 New Booking Request

Property: Hill View Homestay
Booking ID: 123
Check-in: 2026-03-20
Check-out: 2026-03-22
Guests: 2

Guest Name: John Doe
Phone: 919XXXXXXXXX
Email: john@example.com

Status: Pending
```

---

## 7. Floating WhatsApp Button Test (Frontend)

This verifies the client-side deep link to WhatsApp.

Steps:

1. Open the frontend application in a browser.
2. Confirm your site settings include the admin WhatsApp number (the frontend reads `settings.whatsapp_number`).
3. Locate the floating **Chat on WhatsApp** button (component: `client/src/components/WhatsAppFloat.tsx`).
4. Click the button.

Expected result:

- A new tab/window opens using a link of the form:

```
https://wa.me/<ADMIN_WHATSAPP_NUMBER>?text=<prefilled-message>
```

- WhatsApp (web or app) should offer to open chat with the admin number and populate the message field with the prefilled text.

---

## 8. Logs to Check

Check the backend logs for WhatsApp-related log lines (the code writes these messages):

- Successful send example:

```
[WhatsAppCloud] ✅ Message sent successfully to 919309800427
```

- Failure example (HTTP error or exception):

```
[WhatsAppCloud] ❌ Failed to send message to 919309800427 - status=401 body={...}
[WhatsAppCloud] ❌ Error sending message to 919309800427 - RuntimeError: <message>
```

Also watch your job processor logs (Sidekiq/ActiveJob) for any job failures or retries.

---

## 9. Common Issues & Fixes

- Access token expired / invalid:
  - Confirm `WHATSAPP_ACCESS_TOKEN` is valid, not expired, and has necessary permissions.
- Incorrect phone number format:
  - Use international digits only (e.g., `919309800427`). The backend strips non-digits.
- Phone number not added as test recipient (for test accounts):
  - In some WhatsApp setups, you must register test recipients or verify phone numbers in Meta Business settings.
- Wrong Phone Number ID:
  - Confirm `WHATSAPP_PHONE_NUMBER_ID` matches the Phone Number ID assigned in Meta Business Manager.
- Network or DNS issues:
  - Ensure the server can reach `graph.facebook.com` (outbound HTTPS allowed).
- Background jobs not running:
  - If the send is enqueued, ensure the job worker (Sidekiq or other) is running to process `WhatsappBookingJob`.

---

## 10. Expected Result

- When a booking is submitted, the admin receives a WhatsApp message containing booking details (property, guest, check-in/out, guests).
- Clicking the frontend floating chat button opens a direct WhatsApp conversation with the admin number.
- Backend logs show send attempts and success/failure messages.

---

If you want, I can add a small `curl` or Rails runner command snippet that runs inside the repo to trigger a test message (safe QA helper).
