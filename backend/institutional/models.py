from django.conf import settings
from django.db import models

from ipc_backend.validators import validate_content_section


class ManagedInstitutionalContent(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    key = models.SlugField(max_length=40, unique=True, default="main")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PUBLISHED)
    is_active = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class EmployerContent(ManagedInstitutionalContent):
    hero = models.JSONField(default=dict, validators=[validate_content_section])
    value_intro = models.JSONField(default=dict, validators=[validate_content_section])
    values = models.JSONField(default=dict, validators=[validate_content_section])
    pathways_intro = models.JSONField(default=dict, validators=[validate_content_section])
    pathways = models.JSONField(default=dict, validators=[validate_content_section])
    capability_model = models.JSONField(default=dict, validators=[validate_content_section])
    evidence = models.JSONField(default=dict, validators=[validate_content_section])
    impact = models.JSONField(default=dict, validators=[validate_content_section])
    faq = models.JSONField(default=dict, validators=[validate_content_section])
    final_cta = models.JSONField(default=dict, validators=[validate_content_section])
    seo = models.JSONField(default=dict, validators=[validate_content_section])

    class Meta:
        db_table = "employer_content"
        verbose_name = "Employer Content"
        verbose_name_plural = "Employer Content"


class PartnershipContent(ManagedInstitutionalContent):
    hero = models.JSONField(default=dict, validators=[validate_content_section])
    partner_types = models.JSONField(default=dict, validators=[validate_content_section])
    value = models.JSONField(default=dict, validators=[validate_content_section])
    comparison = models.JSONField(default=dict, validators=[validate_content_section])
    integrity = models.JSONField(default=dict, validators=[validate_content_section])
    process = models.JSONField(default=dict, validators=[validate_content_section])
    faq = models.JSONField(default=dict, validators=[validate_content_section])
    final_cta = models.JSONField(default=dict, validators=[validate_content_section])
    seo = models.JSONField(default=dict, validators=[validate_content_section])

    class Meta:
        db_table = "partnership_content"
        verbose_name = "Partnership Content"
        verbose_name_plural = "Partnership Content"


class PublicationContent(ManagedInstitutionalContent):
    hero = models.JSONField(default=dict, validators=[validate_content_section])
    why_publish = models.JSONField(default=dict, validators=[validate_content_section])
    routes = models.JSONField(default=dict, validators=[validate_content_section])
    value = models.JSONField(default=dict, validators=[validate_content_section])
    themes = models.JSONField(default=dict, validators=[validate_content_section])
    formats = models.JSONField(default=dict, validators=[validate_content_section])
    audiences = models.JSONField(default=dict, validators=[validate_content_section])
    principles = models.JSONField(default=dict, validators=[validate_content_section])
    integrity = models.JSONField(default=dict, validators=[validate_content_section])
    process = models.JSONField(default=dict, validators=[validate_content_section])
    contributor_value = models.JSONField(default=dict, validators=[validate_content_section])
    partner_value = models.JSONField(default=dict, validators=[validate_content_section])
    sponsorship = models.JSONField(default=dict, validators=[validate_content_section])
    faq = models.JSONField(default=dict, validators=[validate_content_section])
    final_cta = models.JSONField(default=dict, validators=[validate_content_section])
    seo = models.JSONField(default=dict, validators=[validate_content_section])

    class Meta:
        db_table = "publication_content"
        verbose_name = "Publication Content"
        verbose_name_plural = "Publication Content"
