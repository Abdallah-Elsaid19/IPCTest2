import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q

from ipc_backend.validators import validate_upload


class TimeStamped(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class UserProfile(TimeStamped):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="panel_profile")
    preferred_name = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=40, blank=True)
    country = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=120, blank=True)
    timezone = models.CharField(max_length=64, default="Europe/London")
    biography = models.TextField(max_length=3000, blank=True)
    job_title = models.CharField(max_length=160, blank=True)
    employer = models.CharField(max_length=180, blank=True)
    industry = models.CharField(max_length=120, blank=True)
    years_experience = models.PositiveSmallIntegerField(null=True, blank=True)
    professional_headline = models.CharField(max_length=180, blank=True)
    qualifications = models.TextField(max_length=3000, blank=True)
    certifications = models.TextField(max_length=3000, blank=True)
    linkedin_url = models.URLField(max_length=500, blank=True)
    website_url = models.URLField(max_length=500, blank=True)
    interests = models.ManyToManyField("ProfessionalInterest", blank=True, related_name="profiles")


class ProfessionalInterest(models.Model):
    slug = models.SlugField(max_length=80, unique=True)
    name = models.CharField(max_length=120, unique=True)
    display_order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["display_order", "name"]

    def __str__(self):
        return self.name


class UserPreference(TimeStamped):
    class Visibility(models.TextChoices):
        PRIVATE = "private", "Private"
        MEMBERS = "members", "IPC members"
        PUBLIC = "public", "Public"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="panel_preferences")
    profile_visibility = models.CharField(max_length=16, choices=Visibility.choices, default=Visibility.MEMBERS)
    email_notifications = models.BooleanField(default=True)
    club_communications = models.BooleanField(default=True)
    event_reminders = models.BooleanField(default=True)
    marketing_consent = models.BooleanField(default=False)


class Status(models.TextChoices):
    DRAFT = "draft", "Draft"
    SUBMITTED = "submitted", "Submitted"
    REVIEW = "under_review", "Under review"
    ACTION = "more_info_required", "Additional information required"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"
    WITHDRAWN = "withdrawn", "Withdrawn"


class Scholarship(TimeStamped):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    summary = models.TextField()
    description = models.TextField()
    category = models.CharField(max_length=120, db_index=True)
    eligibility = models.TextField()
    funding_min_percent = models.PositiveSmallIntegerField(null=True, blank=True)
    funding_max_percent = models.PositiveSmallIntegerField(null=True, blank=True)
    partner_name = models.CharField(max_length=180, blank=True)
    partner_url = models.URLField(max_length=500, blank=True)
    deadline = models.DateTimeField(null=True, blank=True)
    form_fields = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["deadline", "title"]
        indexes = [models.Index(fields=["is_active", "deadline"])]
        constraints = [
            models.CheckConstraint(condition=Q(funding_min_percent__isnull=True) | Q(funding_min_percent__lte=100), name="scholarship_min_lte_100"),
            models.CheckConstraint(condition=Q(funding_max_percent__isnull=True) | Q(funding_max_percent__lte=100), name="scholarship_max_lte_100"),
        ]

    def __str__(self):
        return self.title


class ScholarshipApplication(TimeStamped):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    scholarship = models.ForeignKey(Scholarship, on_delete=models.PROTECT, related_name="applications")
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="scholarship_applications")
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.DRAFT)
    current_step = models.PositiveSmallIntegerField(default=1)
    statement = models.TextField(max_length=6000, blank=True)
    responses = models.JSONField(default=dict, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [models.Index(fields=["applicant", "status"])]
        constraints = [models.UniqueConstraint(fields=["scholarship", "applicant"], condition=~Q(status=Status.WITHDRAWN), name="unique_active_scholarship_application")]


class AwardNomination(TimeStamped):
    class Nominee(models.TextChoices):
        SELF = "self", "Myself"
        OTHER = "other", "Another person"

    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    programme = models.ForeignKey("awards.AwardProgramme", on_delete=models.PROTECT, related_name="nominations")
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="award_nominations")
    nominee_type = models.CharField(max_length=12, choices=Nominee.choices)
    nominee_name = models.CharField(max_length=180)
    nominee_email = models.EmailField(blank=True)
    statement = models.TextField(max_length=6000, blank=True)
    responses = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.DRAFT)
    submitted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [models.Index(fields=["applicant", "status"])]


