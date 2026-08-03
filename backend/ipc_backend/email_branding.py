import html

from django.conf import settings
from django.core.mail import send_mail as django_send_mail


DEFAULT_IPC_EMAIL_LOGO_URL = (
    "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/"
    "e6e47869fdd1459f891ad4c5852798c5.png"
)


def ipc_email_logo_markup():
    logo_url = html.escape(
        getattr(settings, "IPC_EMAIL_LOGO_URL", DEFAULT_IPC_EMAIL_LOGO_URL),
        quote=True,
    )
    home_url = html.escape(settings.FRONTEND_URL.rstrip("/") or "/", quote=True)
    return (
        f'<a href="{home_url}" style="display:inline-block;text-decoration:none">'
        f'<img src="{logo_url}" alt="Institute of Project Controls" width="170" '
        'style="display:block;width:170px;max-width:100%;height:auto;border:0;'
        'background:#ffffff;padding:8px 12px;border-radius:4px">'
        "</a>"
    )


def add_ipc_logo(html_body):
    """Replace the text IPC mark in an HTML email with the official logo."""
    logo = ipc_email_logo_markup()
    markers = (
        '<strong style="color:#d79525;letter-spacing:.08em">IPC</strong>',
        '<div style="color:#d89424;font-size:13px;font-weight:700;letter-spacing:3px">IPC</div>',
    )
    for marker in markers:
        if marker in html_body:
            return html_body.replace(marker, logo, 1)

    return f"""
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto">
        <div style="background:#0b0b0b;padding:20px 28px">{logo}</div>
        {html_body}
      </div>
    """


def render_branded_email(subject, message):
    safe_subject = html.escape(subject)
    safe_message = html.escape(message).replace("\n", "<br>")
    return f"""
      <div style="font-family:Arial,sans-serif;color:#171411;line-height:1.65;max-width:620px;margin:auto;border:1px solid #eadfce">
        <div style="background:#0b0b0b;color:#f4ece1;padding:22px 28px">
          {ipc_email_logo_markup()}
          <h1 style="margin:14px 0 0;font-size:22px">{safe_subject}</h1>
        </div>
        <div style="padding:28px">{safe_message}</div>
      </div>
    """


def send_branded_mail(
    subject,
    message,
    from_email,
    recipient_list,
    fail_silently=False,
    auth_user=None,
    auth_password=None,
    connection=None,
    html_message=None,
):
    branded_html = (
        add_ipc_logo(html_message)
        if html_message
        else render_branded_email(subject, message)
    )
    return django_send_mail(
        subject,
        message,
        from_email,
        recipient_list,
        fail_silently=fail_silently,
        auth_user=auth_user,
        auth_password=auth_password,
        connection=connection,
        html_message=branded_html,
    )
