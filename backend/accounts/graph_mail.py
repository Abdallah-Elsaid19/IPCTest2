import base64
import html
import logging
from email import policy
from email.message import EmailMessage
from email.utils import formatdate, make_msgid
from urllib.parse import quote

import requests
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from ipc_backend.email_branding import add_ipc_logo


logger = logging.getLogger(__name__)


class GraphMailError(Exception):
    pass


def _required_setting(name):
    value = getattr(settings, name, "")
    if not value:
        raise ImproperlyConfigured(f"{name} is required to send Microsoft Graph email.")
    return value


def _access_token():
    tenant_id = _required_setting("GRAPH_TENANT_ID")
    response = requests.post(
        f"https://login.microsoftonline.com/{quote(tenant_id, safe='')}/oauth2/v2.0/token",
        data={
            "client_id": _required_setting("GRAPH_CLIENT_ID"),
            "client_secret": _required_setting("GRAPH_CLIENT_SECRET"),
            "scope": "https://graph.microsoft.com/.default",
            "grant_type": "client_credentials",
        },
        timeout=15,
    )
    if not response.ok:
        logger.error("Microsoft Graph token request failed with status %s.", response.status_code)
        raise GraphMailError("Microsoft Graph authentication failed.")
    token = response.json().get("access_token")
    if not token:
        raise GraphMailError("Microsoft Graph did not return an access token.")
    return token


def _send_mime_message(*, recipient, subject, text_body, html_body, reply_to=None):
    sender = _required_setting("GRAPH_SENDER")
    message = EmailMessage()
    message["From"] = sender
    message["To"] = recipient
    message["Subject"] = subject
    if reply_to:
        message["Reply-To"] = reply_to
    message["Date"] = formatdate(localtime=True)
    message_id = make_msgid(domain=sender.rsplit("@", 1)[-1])
    message["Message-ID"] = message_id
    # Base64 transfer encoding prevents Graph/mail clients from treating MIME
    # soft line breaks (`=`) as visible characters or dropping the next byte.
    message.set_content(text_body, cte="base64")
    message.add_alternative(add_ipc_logo(html_body), subtype="html", cte="base64")
    encoded_message = base64.b64encode(
        message.as_bytes(policy=policy.SMTP)
    ).decode("ascii")

    response = requests.post(
        f"https://graph.microsoft.com/v1.0/users/{quote(sender, safe='')}/sendMail",
        headers={
            "Authorization": f"Bearer {_access_token()}",
            "Content-Type": "text/plain",
        },
        data=encoded_message,
        timeout=15,
    )
    if response.status_code != 202:
        logger.error("Microsoft Graph sendMail failed with status %s.", response.status_code)
        raise GraphMailError("Microsoft Graph could not send the email.")
    return message_id.strip("<>")


def send_enquiry_reply_email(
    *,
    recipient,
    recipient_name,
    enquiry_subject,
    message_body,
    administrator_name,
    reply_to=None,
):
    safe_name = html.escape(recipient_name or "there")
    safe_message = html.escape(message_body).replace("\n", "<br>")
    safe_admin_name = html.escape(administrator_name or "IPC Administration")
    subject = f"Re: {enquiry_subject}"[:200]
    text_body = f"""Hello {recipient_name or 'there'},

{message_body}

Kind regards,
{administrator_name or 'IPC Administration'}
Institute of Project Controls
"""
    html_body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.65;max-width:620px;margin:auto;border:1px solid #eadfce">
        <div style="background:#0b0b0b;color:#f4ece1;padding:22px 28px">
          <strong style="color:#d79525;letter-spacing:.08em">IPC</strong>
          <h1 style="margin:8px 0 0;font-size:22px">Response to your enquiry</h1>
        </div>
        <div style="padding:28px">
          <p>Hello {safe_name},</p>
          <p>{safe_message}</p>
          <p style="margin-top:28px">Kind regards,<br><strong>{safe_admin_name}</strong><br>Institute of Project Controls</p>
        </div>
      </div>
    """
    _send_mime_message(
        recipient=recipient,
        subject=subject,
        text_body=text_body,
        html_body=html_body,
        reply_to=reply_to,
    )


def send_scholarship_announcement_reminder_email(*, recipient):
    countdown_url = f"{settings.FRONTEND_URL.rstrip('/')}/scholarships/announcement"
    safe_countdown_url = html.escape(countdown_url, quote=True)
    subject = "IPC scholarship announcement reminder — 12 August 2026"
    text_body = f"""Hello,

