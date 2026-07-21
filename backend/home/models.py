from django.conf import settings
from django.db import models

from ipc_backend.validators import validate_content_section


class HomeContent(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    key = models.SlugField(max_length=40, unique=True, default="main")
    hero = models.JSONField(default=dict, validators=[validate_content_section])
    principles = models.JSONField(default=dict, validators=[validate_content_section])
    discipline_system = models.JSONField(default=dict, validators=[validate_content_section])
    recognition_pathway = models.JSONField(default=dict, validators=[validate_content_section])
    intelligence_layer = models.JSONField(default=dict, validators=[validate_content_section])
    member_value = models.JSONField(default=dict, validators=[validate_content_section])
    organisational_value = models.JSONField(default=dict, validators=[validate_content_section])
    application_journey = models.JSONField(default=dict, validators=[validate_content_section])
    seo = models.JSONField(default=dict, validators=[validate_content_section])
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PUBLISHED)
    is_active = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="updated_home_content")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "home_content"
        verbose_name = "Home Content"
        verbose_name_plural = "Home Content"

    def __str__(self):
        return self.key
