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
from django.core.mail import EmailMultiAlternatives

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


def _graph_is_configured():
    values = (
        getattr(settings, "GRAPH_TENANT_ID", ""),
        getattr(settings, "GRAPH_CLIENT_ID", ""),
        getattr(settings, "GRAPH_CLIENT_SECRET", ""),
        getattr(settings, "GRAPH_SENDER", ""),
    )
    return all(str(value).strip() for value in values)


def _send_mime_message(*, recipient, subject, text_body, html_body, reply_to=None):
    sender = (
        _required_setting("GRAPH_SENDER")
        if _graph_is_configured()
        else settings.DEFAULT_FROM_EMAIL
    )
    message_id = make_msgid(domain=sender.rsplit("@", 1)[-1])

    if not _graph_is_configured():
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=sender,
            to=[recipient],
            reply_to=[reply_to] if reply_to else None,
            headers={"Message-ID": message_id},
        )
        message.attach_alternative(add_ipc_logo(html_body), "text/html")
        try:
            message.send(fail_silently=False)
        except Exception as exc:
            logger.exception("SMTP email delivery failed.")
            raise GraphMailError("Email could not be sent.") from exc
        return message_id.strip("<>")

    message = EmailMessage()
    message["From"] = sender
    message["To"] = recipient
    message["Subject"] = subject
    if reply_to:
        message["Reply-To"] = reply_to
    message["Date"] = formatdate(localtime=True)
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
    subject = "IPC Round Two scholarship announcement reminder — 10 September 2026"
    text_body = f"""Hello,

This is your requested reminder that approved Round Two IPC scholarship and bursary applicants will be announced on 10 September 2026 at 2:00 PM London time.

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
          <p>This is your requested reminder that approved Round Two IPC scholarship and bursary applicants will be announced on <strong>10 September 2026 at 2:00 PM London time</strong>.</p>
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
    safe_name = html.escape(name or "IPC member")
    safe_url = html.escape(reset_url, quote=True)
    text_body = f"""Hello {name or 'IPC member'},

A secure password reset was requested for your IPC account.

Set a new password using this secure link:
{reset_url}

This link is single-use and expires in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes.

If you were not expecting this email, contact IPC support. Do not forward this message.
"""
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
    _send_mime_message(
        recipient=recipient,
        subject="Reset your IPC password",
        text_body=text_body,
        html_body=body,
    )


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


def send_bursary_payment_plan_offer_email(
    *,
    recipient,
    name,
    application_reference,
    modules,
    amount_payable,
    deposit_amount,
    installments,
    login_email,
    portal_url,
    password_reset_url,
    password_setup_url=None,
):
    """Send the complete payment offer and secure portal access details."""
    safe_name = html.escape(name or "IPC bursary recipient")
    safe_reference = html.escape(application_reference)
    safe_modules = html.escape(", ".join(modules) or "IPC programme")
    safe_login = html.escape(login_email)
    safe_portal_url = html.escape(portal_url, quote=True)
    safe_setup_url = html.escape(password_setup_url or "", quote=True)
    safe_reset_url = html.escape(password_reset_url, quote=True)
    amount_text = f"£{amount_payable:,.2f}"
    deposit_text = f"£{deposit_amount:,.2f}"
    installment_lines = [
        f"{item['label']}: £{item['amount']:,.2f} due {item['due_date']}"
        for item in installments
    ]
    rows = "".join(
        "<tr>"
        f"<td style='padding:9px 10px;border-bottom:1px solid #eadfce'>{html.escape(item['label'])}</td>"
        f"<td style='padding:9px 10px;border-bottom:1px solid #eadfce'>£{item['amount']:,.2f}</td>"
        f"<td style='padding:9px 10px;border-bottom:1px solid #eadfce'>{html.escape(item['due_date'])}</td>"
        "</tr>"
        for item in installments
    )
    access_instruction = (
        f"Create your password using this secure, single-use link:\n{password_setup_url}\n\n"
        if password_setup_url
        else (
            "An IPC account already exists for you. Sign in using your existing password.\n"
            f"If you do not know it, request a secure password link using the login email above:\n{password_reset_url}\n\n"
        )
    )
    access_button = (
        f'<p><a href="{safe_setup_url}" style="display:inline-block;background:#d79525;color:#0b0b0b;padding:12px 20px;text-decoration:none;font-weight:700">Create password</a></p>'
        if password_setup_url
        else (
            "<p>An IPC account already exists for you. Sign in using your existing password.</p>"
            f'<p>Do not know your password? <a href="{safe_reset_url}">Request a secure password link</a>'
            " using the login email shown above. The link will be sent to your registered personal email.</p>"
        )
    )
    subject = f"Your IPC Payment Plan Is Ready — {application_reference}"
    text_body = f"""Hello {name or 'IPC bursary recipient'},

