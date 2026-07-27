from django.conf import settings
from django.db import models

from ipc_backend.validators import validate_content_section


class ServiceContent(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    key = models.SlugField(max_length=40, unique=True, default="main")
    hero = models.JSONField(default=dict, validators=[validate_content_section])
    impact_strip = models.JSONField(default=dict, validators=[validate_content_section])
    why_services = models.JSONField(default=dict, validators=[validate_content_section])
    principles = models.JSONField(default=dict, validators=[validate_content_section])
    portfolio = models.JSONField(default=dict, validators=[validate_content_section])
    audiences = models.JSONField(default=dict, validators=[validate_content_section])
    journey = models.JSONField(default=dict, validators=[validate_content_section])
    route_builder = models.JSONField(default=dict, validators=[validate_content_section])
    quality = models.JSONField(default=dict, validators=[validate_content_section])
    employer_solutions = models.JSONField(default=dict, validators=[validate_content_section])
    academic_solutions = models.JSONField(default=dict, validators=[validate_content_section])
    outcomes = models.JSONField(default=dict, validators=[validate_content_section])
    engagement = models.JSONField(default=dict, validators=[validate_content_section])
    faq = models.JSONField(default=dict, validators=[validate_content_section])
    final_cta = models.JSONField(default=dict, validators=[validate_content_section])
    seo = models.JSONField(default=dict, validators=[validate_content_section])
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PUBLISHED)
    is_active = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="updated_service_content",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "service_content"
        verbose_name = "Service Content"
        verbose_name_plural = "Service Content"

    def __str__(self):
        return self.key
