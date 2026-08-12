from pathlib import Path
from datetime import timedelta
import environ

BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, []),
    CORS_ALLOWED_ORIGINS=(list, []),
)
environ.Env.read_env(BASE_DIR / ".env", overwrite=True)

SECRET_KEY = env("SECRET_KEY", default="unsafe-dev-key-change-me")
DEBUG = env.bool("DEBUG", default=True)
ALLOWED_HOSTS = env("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "accounts",
    "memberships",
    "applications",
    "events",
    "awards",
    "contact",
    "newsletter",
    "media_library",
    "clubs",
    "scholarships.apps.ScholarshipsConfig",
    "sponsorship",
    "about",
    "home",
    "services",
    "fund",
    "institutional",
    "user_panel",
    "chat",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "ipc_backend.content_cache.ContentNoStoreMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "ipc_backend.idempotency.IdempotencyMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "ipc_backend.urls"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates",
    "DIRS": [],
    "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.debug",
        "django.template.context_processors.request",
        "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]
WSGI_APPLICATION = "ipc_backend.wsgi.application"
ASGI_APPLICATION = "ipc_backend.asgi.application"

DATABASES = {
    "default": env.db("DATABASE_URL", default="postgres://ipc:ipc@localhost:5432/ipc")
}
if env.bool("USE_SQLITE_TEST_DB", default=False):
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / ".cms-test.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-gb"
TIME_ZONE = "Europe/London"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOWED_ORIGINS = env(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:5173",
        "https://localhost:5173",
        "http://127.0.0.1:5173",
        "https://127.0.0.1:5173",
        "http://localhost:5174",
        "https://localhost:5174",
        "http://127.0.0.1:5174",
        "https://127.0.0.1:5174",
    ],
)
CSRF_TRUSTED_ORIGINS = env(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "http://localhost:5173",
        "https://localhost:5173",
        "http://127.0.0.1:5173",
        "https://127.0.0.1:5173",
        "http://localhost:5174",
        "https://localhost:5174",
        "http://127.0.0.1:5174",
        "https://127.0.0.1:5174",
    ],
)
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "accounts.authentication.CookieJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.AllowAny"],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": env("DRF_ANON_THROTTLE", default="60/min"),
        "user": env("DRF_USER_THROTTLE", default="300/min"),
        "club_enquiries": env("DRF_CLUB_ENQUIRY_THROTTLE", default="5/hour"),
        "auth_login": env("DRF_AUTH_LOGIN_THROTTLE", default="5/min"),
        "auth_refresh": env("DRF_AUTH_REFRESH_THROTTLE", default="30/hour"),
        "admin_password_reset": env("DRF_ADMIN_PASSWORD_RESET_THROTTLE", default="10/hour"),
        "password_reset_request": env("DRF_PASSWORD_RESET_REQUEST_THROTTLE", default="5/hour"),
        "admin_enquiry_reply": env("DRF_ADMIN_ENQUIRY_REPLY_THROTTLE", default="30/hour"),
        "password_reset_confirm": env("DRF_PASSWORD_RESET_CONFIRM_THROTTLE", default="10/hour"),
        "event_registration": env("DRF_EVENT_REGISTRATION_THROTTLE", default="10/hour"),
        "event_account_invite": env("DRF_EVENT_ACCOUNT_INVITE_THROTTLE", default="20/hour"),
        "zoho_webhook": env("DRF_ZOHO_WEBHOOK_THROTTLE", default="30/min"),
        "bursary_application": env(
            "DRF_BURSARY_APPLICATION_THROTTLE",
            default="100/min" if DEBUG else "20/hour",
        ),
        "scholarship_announcement": env(
            "DRF_SCHOLARSHIP_ANNOUNCEMENT_THROTTLE",
            default="120/min",
        ),
        "bursary_membership_validation": env(
            "DRF_BURSARY_MEMBERSHIP_VALIDATION_THROTTLE",
            default="240/min" if DEBUG else "60/min",
        ),
        "chat_conversation": env("DRF_CHAT_CONVERSATION_THROTTLE", default="5/hour"),
        "chat_message": env("DRF_CHAT_MESSAGE_THROTTLE", default="30/hour"),
        "chat_poll": env("DRF_CHAT_POLL_THROTTLE", default="120/min"),
        "chat_inbound": env("DRF_CHAT_INBOUND_THROTTLE", default="120/min"),
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=env.int("JWT_ACCESS_MINUTES", default=15)),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=env.int("JWT_REFRESH_DAYS", default=7)),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": True,
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
}
AUTH_COOKIE_ACCESS = "ipc_access"
AUTH_COOKIE_REFRESH = "ipc_refresh"
AUTH_COOKIE_SECURE = env.bool("AUTH_COOKIE_SECURE", default=not DEBUG)
AUTH_COOKIE_SAMESITE = env("AUTH_COOKIE_SAMESITE", default="Lax")
AUTH_COOKIE_DOMAIN = env("AUTH_COOKIE_DOMAIN", default=None)

