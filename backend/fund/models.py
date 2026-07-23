from django.conf import settings
from django.db import models

from ipc_backend.validators import validate_content_section


class FundContent(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    key = models.SlugField(max_length=40, unique=True, default="main")
    hero = models.JSONField(default=dict, validators=[validate_content_section])
    purpose = models.JSONField(default=dict, validators=[validate_content_section])
    programmes = models.JSONField(default=dict, validators=[validate_content_section])
    routes = models.JSONField(default=dict, validators=[validate_content_section])
    applicant_matcher = models.JSONField(default=dict, validators=[validate_content_section])
    impact = models.JSONField(default=dict, validators=[validate_content_section])
    research = models.JSONField(default=dict, validators=[validate_content_section])
    employer = models.JSONField(default=dict, validators=[validate_content_section])
    partners = models.JSONField(default=dict, validators=[validate_content_section])
    principles = models.JSONField(default=dict, validators=[validate_content_section])
    route_builder = models.JSONField(default=dict, validators=[validate_content_section])
    governance = models.JSONField(default=dict, validators=[validate_content_section])
    process = models.JSONField(default=dict, validators=[validate_content_section])
    assurance = models.JSONField(default=dict, validators=[validate_content_section])
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
        related_name="updated_fund_content",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "fund_content"
        verbose_name = "Fund Content"
        verbose_name_plural = "Fund Content"

    def __str__(self):
        return self.key

