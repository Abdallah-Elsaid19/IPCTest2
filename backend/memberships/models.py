from django.db import models
from django.db.models import Q
from django.utils import timezone


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
