import uuid

from django.db import models


class ClubEnquiry(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        CONTACTED = "contacted", "Contacted"
        CLOSED = "closed", "Closed"
        SPAM = "spam", "Spam"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(max_length=254)
    message = models.TextField(max_length=2000)
    club_name = models.CharField(max_length=200, blank=True)
    club_slug = models.SlugField(max_length=200, blank=True)
    page_url = models.CharField(max_length=500, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["email"]),
            models.Index(fields=["club_slug"]),
        ]

    def __str__(self):
        club = self.club_name or "General clubs enquiry"
        return f"{self.email} - {club}"

