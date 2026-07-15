from django.conf import settings
from django.db import models


class AdminProfile(models.Model):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        REVIEWER = "reviewer", "Reviewer"
        STAFF = "staff", "Staff"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="admin_profile")
    role = models.CharField(max_length=24, choices=Role.choices, default=Role.STAFF)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["role"])]

    def __str__(self):
        return f"{self.user.get_username()} - {self.get_role_display()}"