This is your requested reminder that successful IPC scholarship and bursary applicants will be announced on 12 August 2026.

View the announcement countdown and scholarship information:
{countdown_url}

Being contacted or receiving this reminder does not confirm selection for the IPC Fund. Selection is official only after IPC issues written confirmation.

Kind regards,
Institute of Project Controls
"""
    html_body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.65;max-width:620px;margin:auto;border:1px solid #eadfce">
        <div style="background:#0b0b0b;color:#f4ece1;padding:24px 28px">
          <strong style="color:#d79525;letter-spacing:.08em">IPC</strong>
          <h1 style="margin:8px 0 0;font-size:25px">Scholarship announcement reminder</h1>
        </div>
        <div style="padding:28px">
          <p>Hello,</p>
          <p>This is your requested reminder that successful IPC scholarship and bursary applicants will be announced on <strong>12 August 2026</strong>.</p>
          <p style="margin:24px 0"><a href="{safe_countdown_url}" style="display:inline-block;background:#d79525;color:#171411;text-decoration:none;font-weight:bold;padding:12px 18px">View announcement countdown</a></p>
          <p style="font-size:13px;color:#655d55">Being contacted or receiving this reminder does not confirm selection for the <strong>IPC Fund</strong>. Selection is official only after IPC issues written confirmation.</p>
          <p style="margin-top:28px">Kind regards,<br>Institute of Project Controls</p>
        </div>
      </div>
    """
    try:
        _send_mime_message(
            recipient=recipient,
            subject=subject,
            text_body=text_body,
            html_body=html_body,
        )
    except (ImproperlyConfigured, requests.RequestException) as exc:
        raise GraphMailError("Microsoft Graph could not send the scholarship reminder email.") from exc


def send_password_reset_email(*, recipient, name, reset_url):
    sender = _required_setting("GRAPH_SENDER")
    safe_name = html.escape(name or "IPC member")
    safe_url = html.escape(reset_url, quote=True)
    body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.6;max-width:600px;margin:auto">
        <h1 style="color:#5b3b82">Reset your IPC password</h1>
        <p>Hello {safe_name},</p>
        <p>A secure password reset was requested for your IPC account.</p>
        <p><a href="{safe_url}" style="display:inline-block;background:#d79525;color:#0b0b0b;padding:12px 20px;text-decoration:none;font-weight:700">Set a new password</a></p>
        <p>This link is single-use and expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes.</p>
        <p>If you were not expecting this email, contact IPC support. Do not forward this message.</p>
      </div>
    """
    response = requests.post(
        f"https://graph.microsoft.com/v1.0/users/{quote(sender, safe='')}/sendMail",
        headers={"Authorization": f"Bearer {_access_token()}", "Content-Type": "application/json"},
        json={
            "message": {
                "subject": "Reset your IPC password",
                "body": {"contentType": "HTML", "content": add_ipc_logo(body)},
                "toRecipients": [{"emailAddress": {"address": recipient}}],
            },
            "saveToSentItems": True,
        },
        timeout=15,
    )
    if response.status_code != 202:
        logger.error("Microsoft Graph sendMail failed with status %s.", response.status_code)
        raise GraphMailError("Microsoft Graph could not send the password-reset email.")


def send_membership_welcome_email(
    *,
    recipient,
    name,
    application_reference,
    membership_grade,
    username,
    ipc_email,
    reset_url,
):
    safe_name = html.escape(name or "IPC member")
    safe_reference = html.escape(application_reference)
    safe_grade = html.escape(membership_grade)
    safe_username = html.escape(username)
    safe_ipc_email = html.escape(ipc_email)
    safe_url = html.escape(reset_url, quote=True)
    subject = "Your IPC Membership Account Is Ready"
    text_body = f"""Hello {name or 'IPC member'},

Congratulations. Your IPC membership application has been approved.

