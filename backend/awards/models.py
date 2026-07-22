from django.core.exceptions import ValidationError
from django.conf import settings
from django.db import models
from ipc_backend.validators import validate_content_section


def validate_award_cards(value):
    _validate_award_content(value, ("icon", "title", "description"), "Card")


def validate_award_timeline(value):
    _validate_award_content(value, ("phase", "period", "description"), "Timeline")


def _validate_award_content(value, required_fields, label):
    if not isinstance(value, list):
        raise ValidationError(f"{label} content must be a list.")
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


class AwardCategory(models.Model):
    title = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    description = models.TextField()
    image_url = models.URLField(max_length=1000)
    icon_class = models.CharField(max_length=80)
    highlights = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "title"]
        verbose_name_plural = "Award categories"
        indexes = [
            models.Index(fields=["is_active", "sort_order"], name="awards_cat_active_order_idx"),
        ]

    def __str__(self):
        return self.title


class AwardProgramme(models.Model):

    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    criteria = models.JSONField(default=list, blank=True)
    category = models.ForeignKey(
        AwardCategory,
        on_delete=models.PROTECT,
        related_name="programmes",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["title"]
        indexes = [
            models.Index(fields=["category", "is_active"], name="awards_prog_cat_active_idx"),
            models.Index(fields=["slug"], name="awards_awar_slug_1d6b47_idx"),
        ]

    def __str__(self):
        return self.title


class AwardPageContent(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    key = models.SlugField(max_length=40, unique=True, default="main")
    hero = models.JSONField(default=dict, validators=[validate_content_section])
    framework_intro = models.JSONField(default=dict, validators=[validate_content_section])
    featured_intro = models.JSONField(default=dict, validators=[validate_content_section])
    timeline_intro = models.JSONField(default=dict, validators=[validate_content_section])
    nomination_timeline = models.JSONField(validators=[validate_award_timeline])
    benefits_intro = models.JSONField(default=dict, validators=[validate_content_section])
    impact_benefits = models.JSONField(validators=[validate_award_cards])
    beneficiaries_intro = models.JSONField(default=dict, validators=[validate_content_section])
    beneficiaries = models.JSONField(default=list, validators=[validate_content_section])
    integrity_intro = models.JSONField(default=dict, validators=[validate_content_section])
    integrity_principles = models.JSONField(validators=[validate_award_cards])
    partnerships_intro = models.JSONField(default=dict, validators=[validate_content_section])
    partnerships = models.JSONField(default=list, validators=[validate_content_section])
    faq = models.JSONField(default=dict, validators=[validate_content_section])
    interest_intro = models.JSONField(default=dict, validators=[validate_content_section])
    final_cta = models.JSONField(default=dict, validators=[validate_content_section])
    seo = models.JSONField(default=dict, validators=[validate_content_section])
    legacy_content = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PUBLISHED)
    is_active = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="updated_awards_content")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "awards_content"
        verbose_name = "Awards page content"
        verbose_name_plural = "Awards page content"

    def __str__(self):
        return self.key


class AwardsInterest(models.Model):
    class InterestType(models.TextChoices):
        NOMINATE = "Nominate", "Nominate"
        SPONSOR = "Sponsor", "Sponsor"
        JUDGE = "Judge", "Judge"
        GENERAL = "General", "General"

    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        CLOSED = "closed", "Closed"

    programme = models.ForeignKey(AwardProgramme, null=True, blank=True, on_delete=models.SET_NULL, related_name="interests")
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=160)
    email = models.EmailField()
    interest_type = models.CharField(max_length=24, choices=InterestType.choices)
    message = models.TextField(blank=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.NEW)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["interest_type", "created_at"]),
            models.Index(fields=["status"]),
            models.Index(fields=["email"]),
        ]

    def __str__(self):
        return f"{self.name} - {self.interest_type}"
