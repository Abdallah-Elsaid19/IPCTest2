from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.utils import timezone


def _validate_content_collection(value, required_fields, label):
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


def validate_event_cards(value):
    _validate_content_collection(value, ("icon", "title", "description"), "Card")


def validate_event_formats(value):
    _validate_content_collection(
        value,
        ("icon", "title", "description", "image"),
        "Format",
    )


def validate_featured_programme(value):
    if not isinstance(value, dict):
        raise ValidationError("Featured programme must be an object.")
    for field in ("eyebrow", "title", "description", "image_url", "image_alt"):
        field_value = value.get(field)
        if not isinstance(field_value, str) or not field_value.strip():
            raise ValidationError(f"Featured programme must include a non-empty {field}.")
    validate_event_cards(value.get("highlights"))


class Event(models.Model):
    class EventType(models.TextChoices):
        LONDON_MASTER_CLASS = "london_master_class", "London Master Class"
        REGIONAL_CLUB = "regional_club", "Regional Club"
        OTHER = "other", "Other"

    title = models.CharField(max_length=220)
    slug = models.SlugField(max_length=240, unique=True)
    event_type = models.CharField(max_length=40, choices=EventType.choices)
    description = models.TextField(blank=True)
    details_content = models.JSONField(default=dict, blank=True)
    location = models.CharField(max_length=220, blank=True)
    region = models.CharField(max_length=120, blank=True)
    venue_name = models.CharField(max_length=220, blank=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    image_thumbnail_url = models.URLField(max_length=500, blank=True)
    eventbrite_id = models.CharField(max_length=64, unique=True, null=True, blank=True)
    eventbrite_url = models.URLField(max_length=500, blank=True)
    status = models.CharField(max_length=32, blank=True)
    is_online_event = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
    is_hidden_on_site = models.BooleanField(default=False)
    registration_title = models.CharField(max_length=120, default="Event registration")
    registration_description = models.TextField(blank=True)
    registration_opens_at = models.DateTimeField(null=True, blank=True)
    registration_closes_at = models.DateTimeField(null=True, blank=True)
    max_tickets_per_registration = models.PositiveSmallIntegerField(default=4)
    timezone = models.CharField(max_length=64, default="Europe/London")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["starts_at", "title"]
        constraints = [
            models.CheckConstraint(
                check=Q(ends_at__isnull=True) | Q(starts_at__isnull=True) | Q(ends_at__gte=models.F("starts_at")),
                name="event_ends_at_gte_starts_at",
            ),
        ]
        indexes = [
            models.Index(fields=["event_type", "starts_at"]),
            models.Index(fields=["is_published", "starts_at"]),
            models.Index(fields=["slug"]),
            models.Index(fields=["eventbrite_id"]),
        ]

    def __str__(self):
        return self.title

    @property
    def has_ended(self):
        cutoff = self.ends_at or self.starts_at
        return bool(cutoff and cutoff <= timezone.now())

    @property
    def lifecycle_status(self):
        return "ended" if self.has_ended else self.status


class EventPageContent(models.Model):
    key = models.SlugField(max_length=40, unique=True, default="main")
    featured_programme = models.JSONField(validators=[validate_featured_programme])
    formats = models.JSONField(validators=[validate_event_formats])
    audiences = models.JSONField(validators=[validate_event_cards])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "events_content"
        verbose_name = "Events page content"
        verbose_name_plural = "Events page content"

    def __str__(self):
        return self.key


class EventbriteAttendeeSnapshot(models.Model):
    organization_id = models.CharField(max_length=128, unique=True)
    payload = models.JSONField(default=list)
    total_count = models.PositiveIntegerField(default=0)
    synced_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-synced_at"]

    def __str__(self):
        return f"Eventbrite attendees - {self.organization_id}"


class EventRegistration(models.Model):
    class EventType(models.TextChoices):
        LONDON_MASTER_CLASS = "London Master Class", "London Master Class"
        REGIONAL_CLUB = "Regional Club", "Regional Club"
        OTHER = "Other", "Other"

    class Status(models.TextChoices):
        REGISTERED = "registered", "Registered"
        CONFIRMED = "confirmed", "Confirmed"
        ATTENDED = "attended", "Attended"
        WAITLISTED = "waitlisted", "Waitlisted"
        CANCELLED = "cancelled", "Cancelled"

    class EmailStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"

    class PaymentStatus(models.TextChoices):
        NOT_REQUIRED = "not_required", "Not required"
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    event = models.ForeignKey(Event, null=True, blank=True, on_delete=models.SET_NULL, related_name="registrations")
    created_at = models.DateTimeField(auto_now_add=True)
    event_name = models.CharField(max_length=220)
    event_type = models.CharField(max_length=40, choices=EventType.choices)
    name = models.CharField(max_length=160)
    email = models.EmailField()
    organisation = models.CharField(max_length=180, blank=True)
    dietary_access_needs = models.TextField(blank=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.REGISTERED)
    reference = models.CharField(max_length=32, unique=True, null=True, blank=True)
    registered_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL,
        related_name="event_registrations",
    )
    contact_first_name = models.CharField(max_length=80, blank=True)
    contact_last_name = models.CharField(max_length=80, blank=True)
    contact_mobile = models.CharField(max_length=40, blank=True)
    company = models.CharField(max_length=180, blank=True)
    job_title = models.CharField(max_length=160, blank=True)
    city = models.CharField(max_length=120, blank=True)
    quantity = models.PositiveSmallIntegerField(default=1)
    ticket_name = models.CharField(max_length=120, default="Event registration")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default="GBP")
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.NOT_REQUIRED)
    payment_provider = models.CharField(max_length=40, blank=True)
    payment_reference = models.CharField(max_length=160, blank=True, db_index=True)
    marketing_consent = models.BooleanField(default=False)
    terms_accepted = models.BooleanField(default=False)
    idempotency_key = models.CharField(max_length=72, unique=True, null=True, blank=True)
    access_token = models.CharField(max_length=96, unique=True, null=True, blank=True)
    confirmation_email_status = models.CharField(
        max_length=16, choices=EmailStatus.choices, default=EmailStatus.PENDING,
    )
    confirmation_email_sent_at = models.DateTimeField(null=True, blank=True)
    confirmation_email_error = models.TextField(blank=True)
    account_invite_sent_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["event", "created_at"]),
            models.Index(fields=["email"]),
            models.Index(fields=["status"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["event", "registered_user"],
                condition=Q(
                    registered_user__isnull=False,
                    status__in=["registered", "confirmed", "attended", "waitlisted"],
                ),
                name="unique_active_user_event_booking",
            )
        ]

    def save(self, *args, **kwargs):
        if self.event_id:
            self.event_name = self.event_name or self.event.title
            self.event_type = self.event_type or self.event.get_event_type_display()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.event_name}"


