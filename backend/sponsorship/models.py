from django.core.exceptions import ValidationError
from django.db import models
from django.conf import settings
from ipc_backend.validators import validate_content_section


def validate_object_collection(value, required_fields, label):
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


def validate_sponsorship_cards(value):
    validate_object_collection(value, ("icon", "title", "description"), "Card")


def validate_partner_types(value):
    validate_object_collection(value, ("type", "benefits"), "Partner")


class SponsorshipContent(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    key = models.SlugField(max_length=40, unique=True, default="main")
    hero = models.JSONField(default=dict, validators=[validate_content_section])
    principles = models.JSONField(default=dict, validators=[validate_content_section])
    purpose = models.JSONField(default=dict, validators=[validate_content_section])
    routes_intro = models.JSONField(default=dict, validators=[validate_content_section])
    routes = models.JSONField(validators=[validate_sponsorship_cards])
    scholarship_feature = models.JSONField(default=dict, validators=[validate_content_section])
    benefits = models.JSONField(default=dict, validators=[validate_content_section])
    recognition_levels = models.JSONField(default=dict, validators=[validate_content_section])
    partner_types = models.JSONField(validators=[validate_partner_types])
    integrity_principles = models.JSONField(validators=[validate_sponsorship_cards])
    integrity_intro = models.JSONField(default=dict, validators=[validate_content_section])
    route_builder = models.JSONField(default=dict, validators=[validate_content_section])
    process = models.JSONField(default=dict, validators=[validate_content_section])
    impact = models.JSONField(default=dict, validators=[validate_content_section])
    partners_intro = models.JSONField(default=dict, validators=[validate_content_section])
    faq = models.JSONField(default=dict, validators=[validate_content_section])
    final_cta = models.JSONField(default=dict, validators=[validate_content_section])
    seo = models.JSONField(default=dict, validators=[validate_content_section])
    legacy_content = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PUBLISHED)
    is_active = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="updated_sponsorship_content")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sponsorship_content"
        verbose_name = "Sponsorship page content"
        verbose_name_plural = "Sponsorship page content"

    def __str__(self):
        return self.key
