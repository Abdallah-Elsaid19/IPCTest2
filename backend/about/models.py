from django.core.exceptions import ValidationError
from django.db import models


def validate_collection(value, required_fields, label):
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
                raise ValidationError(f"{label} item {index} must include a non-empty {field}.")


def validate_statistics(value):
    validate_collection(value, ("number", "label"), "Statistics")


def validate_titled_cards(value):
    validate_collection(value, ("icon", "title", "description"), "About cards")


def validate_vision_pillars(value):
    validate_collection(value, ("icon", "title"), "Vision pillars")


class AboutPageContent(models.Model):
    key = models.SlugField(max_length=40, unique=True, default="main")
    statistics = models.JSONField(validators=[validate_statistics])
    why_exists = models.JSONField(validators=[validate_titled_cards])
    vision_pillars = models.JSONField(validators=[validate_vision_pillars])
    missions = models.JSONField(validators=[validate_titled_cards])
    core_values = models.JSONField(validators=[validate_titled_cards])
    identity_symbols = models.JSONField(validators=[validate_titled_cards])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "about_content"
        verbose_name = "About page content"
        verbose_name_plural = "About page content"

    def __str__(self):
        return self.key
