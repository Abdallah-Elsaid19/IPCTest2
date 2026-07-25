from django.conf import settings
from django.db import models
from django.utils import timezone
from ipc_backend.validators import profile_image_upload_to, validate_image, validate_uk_telephone


class AdminProfile(models.Model):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        USER = "user", "User"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="admin_profile")
    role = models.CharField(max_length=24, choices=Role.choices, default=Role.USER)
    telephone = models.CharField(max_length=16, validators=[validate_uk_telephone], blank=True)
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


class AdminNotification(models.Model):
    class NotificationType(models.TextChoices):
        CONTACT = "contact", "Contact"
        APPLICATION = "application", "Application"
        SUBSCRIBER = "subscriber", "Subscriber"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="admin_notifications",
    )
    notification_type = models.CharField(
        max_length=24,
        choices=NotificationType.choices,
        db_index=True,
    )
    title = models.CharField(max_length=180)
    message = models.TextField(max_length=1000)
    source_type = models.CharField(max_length=64, db_index=True)
    source_id = models.PositiveBigIntegerField()
    target_url = models.CharField(max_length=500)
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        indexes = [
            models.Index(
                fields=["recipient", "is_read", "created_at"],
                name="admin_notif_rec_read_idx",
            ),
            models.Index(
                fields=["recipient", "notification_type", "created_at"],
                name="admin_notif_rec_type_idx",
            ),
            models.Index(
                fields=["source_type", "source_id"],
                name="admin_notif_source_idx",
            ),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "recipient",
                    "notification_type",
                    "source_type",
                    "source_id",
                ],
                name="uniq_admin_notification_source_recipient",
            ),
        ]

    def mark_read(self):
        if self.is_read:
            return
        self.is_read = True
        self.read_at = timezone.now()
        self.save(update_fields=["is_read", "read_at", "updated_at"])

    def __str__(self):
        return f"{self.recipient.get_username()} - {self.title}"
