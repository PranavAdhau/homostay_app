# WhatsApp Testing Guide

## 1. Overview

This project uses the Meta WhatsApp Business Cloud API for two responsibilities:

- Outbound booking notifications sent asynchronously through `WhatsappService`
- Signed inbound webhook handling through `/webhooks/whatsapp`

Current outbound flows:

- `WhatsappBookingJob` notifies the host when a pending booking is created
- `WhatsappGuestAcknowledgementJob` acknowledges the guest when a pending booking is created
- `WhatsappUserConfirmationJob` notifies the guest after approval
- `WhatsappUserRejectionJob` notifies the guest after rejection

Current inbound flow:

- Meta calls `POST /webhooks/whatsapp`
- Rails validates signature and payload
- Rails enqueues `WhatsappWebhookEventJob`
- Rails returns `200 OK` immediately
- Background processing parses `messages` and `statuses` events, suppresses duplicates, and writes structured logs

## 2. Required Environment Variables

Set these in the real backend environment:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_BUSINESS_ACCOUNT_ID`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `WHATSAPP_APP_SECRET`
- `ADMIN_WHATSAPP_NUMBER`

Notes:

- `WHATSAPP_WEBHOOK_VERIFY_TOKEN` is used only for Meta webhook verification.
- `WHATSAPP_APP_SECRET` is required for `X-Hub-Signature-256` verification.
- The backend normalizes phone numbers to digits before matching/sending.

## 3. Outbound Service Test

Start the Rails console:

```bash
cd server
bundle exec rails console
```

Example host notification send:

```ruby
WhatsappService.new(
  phone_number: ENV.fetch("ADMIN_WHATSAPP_NUMBER"),
  template_name: "booking_request_host",
  template_parameters: [
    "Sacred Stay",
    "Jane Guest",
    "919309800427",
    "10 Jul 2026",
    "12 Jul 2026",
    "2",
    "123"
  ],
  booking_id: 123
).call
```

Expected result:

- The request is posted to `https://graph.facebook.com/v22.0/{PHONE_NUMBER_ID}/messages`
- Structured logs include template name, booking id, HTTP status, and Meta message id when present

## 4. Booking Flow Verification

To verify the normal booking-triggered notifications:

1. Start Rails and the job worker
2. Create a pending booking through the site or API
3. Confirm that:
   - `WhatsappBookingJob` is enqueued
   - `WhatsappGuestAcknowledgementJob` is enqueued
4. Approve and reject test bookings through the admin API and confirm:
   - `WhatsappUserConfirmationJob` is enqueued on approval
   - `WhatsappUserRejectionJob` is enqueued on rejection

WhatsApp delivery failures must not prevent the booking from being stored.

## 5. Webhook Verification Test

Meta webhook setup should call:

```text
GET /webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
```

Expected result:

- Correct token -> HTTP `200` with the challenge in the response body
- Wrong token -> HTTP `403`

## 6. Signed Webhook Replay Test

The webhook processing pattern is:

1. Validate signature and payload
2. Enqueue `WhatsappWebhookEventJob`
3. Return `200 OK` immediately

To test this manually, replay a signed request against the server:

```bash
BODY='{"object":"whatsapp_business_account","entry":[{"id":"waba-123","changes":[{"field":"messages","value":{"metadata":{"phone_number_id":"123"},"messages":[{"id":"wamid.message.1","from":"919309800427","timestamp":"1710000000","type":"text","text":{"body":"Hello"}}]}}]}]}'
SIG=$(ruby -ropenssl -e 'body = ENV.fetch("BODY"); secret = ENV.fetch("WHATSAPP_APP_SECRET"); puts "sha256=#{OpenSSL::HMAC.hexdigest("SHA256", secret, body)}"')

curl -i -X POST "https://your-domain.com/webhooks/whatsapp" \
  -H "Content-Type: application/json" \
  -H "X-Hub-Signature-256: ${SIG}" \
  --data "${BODY}"
```

Expected result:

- HTTP `200`
- `WhatsappWebhookEventJob` is enqueued
- Structured logs later show `whatsapp.webhook.message_received`

## 7. Status Events and Duplicate Deliveries

The webhook processor supports both:

- inbound `messages`
- outbound delivery/read/failure `statuses`

Duplicate deliveries are suppressed using a short-lived Redis idempotency key.

Expected result:

- the first delivery is processed normally
- a replay of the same event is logged as duplicate and ignored

## 8. Common Issues

- Invalid signature:
  - confirm `WHATSAPP_APP_SECRET`
- Verification failure:
  - confirm `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- Unexpected business account:
  - confirm `WHATSAPP_BUSINESS_ACCOUNT_ID`
- Sends skipped:
  - confirm `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN`
- Duplicate suppression unavailable:
  - confirm Redis connectivity
