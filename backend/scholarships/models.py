from django.core.exceptions import ValidationError
from django.db import models
from django.conf import settings
from ipc_backend.validators import validate_content_section


CARD_FIELDS = ("title", "description")


def validate_card_collection(value):
    if not isinstance(value, list):
        raise ValidationError("This value must be a list of cards.")
    if not value:
        raise ValidationError("Add at least one card.")
    if len(value) > 24:
        raise ValidationError("Add no more than 24 cards.")

    for index, card in enumerate(value, start=1):
        if not isinstance(card, dict):
            raise ValidationError(f"Card {index} must be an object.")
        for field in CARD_FIELDS:
            field_value = card.get(field)
            if not isinstance(field_value, str) or not field_value.strip():
                raise ValidationError(f"Card {index} must include a non-empty {field}.")

        icon = card.get("icon")
        if icon is not None and (not isinstance(icon, str) or not icon.strip()):
            raise ValidationError(
                f"Card {index} icon must be a non-empty string when provided."
            )


class ScholarshipContent(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    key = models.SlugField(max_length=40, unique=True, default="main")
    hero = models.JSONField(default=dict, validators=[validate_content_section])
    commitment = models.JSONField(default=dict, validators=[validate_content_section])
    fund = models.JSONField(default=dict, validators=[validate_content_section])
    principles = models.JSONField(default=dict, validators=[validate_content_section])
    audiences_intro = models.JSONField(default=dict, validators=[validate_content_section])
    audiences = models.JSONField(validators=[validate_card_collection])
    values = models.JSONField(validators=[validate_card_collection])
    values_intro = models.JSONField(default=dict, validators=[validate_content_section])
    eligibility = models.JSONField(default=dict, validators=[validate_content_section])
    recipient_commitment = models.JSONField(default=dict, validators=[validate_content_section])
    application_process = models.JSONField(default=dict, validators=[validate_content_section])
    partners = models.JSONField(default=dict, validators=[validate_content_section])
    academic_partners = models.JSONField(default=dict, validators=[validate_content_section])
    conditions = models.JSONField(default=dict, validators=[validate_content_section])
    impact = models.JSONField(default=dict, validators=[validate_content_section])
    faq = models.JSONField(default=dict, validators=[validate_content_section])
    final_cta = models.JSONField(default=dict, validators=[validate_content_section])
    seo = models.JSONField(default=dict, validators=[validate_content_section])
    legacy_content = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PUBLISHED)
    is_active = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="updated_scholarship_content")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "scholarships_content"
        verbose_name = "Scholarship page content"
        verbose_name_plural = "Scholarship page content"

    def __str__(self):
        return self.key
