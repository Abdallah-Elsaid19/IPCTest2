from django.conf import settings
from django.db import models


class ContactSubmission(models.Model):
    class Status(models.TextChoices):
        NEW = "new", "New"
        IN_PROGRESS = "in_progress", "In progress"
        CONTACTED = "contacted", "Contacted"
        HANDLED = "handled", "Handled"
        SPAM = "spam", "Spam"

    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=160)
    email = models.EmailField()
    category = models.CharField(max_length=120)
    message = models.TextField()
    handled = models.BooleanField(default=False)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.NEW)
    handled_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="handled_contact_submissions")
    handled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["category"]),
            models.Index(fields=["email"]),
        ]

    def __str__(self):
        return f"{self.name} - {self.category}"
