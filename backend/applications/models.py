from uuid import uuid4

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models.functions import Lower
from django.utils import timezone

from ipc_backend.validators import evidence_upload_to, validate_international_telephone, validate_upload


def generate_application_reference():
    return f"IPC-{uuid4().hex[:10].upper()}"


class FormDefinition(models.Model):
    code = models.CharField(max_length=32)
    name = models.CharField(max_length=160)
    version = models.PositiveSmallIntegerField(default=1)
    validation_schema = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["code", "-version"]
        constraints = [
            models.UniqueConstraint(fields=["code", "version"], name="uniq_form_code_version"),
        ]
        indexes = [
            models.Index(fields=["code", "is_active"], name="form_code_active_idx"),
        ]

    def __str__(self):
        return f"{self.name} v{self.version}"


class Application(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        UNDER_REVIEW = "under_review", "Under Review"
        MORE_INFO_REQUIRED = "more_info_required", "Additional Information Required"
        APPROVED = "approved", "Approved"
        REFUSED = "refused", "Refused"
        WITHDRAWN = "withdrawn", "Withdrawn"

    class ContactPreference(models.TextChoices):
        EMAIL = "email", "Email"
        PHONE = "phone", "Phone"
        EITHER = "either", "Either email or phone"

    application_reference = models.CharField(max_length=32, unique=True, default=generate_application_reference, editable=False)
    form_definition = models.ForeignKey(FormDefinition, on_delete=models.PROTECT, related_name="applications")
    form_version = models.PositiveSmallIntegerField(default=1, editable=False)
    membership_grade = models.ForeignKey(
        "memberships.MembershipGrade",
        on_delete=models.PROTECT,
        related_name="applications",
    )
    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="membership_applications",
    )
    current_step = models.PositiveSmallIntegerField(default=1)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.SUBMITTED)
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    username = models.CharField(max_length=30, blank=True)
    email = models.EmailField()
    phone = models.CharField(max_length=80, validators=[validate_international_telephone])
    country = models.CharField(max_length=120, blank=True)
    organisation = models.CharField(max_length=180, blank=True)
    contact_preference = models.CharField(
        max_length=16,
        choices=ContactPreference.choices,
        default=ContactPreference.EMAIL,
    )
    grade_specific_data = models.JSONField(default=dict, blank=True)
    code_of_conduct_consent = models.BooleanField(default=False)
    privacy_consent = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(default=timezone.now, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_applications",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    approved_user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="membership_application",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_membership_applications",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    account_created_at = models.DateTimeField(null=True, blank=True)
    welcome_email_sent_at = models.DateTimeField(null=True, blank=True)
    refusal_reason = models.TextField(blank=True)
    refused_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="refused_membership_applications",
    )
    refused_at = models.DateTimeField(null=True, blank=True)
    refusal_email_sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "applications_application"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "membership_grade", "created_at"], name="app_status_grade_created_idx"),
            models.Index(fields=["email"], name="app_email_idx"),
            models.Index(fields=["reviewed_by"], name="app_reviewer_idx"),
            models.Index(fields=["form_definition", "form_version"], name="app_form_version_idx"),
            models.Index(fields=["submitted_at"], name="app_submitted_idx"),
        ]
        constraints = [
            models.UniqueConstraint(
                Lower("username"),
                condition=~models.Q(username=""),
                name="uniq_application_username_ci",
            ),
        ]

    @property
    def application_id(self):
        """Compatibility alias for clients that previously received a duplicate ID column."""
        return self.pk

    @property
    def grade(self):
        """Compatibility alias for the former duplicated grade column."""
        return self.membership_grade.code

    def clean(self):
        errors = {}
        if self.pk:
            previous = type(self).objects.filter(pk=self.pk).values(
                "status",
                "approved_user_id",
                "refusal_reason",
            ).first()
            if previous:
                if previous["status"] in (self.Status.APPROVED, self.Status.REFUSED) and self.status != previous["status"]:
                    errors["status"] = "Completed applications are locked and their status cannot be changed."
                if previous["approved_user_id"] and previous["approved_user_id"] != self.approved_user_id:
                    errors["approved_user"] = "The approved user relationship cannot be changed."
                if previous["status"] == self.Status.REFUSED and previous["refusal_reason"] != self.refusal_reason:
                    errors["refusal_reason"] = "The refusal reason is locked and cannot be changed."
        if self.status == self.Status.REFUSED and not self.refusal_reason.strip():
            errors["refusal_reason"] = "A refusal reason is required."
        if not isinstance(self.grade_specific_data, dict):
            errors["grade_specific_data"] = "Grade-specific data must be a JSON object."
        if self.form_definition_id:
            if self.form_version != self.form_definition.version:
                errors["form_version"] = "The stored form version must match the selected form definition."
            if self.membership_grade_id and self.form_definition.code != self.membership_grade.code:
                errors["form_definition"] = "The form definition must match the membership grade."
        if errors:
            raise ValidationError(errors)

    def save(self, *args, **kwargs):
        if self.pk:
            previous = type(self).objects.filter(pk=self.pk).values(
                "status",
                "approved_user_id",
                "refusal_reason",
            ).first()
            if previous:
                errors = {}
                if previous["status"] in (self.Status.APPROVED, self.Status.REFUSED) and self.status != previous["status"]:
                    errors["status"] = "Completed applications are locked and their status cannot be changed."
                if previous["approved_user_id"] and previous["approved_user_id"] != self.approved_user_id:
                    errors["approved_user"] = "The approved user relationship cannot be changed."
                if previous["status"] == self.Status.REFUSED and previous["refusal_reason"] != self.refusal_reason:
                    errors["refusal_reason"] = "The refusal reason is locked and cannot be changed."
                if errors:
                    raise ValidationError(errors)
        if self.status == self.Status.REFUSED and not self.refusal_reason.strip():
            raise ValidationError({"refusal_reason": "A refusal reason is required."})
        if not self.application_reference:
            self.application_reference = generate_application_reference()
        if self.form_definition_id:
            self.form_version = self.form_definition.version
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.application_reference} - {self.first_name} {self.last_name} - {self.membership_grade.code}"


