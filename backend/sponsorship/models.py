from django.core.exceptions import ValidationError
from django.db import models


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
    key = models.SlugField(max_length=40, unique=True, default="main")
    routes = models.JSONField(validators=[validate_sponsorship_cards])
    partner_types = models.JSONField(validators=[validate_partner_types])
    integrity_principles = models.JSONField(validators=[validate_sponsorship_cards])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "sponsorship_content"
        verbose_name = "Sponsorship page content"
        verbose_name_plural = "Sponsorship page content"

    def __str__(self):
        return self.key

