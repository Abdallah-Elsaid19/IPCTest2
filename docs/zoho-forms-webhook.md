# Zoho Forms event webhook

Zoho Forms sends new event submissions to:

`https://instituteofprojectcontrols.com/api/events/zoho/webhook`

Configure the webhook with `application/json` and map these payload keys:

| Payload key | Zoho field |
| --- | --- |
| `first_name` | Name - First Name |
| `last_name` | Name - Last Name |
| `phone` | Phone |
| `email` | Email |
| `programme` | Programme |
| `comments` | Comments |

Add the custom header `X-Zoho-Webhook-Token`. Its value must match the long,
random `ZOHO_FORMS_WEBHOOK_TOKEN` value stored in `backend/.env` on the server.
Do not commit or share that value.

Set `ZOHO_FORMS_EVENT_NAME` in `backend/.env` to the exact event name. For the
current form:

`ZOHO_FORMS_EVENT_NAME=London Masterclass Event 2 October 2026`

Alternatively, add an `event_name` URL parameter in Zoho for a form-specific
event name. If an IPC event with that exact title exists, the registration is
linked to it. Otherwise the form submission is still stored as an unlinked
event registration.

Zoho submissions are marked internally with `payment_provider=zoho_forms` and
can be fetched by an authenticated admin from:

`/api/admin/event-registrations?source=zoho`

Repeated delivery of the same email, phone, event and programme is treated as
the same registration and returns the existing reference instead of creating a
duplicate.
