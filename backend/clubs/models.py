import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from ipc_backend.validators import validate_content_section


def validate_content_collection(value, required_fields, label):
    if not isinstance(value, list):
        raise ValidationError(f"{label} must be a list.")
    if not value:
        raise ValidationError(f"Add at least one {label.lower()} item.")
    if len(value) > 24:
        raise ValidationError(f"Add no more than 24 {label.lower()} items.")

    for index, item in enumerate(value, start=1):
        if not isinstance(item, dict):
            raise ValidationError(f"{label} item {index} must be an object.")
        for field in required_fields:
            field_value = item.get(field)
            if not isinstance(field_value, str) or not field_value.strip():
                raise ValidationError(
                    f"{label} item {index} must include a non-empty {field}."
                )


def validate_regional_clubs(value):
    validate_content_collection(
        value, ("icon", "name", "description", "label"), "Regional clubs"
    )


def validate_club_cards(value):
    validate_content_collection(
        value, ("icon", "title", "description"), "Club cards"
    )


class ClubPageContent(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    key = models.SlugField(max_length=40, unique=True, default="main")
    hero = models.JSONField(default=dict, blank=True, validators=[validate_content_section])
    principles = models.JSONField(default=dict, blank=True, validators=[validate_content_section])
    purpose = models.JSONField(default=dict, blank=True, validators=[validate_content_section])
    locations_intro = models.JSONField(default=dict, blank=True, validators=[validate_content_section])
    regional_clubs = models.JSONField(validators=[validate_regional_clubs])
    programme_intro = models.JSONField(default=dict, blank=True, validators=[validate_content_section])
    activities = models.JSONField(validators=[validate_club_cards])
    audiences_intro = models.JSONField(default=dict, blank=True, validators=[validate_content_section])
    audience_values = models.JSONField(validators=[validate_club_cards])
    upcoming = models.JSONField(default=dict, blank=True, validators=[validate_content_section])
    contribution = models.JSONField(default=dict, blank=True, validators=[validate_content_section])
    partners = models.JSONField(default=dict, blank=True, validators=[validate_content_section])
    faq = models.JSONField(default=dict, blank=True, validators=[validate_content_section])
    final_cta = models.JSONField(default=dict, blank=True, validators=[validate_content_section])
    seo = models.JSONField(default=dict, blank=True, validators=[validate_content_section])
    legacy_content = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PUBLISHED)
    is_active = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="updated_club_content")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "clubs_content"
        verbose_name = "Club page content"
        verbose_name_plural = "Club page content"

    def __str__(self):
        return self.key


class ClubEnquiry(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        CLOSED = "closed", "Closed"
        SPAM = "spam", "Spam"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(max_length=254)
    message = models.TextField(max_length=2000)
    club_name = models.CharField(max_length=200, blank=True)
    club_slug = models.SlugField(max_length=200, blank=True)
    page_url = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["email"]),
            models.Index(fields=["club_slug"]),
        ]

    def __str__(self):
        club = self.club_name or "General clubs enquiry"
        return f"{self.email} - {club}"