class EventAttendee(models.Model):
    registration = models.ForeignKey(EventRegistration, on_delete=models.CASCADE, related_name="attendees")
    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    email = models.EmailField()
    mobile = models.CharField(max_length=40, blank=True)
    company = models.CharField(max_length=180, blank=True)
    job_title = models.CharField(max_length=160, blank=True)
    city = models.CharField(max_length=120, blank=True)
    dietary_access_needs = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()


class EventQuestion(models.Model):
    class QuestionType(models.TextChoices):
        SHORT_TEXT = "short_text", "Short text"
        LONG_TEXT = "long_text", "Long text"
        SELECT = "select", "Select"
        RADIO = "radio", "Radio"
        CHECKBOX = "checkbox", "Checkbox"
        YES_NO = "yes_no", "Yes / No"

    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="registration_questions")
    label = models.CharField(max_length=220)
    help_text = models.CharField(max_length=300, blank=True)
    question_type = models.CharField(max_length=24, choices=QuestionType.choices)
    options = models.JSONField(default=list, blank=True)
    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.label


class EventRegistrationAnswer(models.Model):
    registration = models.ForeignKey(EventRegistration, on_delete=models.CASCADE, related_name="answers")
    attendee = models.ForeignKey(EventAttendee, null=True, blank=True, on_delete=models.CASCADE, related_name="answers")
    question = models.ForeignKey(EventQuestion, on_delete=models.PROTECT, related_name="answers")
    value = models.JSONField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["registration", "attendee", "question"],
                name="unique_registration_attendee_question",
            ),
        ]

class EventbriteConnection(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    access_token = models.TextField()
    token_type = models.CharField(max_length=40, blank=True)
    scope = models.TextField(blank=True)
    organization_id = models.CharField(max_length=64, blank=True)
    organization_name = models.CharField(max_length=220, blank=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.organization_name or self.organization_id or "Eventbrite connection"
