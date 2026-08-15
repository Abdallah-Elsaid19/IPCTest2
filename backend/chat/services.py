import hashlib
import hmac
import html
import json
import logging
import re
from email.utils import parseaddr

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.utils import timezone

from accounts.graph_mail import _send_mime_message


logger = logging.getLogger(__name__)
CONVERSATION_PATTERN = re.compile(
    r"(?:IPC-CHAT:|chat\+)([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})",
    re.IGNORECASE,
)


class ChatEmailError(Exception):
    pass


def _graph_is_configured():
    values = [
        getattr(settings, "GRAPH_TENANT_ID", ""),
        getattr(settings, "GRAPH_CLIENT_ID", ""),
        getattr(settings, "GRAPH_CLIENT_SECRET", ""),
        getattr(settings, "GRAPH_SENDER", ""),
    ]
    placeholders = ("PUT_", "your-", "replace-")
    return all(values) and not any(str(value).startswith(placeholders) for value in values)


def send_email(*, recipient, subject, text_body, html_body, reply_to=None):
    try:
        if _graph_is_configured():
            return _send_mime_message(
                recipient=recipient,
                subject=subject,
                text_body=text_body,
                html_body=html_body,
                reply_to=reply_to,
            )
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient],
            reply_to=[reply_to] if reply_to else None,
        )
        message.attach_alternative(html_body, "text/html")
        message.send(fail_silently=False)
        return message.extra_headers.get("Message-ID", "")
    except Exception as exc:
        logger.exception("Website chat email delivery failed.")
        raise ChatEmailError("Email delivery failed.") from exc


def conversation_reply_address(conversation):
    domain = getattr(settings, "CHAT_INBOUND_DOMAIN", "").strip().lower()
    if domain:
        return f"chat+{conversation.public_id}@{domain}"
    return getattr(settings, "CHAT_INBOUND_ADDRESS", "").strip() or settings.SUPPORT_EMAIL


def email_customer_message_to_support(message):
    conversation = message.conversation
    reply_to = conversation_reply_address(conversation)
    sent_at = timezone.localtime(message.created_at).isoformat(timespec="seconds")
    safe_name = html.escape(conversation.customer_name)
    safe_email = html.escape(conversation.customer_email)
    safe_message = html.escape(message.message).replace("\n", "<br>")
    subject = f"[IPC-CHAT:{conversation.public_id}] Website message from {conversation.customer_name}"[:200]
    text_body = f"""New website chat message

Name: {conversation.customer_name}
Email: {conversation.customer_email}
Source: {conversation.source}
Conversation: {conversation.public_id}
Date/time: {sent_at}

{message.message}

Reply directly to this email to answer the visitor.
"""
    html_body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.6;max-width:620px;margin:auto;border:1px solid #eadfce">
        <div style="background:#0b0b0b;color:#f4ece1;padding:22px 28px"><strong style="color:#d79525;letter-spacing:.08em">IPC WEBSITE CHAT</strong></div>
        <div style="padding:28px">
          <p><strong>{safe_name}</strong> &lt;{safe_email}&gt;</p>
          <p style="color:#655d55;font-size:13px">Source: {html.escape(conversation.source)} · Conversation: {conversation.public_id}<br>Date/time: {sent_at}</p>
          <div style="background:#f4ece1;border-left:4px solid #d79525;padding:16px 18px;margin:20px 0">{safe_message}</div>
          <p style="font-size:13px;color:#655d55">Reply directly to this email to answer the visitor.</p>
        </div>
      </div>
    """
    return send_email(
        recipient=settings.SUPPORT_EMAIL,
        subject=subject,
        text_body=text_body,
        html_body=html_body,
        reply_to=reply_to,
    )


def email_staff_reply_to_customer(message):
    conversation = message.conversation
    reply_to = conversation_reply_address(conversation)
    safe_name = html.escape(conversation.customer_name)
    safe_message = html.escape(message.message).replace("\n", "<br>")
    subject = f"[IPC-CHAT:{conversation.public_id}] Reply from IPC"
    text_body = f"""Hello {conversation.customer_name},

{message.message}

You can reply to this email or continue the conversation in the website chat.

Kind regards,
Institute of Project Controls
"""
    html_body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.65;max-width:620px;margin:auto;border:1px solid #eadfce">
        <div style="background:#0b0b0b;color:#f4ece1;padding:22px 28px"><strong style="color:#d79525;letter-spacing:.08em">IPC</strong><h1 style="margin:8px 0 0;font-size:22px">New chat reply</h1></div>
        <div style="padding:28px"><p>Hello {safe_name},</p><div style="background:#f4ece1;border-left:4px solid #d79525;padding:16px 18px;margin:20px 0">{safe_message}</div><p style="font-size:13px;color:#655d55">Reply to this email or continue in the website chat.</p><p>Kind regards,<br>Institute of Project Controls</p></div>
      </div>
    """
    return send_email(
        recipient=conversation.customer_email,
        subject=subject,
        text_body=text_body,
        html_body=html_body,
        reply_to=reply_to,
    )