FILE_UPLOAD_MAX_MEMORY_SIZE = env.int("FILE_UPLOAD_MAX_MEMORY_SIZE", default=8 * 1024 * 1024)
DATA_UPLOAD_MAX_MEMORY_SIZE = env.int("DATA_UPLOAD_MAX_MEMORY_SIZE", default=24 * 1024 * 1024)

EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL", default="office@instituteofprojectcontrols.org")
IPC_REVIEW_EMAIL = env("IPC_REVIEW_EMAIL", default=DEFAULT_FROM_EMAIL)
EVENT_SUPPORT_EMAIL = env("EVENT_SUPPORT_EMAIL", default=IPC_REVIEW_EMAIL)
EMAIL_HOST = env("EMAIL_HOST", default="")
EMAIL_PORT = env.int("EMAIL_PORT", default=587)
EMAIL_HOST_USER = env("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD", default="")
EMAIL_USE_TLS = env.bool("EMAIL_USE_TLS", default=True)
SUPPORT_EMAIL = env("SUPPORT_EMAIL", default=IPC_REVIEW_EMAIL)
CHAT_INBOUND_DOMAIN = env("CHAT_INBOUND_DOMAIN", default="")
CHAT_INBOUND_ADDRESS = env("CHAT_INBOUND_ADDRESS", default="")
CHAT_INBOUND_WEBHOOK_TOKEN = env("CHAT_INBOUND_WEBHOOK_TOKEN", default="")
CHAT_INBOUND_WEBHOOK_SECRET = env("CHAT_INBOUND_WEBHOOK_SECRET", default="")
CHAT_STAFF_EMAILS = env.list("CHAT_STAFF_EMAILS", default=[])
CHAT_STAFF_EMAIL_DOMAINS = env.list("CHAT_STAFF_EMAIL_DOMAINS", default=[])
FRONTEND_URL = env(
    "FRONTEND_URL",
    default="https://instituteofprojectcontrols.com",
).rstrip("/")
IPC_EMAIL_LOGO_URL = env(
    "IPC_EMAIL_LOGO_URL",
    default=(
        "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/"
        "6a97d877629743568d5134c4ff2255b8.png"
    ),
)
IPC_ACCOUNT_EMAIL_DOMAIN = env("IPC_ACCOUNT_EMAIL_DOMAIN", default="ipc.com")

BURSARY_GOOGLE_SHEETS_ENABLED = env.bool("BURSARY_GOOGLE_SHEETS_ENABLED", default=False)
BURSARY_GOOGLE_SHEETS_SPREADSHEET_ID = env(
    "BURSARY_GOOGLE_SHEETS_SPREADSHEET_ID",
    default="",
)
BURSARY_GOOGLE_SHEETS_WORKSHEET_NAME = env(
    "BURSARY_GOOGLE_SHEETS_WORKSHEET_NAME",
    default="Bursary Applications",
)
GOOGLE_SERVICE_ACCOUNT_JSON = env("GOOGLE_SERVICE_ACCOUNT_JSON", default="")
GOOGLE_SERVICE_ACCOUNT_FILE = env("GOOGLE_SERVICE_ACCOUNT_FILE", default="")

GRAPH_TENANT_ID = env("GRAPH_TENANT_ID", default="")
GRAPH_CLIENT_ID = env("GRAPH_CLIENT_ID", default="")
GRAPH_CLIENT_SECRET = env("GRAPH_CLIENT_SECRET", default="")
GRAPH_SENDER = env("GRAPH_SENDER", default="")
PASSWORD_RESET_EXPIRE_MINUTES = env.int("PASSWORD_RESET_EXPIRE_MINUTES", default=30)
PASSWORD_RESET_TIMEOUT = PASSWORD_RESET_EXPIRE_MINUTES * 60
EMAIL_COOLDOWN_MINUTES = env.int("EMAIL_COOLDOWN_MINUTES", default=5)

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = False
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
if not DEBUG:
    SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True



EVENTBRITE_CLIENT_ID = env("EVENTBRITE_CLIENT_ID", default="")
EVENTBRITE_CLIENT_SECRET = env("EVENTBRITE_CLIENT_SECRET", default="")
EVENTBRITE_PRIVATE_TOKEN = env("EVENTBRITE_PRIVATE_TOKEN", default="")
EVENTBRITE_PUBLIC_TOKEN = env("EVENTBRITE_PUBLIC_TOKEN", default="")
EVENTBRITE_REDIRECT_URI = env("EVENTBRITE_REDIRECT_URI", default="http://localhost:8000/api/events/eventbrite/callback")
EVENTBRITE_ORGANIZATION_ID = env("EVENTBRITE_ORGANIZATION_ID", default="")
EVENTBRITE_REQUEST_TIMEOUT = env.int("EVENTBRITE_REQUEST_TIMEOUT", default=60)

ZOHO_FORMS_WEBHOOK_TOKEN = env("ZOHO_FORMS_WEBHOOK_TOKEN", default="")
ZOHO_FORMS_EVENT_NAME = env("ZOHO_FORMS_EVENT_NAME", default="")
