from rest_framework import serializers

from ipc_backend.validators import clean_text
from .models import NewsletterSignup, ScholarshipAnnouncementReminder


class NewsletterSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSignup
        fields = ["id", "created_at", "email", "name", "consent", "source"]
        read_only_fields = ["id", "created_at"]

    def validate_name(self, value):
        return clean_text(value)

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError("Consent is required.")
        return value

    def create(self, validated_data):
        signup, _ = NewsletterSignup.objects.update_or_create(
            email=validated_data["email"],
            defaults={**validated_data, "is_active": True},
        )
        return signup


class ScholarshipAnnouncementReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipAnnouncementReminder
        fields = ["id", "email", "consent", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {"email": {"validators": []}}

    def validate_email(self, value):
        return value.strip().lower()

    def validate_consent(self, value):
        if not value:
            raise serializers.ValidationError("Consent is required.")
        return value

    def create(self, validated_data):
        reminder, _ = ScholarshipAnnouncementReminder.objects.update_or_create(
            email=validated_data["email"],
            defaults={**validated_data, "is_active": True},
        )
        return reminder


class AdminScholarshipAnnouncementReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipAnnouncementReminder
        fields = [
            "id",
            "email",
            "consent",
            "is_active",
            "created_at",
            "updated_at",
            "last_email_sent_at",
            "email_send_count",
        ]
        read_only_fields = fields