Application Reference: {application_reference}
Membership Grade: {membership_grade}
Username: {username}
IPC Email: {ipc_email}

Create your password using this secure, single-use link:
{reset_url}

This link expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes.
No password has been generated or sent to you.

Kind regards,
Institute of Project Controls
"""
    html_body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.6;max-width:620px;margin:auto;border:1px solid #eadfce">
        <div style="background:#0b0b0b;color:#f4ece1;padding:24px 28px">
          <strong style="color:#d79525;letter-spacing:.08em">IPC</strong>
          <h1 style="margin:8px 0 0;font-size:26px">Your membership account is ready</h1>
        </div>
        <div style="padding:28px">
          <p>Hello {safe_name},</p>
          <p>Congratulations. Your IPC membership application has been approved and your account is ready.</p>
          <div style="background:#f4ece1;padding:16px 18px;margin:20px 0">
            <p style="margin:0 0 6px"><strong>Application Reference:</strong> {safe_reference}</p>
            <p style="margin:0 0 6px"><strong>Membership Grade:</strong> {safe_grade}</p>
            <p style="margin:0 0 6px"><strong>Username:</strong> {safe_username}</p>
            <p style="margin:0"><strong>IPC Email:</strong> {safe_ipc_email}</p>
          </div>
          <p><a href="{safe_url}" style="display:inline-block;background:#d79525;color:#0b0b0b;padding:12px 20px;text-decoration:none;font-weight:700">Create Password</a></p>
          <p style="font-size:13px;color:#655d55">This secure link is single-use and expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes.</p>
          <p style="font-size:13px;color:#655d55">If the button does not work, copy this URL into your browser:<br><a href="{safe_url}">{safe_url}</a></p>
          <p>No plain-text password has been generated or sent.</p>
          <p>Kind regards,<br>Institute of Project Controls</p>
        </div>
      </div>
    """
    _send_mime_message(
        recipient=recipient,
        subject=subject,
        text_body=text_body,
        html_body=html_body,
    )


def send_event_account_invite_email(
    *, recipient, name, event_name, ipc_email, reset_url
):
    safe_name = html.escape(name or "IPC event attendee")
    safe_event_name = html.escape(event_name)
    safe_ipc_email = html.escape(ipc_email)
    safe_url = html.escape(reset_url, quote=True)
    subject = "Create Your IPC Account Password"
    text_body = f"""Hello {name or 'IPC event attendee'},

Thank you for attending or registering for {event_name}.

Your IPC account is ready.
IPC Email: {ipc_email}

Create your password using this secure, single-use link:
{reset_url}

This link expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes.
No password has been generated or sent to you.

Kind regards,
Institute of Project Controls
"""
    html_body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.6;max-width:620px;margin:auto;border:1px solid #eadfce">
        <div style="background:#0b0b0b;color:#f4ece1;padding:24px 28px">
          <strong style="color:#d79525;letter-spacing:.08em">IPC</strong>
          <h1 style="margin:8px 0 0;font-size:26px">Your IPC account is ready</h1>
        </div>
        <div style="padding:28px">
          <p>Hello {safe_name},</p>
          <p>Thank you for attending or registering for <strong>{safe_event_name}</strong>.</p>
          <div style="background:#f4ece1;padding:16px 18px;margin:20px 0">
            <p style="margin:0"><strong>IPC Email:</strong> {safe_ipc_email}</p>
          </div>
          <p><a href="{safe_url}" style="display:inline-block;background:#d79525;color:#0b0b0b;padding:12px 20px;text-decoration:none;font-weight:700">Create Password</a></p>
          <p style="font-size:13px;color:#655d55">This secure link is single-use and expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes.</p>
          <p style="font-size:13px;color:#655d55">If the button does not work, copy this URL into your browser:<br><a href="{safe_url}">{safe_url}</a></p>
          <p>No plain-text password has been generated or sent.</p>
          <p>Kind regards,<br>Institute of Project Controls</p>
        </div>
      </div>
    """
    _send_mime_message(
        recipient=recipient,
        subject=subject,
        text_body=text_body,
        html_body=html_body,
    )


def send_membership_refusal_email(
    *, recipient, name, application_reference, membership_grade, reason
):
    safe_name = html.escape(name or "Applicant")
    safe_reference = html.escape(application_reference)
    safe_grade = html.escape(membership_grade)
    safe_reason = html.escape(reason).replace("\n", "<br>")
    text_body = f"""Hello {name or 'Applicant'},

