import hashlib
import secrets
import uuid

from django.db import models
from django.utils import timezone
from django.utils.crypto import constant_time_compare


def hash_access_token(token):
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


class ChatConversation(models.Model):
    class Status(models.TextChoices):
        OPEN = "open", "Open"
        CLOSED = "closed", "Closed"
        SPAM = "spam", "Spam"

    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    access_token_hash = models.CharField(max_length=64, editable=False)
    customer_name = models.CharField(max_length=160)
    customer_email = models.EmailField()
    source = models.CharField(max_length=80, default="general")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.OPEN)
    last_message_at = models.DateTimeField(default=timezone.now, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-last_message_at",)
        indexes = [
            models.Index(fields=("status", "last_message_at"), name="chat_conv_status_last_idx"),
            models.Index(fields=("customer_email",), name="chat_conv_email_idx"),
        ]

    def __str__(self):
        return f"{self.customer_name} ({self.public_id})"

    @classmethod
    def create_with_token(cls, **kwargs):
        token = secrets.token_urlsafe(32)
        conversation = cls.objects.create(access_token_hash=hash_access_token(token), **kwargs)
        return conversation, token

    def verify_access_token(self, token):
        if not token:
            return False
        return constant_time_compare(self.access_token_hash, hash_access_token(token))


class ChatMessage(models.Model):
    class SenderType(models.TextChoices):
        CUSTOMER = "customer", "Customer"
        STAFF = "staff", "Staff"

    conversation = models.ForeignKey(ChatConversation, related_name="messages", on_delete=models.CASCADE)
    sender_type = models.CharField(max_length=16, choices=SenderType.choices)
    message = models.TextField(max_length=4000)
    client_message_id = models.UUIDField(null=True, blank=True)
    provider_message_id = models.CharField(max_length=255, null=True, blank=True, unique=True)
    outbound_email_id = models.CharField(max_length=255, blank=True)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    email_error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("conversation", "client_message_id"),
                condition=models.Q(client_message_id__isnull=False),
                name="chat_unique_client_message",
            )
        ]
        indexes = [
            models.Index(fields=("conversation", "created_at"), name="chat_msg_conv_created_idx"),
        ]

    def __str__(self):
        return f"{self.get_sender_type_display()} message in {self.conversation.public_id}"