def mark_email_result(message, email_id="", error=""):
    message.outbound_email_id = str(email_id or "")[:255]
    message.email_error = str(error or "")[:2000]
    if not error:
        message.email_sent_at = timezone.now()
    message.save(update_fields=("outbound_email_id", "email_error", "email_sent_at"))


def _first(payload, *keys):
    for key in keys:
        value = payload.get(key)
        if isinstance(value, list):
            value = value[0] if value else ""
        if isinstance(value, dict):
            value = value.get("email") or value.get("address") or value.get("value")
        if value not in (None, ""):
            return str(value)
    return ""


def _html_email_to_text(value):
    value = str(value or "")
    value = re.sub(r"(?is)<(style|script)\b[^>]*>.*?</\1>", "", value)
    value = re.sub(r"(?i)<br\s*/?>", "\n", value)
    value = re.sub(
        r"(?i)</(?:p|div|li|tr|h[1-6])\s*>",
        "\n",
        value,
    )
    value = re.sub(r"<[^>]+>", "", value)
    return html.unescape(value).replace("\xa0", " ").strip()


def normalise_inbound_payload(provider, payload):
    provider = (provider or "generic").lower()
    if provider == "postmark":
        sender = _first(payload, "FromFull", "From")
        if isinstance(payload.get("FromFull"), dict):
            sender = payload["FromFull"].get("Email", sender)
        recipients = _first(payload, "OriginalRecipient", "To")
        subject = _first(payload, "Subject")
        body = strip_quoted_reply(
            _first(payload, "StrippedTextReply", "TextBody")
        )
        if not body:
            body = strip_quoted_reply(
                _html_email_to_text(_first(payload, "HtmlBody"))
            )
        message_id = _first(payload, "MessageID", "MessageId")
    elif provider == "mailgun":
        sender = _first(payload, "sender", "from")
        recipients = _first(payload, "recipient", "To")
        subject = _first(payload, "subject", "Subject")
        body = _first(payload, "stripped-text", "body-plain", "text")
        message_id = _first(payload, "Message-Id", "message-id", "X-Mailgun-Sid")
    elif provider == "sendgrid":
        sender = _first(payload, "from", "sender")
        recipients = _first(payload, "to", "recipient")
        subject = _first(payload, "subject")
        body = _first(payload, "text", "body")
        message_id = _first(payload, "Message-Id", "message_id", "headers")
    else:
        sender = _first(payload, "from", "sender", "From")
        recipients = _first(payload, "to", "recipient", "To")
        subject = _first(payload, "subject", "Subject")
        body = _first(payload, "text", "body", "plain", "TextBody")
        message_id = _first(payload, "message_id", "message-id", "Message-Id", "MessageID")
    return {
        "sender": parseaddr(sender)[1].lower(),
        "recipients": recipients,
        "subject": subject,
        "body": body if provider == "postmark" else strip_quoted_reply(body),
        "message_id": message_id.strip("<> "),
        "conversation_id": _first(payload, "conversation_id", "conversationId"),
    }


def strip_quoted_reply(body):
    kept = []
    for line in str(body or "").replace("\r\n", "\n").split("\n"):
        stripped = line.strip()
        if re.match(r"^On .+wrote:$", stripped, re.IGNORECASE):
            break
        if stripped.lower() in {"-----original message-----", "________________________________"}:
            break
        if re.match(r"^(from|sent|to|subject):\s", stripped, re.IGNORECASE) and kept:
            break
        if stripped.startswith(">"):
            continue
        if stripped == "--":
            break
        kept.append(line.rstrip())
    return "\n".join(kept).strip()[:4000]


def extract_conversation_id(normalised):
    direct = normalised.get("conversation_id", "")
    if direct:
        return direct.strip()
    haystack = f"{normalised.get('recipients', '')} {normalised.get('subject', '')}"
    match = CONVERSATION_PATTERN.search(haystack)
    return match.group(1) if match else ""


def staff_sender_is_allowed(sender):
    sender = (sender or "").strip().lower()
    exact = {item.lower() for item in settings.CHAT_STAFF_EMAILS}
    domains = {item.lower().lstrip("@") for item in settings.CHAT_STAFF_EMAIL_DOMAINS}
    if not exact and not domains:
        exact.add(settings.SUPPORT_EMAIL.lower())
    sender_domain = sender.rsplit("@", 1)[-1] if "@" in sender else ""
    return sender in exact or sender_domain in domains


def fallback_provider_message_id(raw_body, normalised):
    if normalised.get("message_id"):
        return normalised["message_id"][:255]
    digest_input = raw_body or json.dumps(normalised, sort_keys=True).encode("utf-8")
    return f"sha256:{hashlib.sha256(digest_input).hexdigest()}"


def valid_webhook_signature(raw_body, signature):
    secret = settings.CHAT_INBOUND_WEBHOOK_SECRET
    if not secret:
        return True
    supplied = (signature or "").removeprefix("sha256=")
    expected = hmac.new(secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(supplied, expected)
