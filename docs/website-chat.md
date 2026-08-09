# IPC public website chat

The public chat is a single React widget backed by Django. A visitor supplies a name and email before the first message. The browser stores only the public conversation UUID, the one-time-issued conversation token and the visitor details. Django stores only a SHA-256 hash of that token.

## Request flow

1. React creates a conversation with `POST /api/chat/conversations`.
2. React sends messages with `POST /api/chat/conversations/<uuid>/messages` and `X-Chat-Token`.
3. Django saves each message before sending an email to `SUPPORT_EMAIL`. The email `Reply-To` contains the conversation UUID.
4. A configured inbound email provider posts a staff reply to `POST /api/chat/inbound/<provider>`.
5. Django verifies the webhook token, optional HMAC signature and staff sender allowlist, removes quoted email text, saves the reply and emails it to the visitor.
6. The browser polls the message endpoint every five seconds while the widget is open.

Customer retries are safe because each browser message has a UUID and the database enforces one message per conversation/client UUID. Provider retries are deduplicated by provider message ID, or by a SHA-256 fallback.

## Environment variables

Required in production:

```env
SUPPORT_EMAIL=support@instituteofprojectcontrols.org
CHAT_INBOUND_DOMAIN=replies.instituteofprojectcontrols.org
CHAT_INBOUND_WEBHOOK_TOKEN=<long-random-secret>
CHAT_STAFF_EMAILS=support@instituteofprojectcontrols.org
CHAT_STAFF_EMAIL_DOMAINS=instituteofprojectcontrols.org
```

`CHAT_INBOUND_ADDRESS` may be used instead of `CHAT_INBOUND_DOMAIN` when the provider gives IPC one fixed inbound address. `CHAT_INBOUND_WEBHOOK_SECRET` optionally requires an `X-IPC-Webhook-Signature: sha256=<hex>` HMAC of the raw request body.

Outbound delivery prefers Microsoft Graph when all four `GRAPH_TENANT_ID`, `GRAPH_CLIENT_ID`, `GRAPH_CLIENT_SECRET` and `GRAPH_SENDER` values are configured. Otherwise it uses Django's `EMAIL_BACKEND` and standard `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` and `EMAIL_USE_TLS` settings.

## Inbound provider setup

Use an inbound-capable provider such as Postmark, Mailgun or SendGrid:

1. Create and verify the inbound subdomain from `CHAT_INBOUND_DOMAIN` and add the provider's required MX records.
2. Route mail for `chat+*@<CHAT_INBOUND_DOMAIN>` to `https://<site-domain>/api/chat/inbound/postmark`, `/mailgun`, `/sendgrid`, or `/generic`.
3. Make the provider or a small relay send `X-IPC-Webhook-Token` with the exact value of `CHAT_INBOUND_WEBHOOK_TOKEN`. A Bearer token or Basic-auth password is also accepted.
4. If the provider cannot set a fixed authentication header, put a trusted relay in front of the endpoint. The relay must add the token; do not put the token in a public URL.
5. Add every authorised reply mailbox or domain to the staff allowlist. Replies from all other senders are rejected.
6. Send a website chat message, reply to the notification email, and verify that the reply appears in Django admin, reaches the visitor's email and appears in the open widget.

Provider payload adapters accept the common Postmark, Mailgun and SendGrid field names. A generic JSON payload can use `from`, `to`, `subject`, `text`, and `message_id`.

## Deployment

```bash
cd /var/www/IPCTest2/backend
source .venv/bin/activate
python manage.py migrate
python manage.py check
sudo systemctl restart ipc-gunicorn.service
```

Build and deploy the frontend after setting the API reverse proxy for `/api/`. No mail or webhook secrets belong in React or in the built frontend.

The conversations and messages are visible under **Website chat** in Django admin. Administrators can mark conversations open, closed or spam; token hashes and delivery diagnostics are read-only.
