from django.core.exceptions import ValidationError
from django.db import models


CARD_FIELDS = ("icon", "title", "description")


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


class ScholarshipContent(models.Model):
    key = models.SlugField(max_length=40, unique=True, default="main")
    audiences = models.JSONField(validators=[validate_card_collection])
    values = models.JSONField(validators=[validate_card_collection])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "scholarships_content"
        verbose_name = "Scholarship page content"
        verbose_name_plural = "Scholarship page content"

    def __str__(self):
        return self.key

