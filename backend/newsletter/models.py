from django.db import models


class NewsletterSignup(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=160, blank=True)
    consent = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    source = models.CharField(max_length=120, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_active", "created_at"]),
            models.Index(fields=["source"]),
        ]

    def __str__(self):
        return self.email


class ScholarshipAnnouncementReminder(models.Model):
    email = models.EmailField(unique=True)
    consent = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_email_sent_at = models.DateTimeField(null=True, blank=True, editable=False)
    email_send_count = models.PositiveIntegerField(default=0, editable=False)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_active", "created_at"], name="schrem_active_created_idx"),
            models.Index(fields=["last_email_sent_at"], name="schrem_last_sent_idx"),
        ]

    def __str__(self):
        return self.email
