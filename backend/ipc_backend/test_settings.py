from .settings import *  # noqa: F403


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "test.sqlite3",  # noqa: F405
    }
}
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
BURSARY_GOOGLE_SHEETS_ENABLED = False
BURSARY_GOOGLE_SHEETS_SPREADSHEET_ID = ""
GOOGLE_SERVICE_ACCOUNT_JSON = ""
GOOGLE_SERVICE_ACCOUNT_FILE = ""