class ApplicationEvidence(models.Model):
    class EvidenceType(models.TextChoices):
        CV = "cv", "CV / role summary"
        CPD = "cpd", "CPD evidence"
        WORK = "work", "Work evidence"
        REFERENCES = "references", "References"
        OTHER = "other", "Other evidence"

    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="evidence_files")
    evidence_type = models.CharField(max_length=24, choices=EvidenceType.choices, default=EvidenceType.OTHER)
    file = models.FileField(upload_to=evidence_upload_to, validators=[validate_upload])
    original_name = models.CharField(max_length=255, blank=True)
    content_type = models.CharField(max_length=120, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="uploaded_application_evidence")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["application", "evidence_type"]),
            models.Index(fields=["uploaded_at"]),
        ]

    def save(self, *args, **kwargs):
        if self.file:
            if not self.original_name:
                self.original_name = self.file.name.rsplit("/", 1)[-1]
            self.file_size = getattr(self.file, "size", self.file_size or 0)
            self.content_type = getattr(self.file, "content_type", self.content_type or "")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.original_name or self.file.name


class ApplicationReference(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="references")
    name = models.CharField(max_length=160)
    email = models.EmailField(blank=True)
    organisation = models.CharField(max_length=180, blank=True)
    relationship = models.CharField(max_length=160, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]
        indexes = [models.Index(fields=["application"])]

    def __str__(self):
        return self.name


class ReviewerNote(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="reviewer_notes")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    note = models.TextField()
    is_internal = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["application", "created_at"])]


class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name="status_history")
    from_status = models.CharField(max_length=32, choices=Application.Status.choices, null=True, blank=True)
    to_status = models.CharField(max_length=32, choices=Application.Status.choices)
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["application", "created_at"]),
            models.Index(fields=["to_status", "created_at"]),
        ]

    def __str__(self):
        return f"{self.application_id}: {self.from_status or '-'} -> {self.to_status}"