class AwardNominationDocument(TimeStamped):
    nomination = models.ForeignKey(
        AwardNomination, on_delete=models.CASCADE, related_name="documents",
    )
    file = models.FileField(
        upload_to="user-panel/award-evidence/%Y/%m/",
        validators=[validate_upload],
    )
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=120, blank=True)
    file_size = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if self.file:
            if not self.original_name:
                self.original_name = self.file.name.rsplit("/", 1)[-1]
            self.file_size = getattr(self.file, "size", self.file_size or 0)
            self.content_type = getattr(
                self.file, "content_type", self.content_type or "",
            )
        super().save(*args, **kwargs)


class Club(TimeStamped):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    name = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    summary = models.TextField()
    description = models.TextField()
    location = models.CharField(max_length=160, db_index=True)
    specialism = models.CharField(max_length=160, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class ClubMembership(TimeStamped):
    class State(models.TextChoices):
        PENDING = "pending", "Pending"
        ACTIVE = "active", "Active"
        REJECTED = "rejected", "Rejected"
        SUSPENDED = "suspended", "Suspended"
        LEFT = "left", "Left"

    class Role(models.TextChoices):
        MEMBER = "member", "Member"
        MODERATOR = "moderator", "Moderator"

    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="club_memberships")
    status = models.CharField(max_length=16, choices=State.choices, default=State.PENDING)
    role = models.CharField(max_length=16, choices=Role.choices, default=Role.MEMBER)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["club", "user"], name="unique_club_member")]
        indexes = [models.Index(fields=["user", "status"]), models.Index(fields=["club", "status"])]


class DiscussionCategory(models.Model):
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["club", "slug"], name="unique_club_category")]


class DiscussionThread(TimeStamped):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    category = models.ForeignKey(DiscussionCategory, on_delete=models.PROTECT, related_name="threads")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="discussion_threads")
    title = models.CharField(max_length=220)
    body = models.TextField(max_length=10000)
    is_pinned = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False)

    class Meta:
        ordering = ["-is_pinned", "-updated_at"]


class DiscussionPost(TimeStamped):
    thread = models.ForeignKey(DiscussionThread, on_delete=models.CASCADE, related_name="posts")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="discussion_posts")
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="replies")
    body = models.TextField(max_length=10000)
    is_edited = models.BooleanField(default=False)

    def clean(self):
        if self.parent_id and self.parent.thread_id != self.thread_id:
            raise ValidationError({"parent": "Reply must belong to this thread."})


class ClubMessage(TimeStamped):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    club = models.ForeignKey(Club, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="club_messages")
    body = models.TextField(max_length=4000)
    is_edited = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["club", "created_at"])]


class UserDocument(TimeStamped):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="panel_documents")
    title = models.CharField(max_length=180)
    category = models.CharField(max_length=32, db_index=True)
    file = models.FileField(upload_to="user-panel/documents/%Y/%m/", validators=[validate_upload])
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=120, blank=True)
    file_size = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(null=True, blank=True)
    can_delete = models.BooleanField(default=False)


class UserNotification(TimeStamped):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="panel_notifications")
    notification_type = models.CharField(max_length=32)
    title = models.CharField(max_length=180)
    message = models.TextField(max_length=2000)
    target_url = models.CharField(max_length=500, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["recipient", "is_read", "created_at"])]


class Programme(TimeStamped):
    title = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    summary = models.TextField()
    provider = models.CharField(max_length=180)
    external_url = models.URLField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)


class ProgrammeEnquiry(TimeStamped):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    programme = models.ForeignKey(Programme, on_delete=models.PROTECT, related_name="enquiries")
    applicant = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="programme_enquiries")
    message = models.TextField(max_length=5000)
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.SUBMITTED)


class SupportTicket(TimeStamped):
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="support_tickets")
    category = models.CharField(max_length=32)
    subject = models.CharField(max_length=180)
    status = models.CharField(max_length=32, default="open")
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]
        indexes = [models.Index(fields=["requester", "status"])]


class SupportMessage(TimeStamped):
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="messages")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    body = models.TextField(max_length=8000)
    attachment = models.FileField(upload_to="user-panel/support/%Y/%m/", validators=[validate_upload], blank=True)
    is_staff_reply = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