Thank you for applying for IPC membership. After reviewing your application, we are unable to approve it at this time.

Application Reference: {application_reference}
Membership Grade: {membership_grade}

Reason:
{reason}

Kind regards,
Institute of Project Controls
"""
    html_body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.6;max-width:620px;margin:auto;border:1px solid #eadfce">
        <div style="background:#0b0b0b;color:#f4ece1;padding:24px 28px">
          <strong style="color:#d79525;letter-spacing:.08em">IPC</strong>
          <h1 style="margin:8px 0 0;font-size:24px">Membership application update</h1>
        </div>
        <div style="padding:28px">
          <p>Hello {safe_name},</p>
          <p>Thank you for applying for IPC membership. After reviewing your application, we are unable to approve it at this time.</p>
          <div style="background:#f4ece1;padding:16px 18px;margin:20px 0">
            <p style="margin:0 0 6px"><strong>Application Reference:</strong> {safe_reference}</p>
            <p style="margin:0"><strong>Membership Grade:</strong> {safe_grade}</p>
          </div>
          <p><strong>Reason:</strong></p>
          <p>{safe_reason}</p>
          <p style="margin-top:28px">Kind regards,<br>Institute of Project Controls</p>
        </div>
      </div>
    """
    _send_mime_message(
        recipient=recipient,
        subject="Your IPC Membership Application",
        text_body=text_body,
        html_body=html_body,
    )


def send_bursary_approval_email(
    *,
    recipient,
    name,
    application_reference,
    pathway,
    message="",
):
    safe_name = html.escape(name or "IPC member")
    safe_reference = html.escape(application_reference)
    safe_pathway = html.escape(pathway)
    safe_message = html.escape(message).replace("\n", "<br>")
    text_message = f"\nMessage from IPC:\n{message}\n" if message else ""
    html_message = (
        f'<p><strong>Message from IPC:</strong></p><p>{safe_message}</p>'
        if message
        else ""
    )
    subject = "Your IPC bursary application has been approved"
    text_body = f"""Dear {name or 'IPC member'},

We are pleased to confirm that your IPC bursary application has been approved.

Application reference: {application_reference}
Module: {pathway}
{text_message}

The IPC team will contact you with the next steps.

Kind regards,
Institute of Project Controls
"""
    html_body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.65;max-width:620px;margin:auto;border:1px solid #eadfce">
        <div style="background:#0b0b0b;color:#f4ece1;padding:24px 28px">
          <strong style="color:#d79525;letter-spacing:.08em">IPC</strong>
          <h1 style="margin:8px 0 0;font-size:25px">Your bursary application has been approved</h1>
        </div>
        <div style="padding:28px">
          <p>Dear {safe_name},</p>
          <p>We are pleased to confirm that your IPC bursary application has been approved.</p>
          <div style="background:#f4ece1;padding:16px 18px;margin:20px 0;border-left:4px solid #d79525">
            <p style="margin:0 0 6px"><strong>Application reference:</strong> {safe_reference}</p>
            <p style="margin:0"><strong>Module:</strong> {safe_pathway}</p>
          </div>
          {html_message}
          <p>The IPC team will contact you with the next steps.</p>
          <p style="margin-top:28px">Kind regards,<br>Institute of Project Controls</p>
        </div>
      </div>
    """
    try:
        _send_mime_message(
            recipient=recipient,
            subject=subject,
            text_body=text_body,
            html_body=html_body,
        )
    except (ImproperlyConfigured, requests.RequestException) as exc:
        raise GraphMailError("Microsoft Graph could not send the bursary approval email.") from exc


def send_bursary_rejection_email(
    *,
    recipient,
    name,
    application_reference,
    pathway,
    reason,
):
    safe_name = html.escape(name or "IPC member")
    safe_reference = html.escape(application_reference)
    safe_pathway = html.escape(pathway)
    safe_reason = html.escape(reason).replace("\n", "<br>")
    subject = "Update on your IPC bursary application"
    text_body = f"""Dear {name or 'IPC member'},

