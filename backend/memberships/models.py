from django.db import models
from django.db.models import Q
from django.utils import timezone
from django.conf import settings
from ipc_backend.validators import validate_content_section


class MembershipContent(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    key = models.SlugField(max_length=40, unique=True, default="main")
    hero = models.JSONField(default=dict, validators=[validate_content_section])
    grades_intro = models.JSONField(default=dict, validators=[validate_content_section])
    comparison = models.JSONField(default=dict, validators=[validate_content_section])
    competence_matrix = models.JSONField(default=dict, validators=[validate_content_section])
    member_value = models.JSONField(default=dict, validators=[validate_content_section])
    professional_visibility = models.JSONField(default=dict, validators=[validate_content_section])
    application_journey = models.JSONField(default=dict, validators=[validate_content_section])
    organisational_membership = models.JSONField(default=dict, validators=[validate_content_section])
    questions = models.JSONField(default=dict, validators=[validate_content_section])
    grade_finder = models.JSONField(default=dict, validators=[validate_content_section])
    final_cta = models.JSONField(default=dict, validators=[validate_content_section])
    seo = models.JSONField(default=dict, validators=[validate_content_section])
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PUBLISHED)
    is_active = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="updated_membership_content")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "membership_content"
        verbose_name = "Membership page content"
        verbose_name_plural = "Membership page content"

    def __str__(self):
        return self.key


class MembershipGrade(models.Model):
    class Code(models.TextChoices):
        AFFIPC = "AffIPC", "Affiliate Member / AffIPC"
        MIPC = "MIPC", "Professional Member / MIPC"
        AFIPC_L3 = "AFIPC_L3", "Associate Fellow Level 3 / AFIPC L3"
        AFIPC_L4 = "AFIPC_L4", "Associate Fellow Level 4 / AFIPC L4"
        FIPC = "FIPC", "Fellow / FIPC"

    code = models.CharField(max_length=16, choices=Code.choices, unique=True)
    slug = models.SlugField(max_length=80, unique=True)
    title = models.CharField(max_length=160)
    short_title = models.CharField(max_length=80, blank=True)
    description = models.TextField(blank=True)
    image_url = models.CharField(max_length=255)
    post_nominal = models.CharField(max_length=32)
    pathway_title = models.CharField(max_length=255)
    pathway_description = models.TextField()
    evidence_requirements = models.TextField(blank=True)
    cpd_requirements = models.TextField(blank=True)
    professional_recognition = models.TextField(blank=True)
    application_pathway = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_order", "title"]
        indexes = [
            models.Index(fields=["code"]),
            models.Index(fields=["is_active", "display_order"]),
        ]
        constraints = [
            models.CheckConstraint(check=Q(display_order__gte=0), name="membership_grade_display_order_gte_0"),
        ]

    def __str__(self):
        return self.get_code_display()


class MembershipGradeBenefit(models.Model):
    grade = models.ForeignKey(MembershipGrade, on_delete=models.CASCADE, related_name="benefits")
    title = models.CharField(max_length=160)
    description = models.TextField()
    display_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["grade__display_order", "display_order", "title"]
        constraints = [
            models.UniqueConstraint(fields=["grade", "display_order"], name="unique_grade_benefit_order"),
            models.CheckConstraint(check=Q(display_order__gte=0), name="grade_benefit_display_order_gte_0"),
        ]
        indexes = [models.Index(fields=["grade", "display_order"])]

    def __str__(self):
        return f"{self.grade.code} - {self.title}"


class MembershipGradeRequirement(models.Model):
    class RequirementType(models.TextChoices):
        EVIDENCE = "evidence", "Evidence"
        CPD = "cpd", "CPD"
        WORK = "work", "Work evidence"
        REFERENCES = "references", "References"
        STATEMENT = "statement", "Professional statement"
        OTHER = "other", "Other"

    grade = models.ForeignKey(MembershipGrade, on_delete=models.CASCADE, related_name="requirements")
    requirement_type = models.CharField(max_length=24, choices=RequirementType.choices)
    title = models.CharField(max_length=160)
    description = models.TextField()
    is_required = models.BooleanField(default=True)
    display_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["grade__display_order", "display_order", "title"]
        constraints = [models.CheckConstraint(check=Q(display_order__gte=0), name="grade_requirement_display_order_gte_0")]
        indexes = [
            models.Index(fields=["grade", "requirement_type"]),
            models.Index(fields=["grade", "display_order"]),
        ]

    def __str__(self):
        return f"{self.grade.code} - {self.title}"
