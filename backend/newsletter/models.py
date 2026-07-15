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