Thank you for applying for an IPC bursary. After reviewing your application, we are unable to approve it at this time.

Application reference: {application_reference}
Module: {pathway}

Reason:
{reason}

Kind regards,
Institute of Project Controls
"""
    html_body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.65;max-width:620px;margin:auto;border:1px solid #eadfce">
        <div style="background:#0b0b0b;color:#f4ece1;padding:24px 28px">
          <strong style="color:#d79525;letter-spacing:.08em">IPC</strong>
          <h1 style="margin:8px 0 0;font-size:25px">Update on your bursary application</h1>
        </div>
        <div style="padding:28px">
          <p>Dear {safe_name},</p>
          <p>Thank you for applying for an IPC bursary. After reviewing your application, we are unable to approve it at this time.</p>
          <div style="background:#f4ece1;padding:16px 18px;margin:20px 0;border-left:4px solid #d79525">
            <p style="margin:0 0 6px"><strong>Application reference:</strong> {safe_reference}</p>
            <p style="margin:0"><strong>Module:</strong> {safe_pathway}</p>
          </div>
          <p><strong>Reason:</strong></p>
          <p>{safe_reason}</p>
          <p style="margin-top:28px">Kind regards,<br>Institute of Project Controls</p>
        </div>
      </div>
    """
    try:
        _send_mime_message(
            recipient=recipient,
            subject=subject,
            text_body=text_body,
            html_body=html_body,
        )
    except (ImproperlyConfigured, requests.RequestException) as exc:
        raise GraphMailError("Microsoft Graph could not send the bursary rejection email.") from exc


def send_bursary_needs_information_email(
    *,
    recipient,
    name,
    application_reference,
    pathway,
    message,
):
    safe_name = html.escape(name or "IPC member")
    safe_reference = html.escape(application_reference)
    safe_pathway = html.escape(pathway)
    safe_message = html.escape(message).replace("\n", "<br>")
    application_url = (
        f"{settings.FRONTEND_URL.rstrip('/')}/bursary-scholarship-application"
        f"?applicationReference={quote(application_reference, safe='')}"
    )
    safe_application_url = html.escape(application_url, quote=True)
    subject = "More information is needed for your IPC bursary application"
    text_body = f"""Dear {name or 'IPC member'},

IPC needs some additional information before continuing the review of your bursary application.

Application reference: {application_reference}
Module: {pathway}

Message from IPC:
{message}

Sign in to update and resubmit your application:
{application_url}

Kind regards,
Institute of Project Controls
"""
    html_body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.65;max-width:620px;margin:auto;border:1px solid #eadfce">
        <div style="background:#0b0b0b;color:#f4ece1;padding:24px 28px">
          <strong style="color:#d79525;letter-spacing:.08em">IPC</strong>
          <h1 style="margin:8px 0 0;font-size:25px">More information is needed</h1>
        </div>
        <div style="padding:28px">
          <p>Dear {safe_name},</p>
          <p>IPC needs some additional information before continuing the review of your bursary application.</p>
          <div style="background:#f4ece1;padding:16px 18px;margin:20px 0;border-left:4px solid #d79525">
            <p style="margin:0 0 6px"><strong>Application reference:</strong> {safe_reference}</p>
            <p style="margin:0"><strong>Module:</strong> {safe_pathway}</p>
          </div>
          <p><strong>Message from IPC:</strong></p>
          <p>{safe_message}</p>
          <p style="margin:24px 0"><a href="{safe_application_url}" style="display:inline-block;background:#d79525;color:#171411;text-decoration:none;font-weight:bold;padding:12px 18px">Update application</a></p>
          <p style="margin-top:28px">Kind regards,<br>Institute of Project Controls</p>
        </div>
      </div>
    """
    try:
        _send_mime_message(
            recipient=recipient,
            subject=subject,
            text_body=text_body,
            html_body=html_body,
        )
    except (ImproperlyConfigured, requests.RequestException) as exc:
        raise GraphMailError("Microsoft Graph could not send the bursary information-request email.") from exc
