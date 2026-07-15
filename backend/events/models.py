from django.db import models
from django.db.models import Q


class Event(models.Model):
    class EventType(models.TextChoices):
        LONDON_MASTER_CLASS = "london_master_class", "London Master Class"
        REGIONAL_CLUB = "regional_club", "Regional Club"
        OTHER = "other", "Other"

    title = models.CharField(max_length=220)
    slug = models.SlugField(max_length=240, unique=True)
    event_type = models.CharField(max_length=40, choices=EventType.choices)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=220, blank=True)
    region = models.CharField(max_length=120, blank=True)
    venue_name = models.CharField(max_length=220, blank=True)
    starts_at = models.DateTimeField(null=True, blank=True)
    ends_at = models.DateTimeField(null=True, blank=True)
    capacity = models.PositiveIntegerField(null=True, blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    eventbrite_id = models.CharField(max_length=64, unique=True, null=True, blank=True)
    eventbrite_url = models.URLField(max_length=500, blank=True)
    status = models.CharField(max_length=32, blank=True)
    is_online_event = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=False)
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


class EventRegistration(models.Model):
    class EventType(models.TextChoices):
        LONDON_MASTER_CLASS = "London Master Class", "London Master Class"
        REGIONAL_CLUB = "Regional Club", "Regional Club"
        OTHER = "Other", "Other"

    class Status(models.TextChoices):
        REGISTERED = "registered", "Registered"
        WAITLISTED = "waitlisted", "Waitlisted"
        CANCELLED = "cancelled", "Cancelled"

    event = models.ForeignKey(Event, null=True, blank=True, on_delete=models.SET_NULL, related_name="registrations")
    created_at = models.DateTimeField(auto_now_add=True)
    event_name = models.CharField(max_length=220)
    event_type = models.CharField(max_length=40, choices=EventType.choices)
    name = models.CharField(max_length=160)
    email = models.EmailField()
    organisation = models.CharField(max_length=180, blank=True)
    dietary_access_needs = models.TextField(blank=True)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.REGISTERED)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["event", "email"], condition=Q(event__isnull=False), name="unique_event_registration_email"),
        ]
        indexes = [
            models.Index(fields=["event", "created_at"]),
            models.Index(fields=["email"]),
            models.Index(fields=["status"]),
        ]

    def save(self, *args, **kwargs):
        if self.event_id:
            self.event_name = self.event_name or self.event.title
            self.event_type = self.event_type or self.event.get_event_type_display()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.event_name}"

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