Your IPC payment plan is ready for review.

Application reference: {application_reference}
Modules: {', '.join(modules) or 'IPC programme'}
Total payable: {amount_text}
Deposit: {deposit_text}

Payment schedule:
{chr(10).join(installment_lines)}

Payment portal login: {login_email}
{access_instruction}Open your secure payment portal:
{portal_url}

No password has been generated or included in this email.

Kind regards,
Institute of Project Controls
"""
    html_body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.6;max-width:680px;margin:auto;border:1px solid #eadfce">
        <div style="background:#0b0b0b;color:#f4ece1;padding:24px 28px">
          <strong style="color:#d79525;letter-spacing:.08em">IPC</strong>
          <h1 style="margin:8px 0 0;font-size:26px">Your payment plan is ready</h1>
        </div>
        <div style="padding:28px">
          <p>Hello {safe_name},</p>
          <p>Please review and accept your IPC bursary payment plan in your secure payment portal.</p>
          <div style="background:#f4ece1;padding:16px 18px;margin:20px 0">
            <p style="margin:0 0 6px"><strong>Application reference:</strong> {safe_reference}</p>
            <p style="margin:0 0 6px"><strong>Modules:</strong> {safe_modules}</p>
            <p style="margin:0 0 6px"><strong>Total payable:</strong> {amount_text}</p>
            <p style="margin:0"><strong>Deposit:</strong> {deposit_text}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
            <thead><tr style="background:#171411;color:white"><th style="padding:9px 10px;text-align:left">Payment</th><th style="padding:9px 10px;text-align:left">Amount</th><th style="padding:9px 10px;text-align:left">Due date</th></tr></thead>
            <tbody>{rows}</tbody>
          </table>
          <div style="border-left:4px solid #d79525;padding:12px 16px;margin:20px 0">
            <strong>Payment portal login</strong><br>{safe_login}
          </div>
          {access_button}
          <p><a href="{safe_portal_url}" style="display:inline-block;background:#171411;color:#ffffff;padding:12px 20px;text-decoration:none;font-weight:700">Open payment portal</a></p>
          <p style="font-size:13px;color:#655d55">For security, no password has been generated or sent by email.</p>
          <p>Kind regards,<br>Institute of Project Controls</p>
        </div>
      </div>
    """
    return _send_mime_message(
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
    announcement_url = f"{settings.FRONTEND_URL.rstrip('/')}/scholarships/announcement"
    safe_name = html.escape(name or "IPC member")
    safe_reference = html.escape(application_reference)
    safe_pathway = html.escape(pathway)
    safe_message = html.escape(message).replace("\n", "<br>")
    safe_announcement_url = html.escape(announcement_url, quote=True)
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

View the scholarship announcement:
{announcement_url}

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
          <p style="margin:24px 0"><a href="{safe_announcement_url}" style="display:inline-block;background:#d79525;color:#171411;text-decoration:none;font-weight:bold;padding:12px 18px">View scholarship announcement</a></p>
          <p style="font-size:13px;color:#655d55">If the button does not work, copy this URL into your browser:<br><a href="{safe_announcement_url}">{safe_announcement_url}</a></p>
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
    edit_token,
):
    safe_name = html.escape(name or "IPC member")
    safe_reference = html.escape(application_reference)
    safe_pathway = html.escape(pathway)
    safe_message = html.escape(message).replace("\n", "<br>")
    application_url = (
        f"{settings.FRONTEND_URL.rstrip('/')}/bursary-scholarship-application"
        f"?applicationReference={quote(application_reference, safe='')}"
        f"#editToken={quote(edit_token, safe='')}"
    )
    safe_application_url = html.escape(application_url, quote=True)
    subject = "More information is needed for your IPC bursary application"
    text_body = f"""Dear {name or 'IPC member'},

IPC needs some additional information before continuing the review of your bursary application.

Application reference: {application_reference}
Module: {pathway}

Message from IPC:
{message}

Update and resubmit your application using this secure link. No sign-in is required:
{application_url}

This private link expires in 7 days and stops working after you resubmit or the application status changes. If it expires, contact IPC for a new link.

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
          <p>No sign-in is required. This private link expires in 7 days and stops working after you resubmit or the application status changes. If it expires, contact IPC for a new link.</p>
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
