from django.apps import AppConfig


class ScholarshipsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "scholarships"

    def ready(self):
        from . import signals  # noqa: F401
