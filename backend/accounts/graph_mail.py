import html
import logging
from urllib.parse import quote

import requests
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured


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


def send_password_reset_email(*, recipient, name, reset_url):
    sender = _required_setting("GRAPH_SENDER")
    safe_name = html.escape(name or "IPC member")
    safe_url = html.escape(reset_url, quote=True)
    body = f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.6;max-width:600px;margin:auto">
        <h1 style="color:#5b3b82">Reset your IPC password</h1>
        <p>Hello {safe_name},</p>
        <p>An IPC administrator requested a secure password reset for your account.</p>
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
                "body": {"contentType": "HTML", "content": body},
                "toRecipients": [{"emailAddress": {"address": recipient}}],
            },
            "saveToSentItems": True,
        },
        timeout=15,
    )
    if response.status_code != 202:
        logger.error("Microsoft Graph sendMail failed with status %s.", response.status_code)
        raise GraphMailError("Microsoft Graph could not send the password-reset email.")
