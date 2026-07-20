from django.conf import settings
from django.db import models
from ipc_backend.validators import profile_image_upload_to, validate_image


class AdminProfile(models.Model):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        USER = "user", "User"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="admin_profile")
    role = models.CharField(max_length=24, choices=Role.choices, default=Role.USER)
    profile_image = models.ImageField(
        upload_to=profile_image_upload_to,
        validators=[validate_image],
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["role"])]

    def __str__(self):
        return f"{self.user.get_username()} - {self.get_role_display()}"


class ApiIdempotencyRecord(models.Model):
    class ProcessingStatus(models.TextChoices):
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"

    key = models.CharField(max_length=72, unique=True)
    method = models.CharField(max_length=8)
    path = models.CharField(max_length=255)
    fingerprint = models.CharField(max_length=128)
    user_identifier = models.CharField(max_length=64, blank=True)
    processing_status = models.CharField(
        max_length=16,
        choices=ProcessingStatus.choices,
        default=ProcessingStatus.PROCESSING,
    )
    response_status = models.PositiveSmallIntegerField(null=True, blank=True)
    response_body = models.BinaryField(default=bytes, blank=True)
    response_content_type = models.CharField(max_length=120, default="application/json")
    expires_at = models.DateTimeField(db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.method} {self.path} - {self.processing_status}"
