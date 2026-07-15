from rest_framework import serializers

from ipc_backend.validators import clean_text
from .models import NewsletterSignup


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
