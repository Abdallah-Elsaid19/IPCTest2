from rest_framework import serializers

from ipc_backend.validators import clean_text
from .models import ClubEnquiry, ClubPageContent


class ClubPageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClubPageContent
        fields = ["regional_clubs", "activities", "audience_values", "updated_at"]
        read_only_fields = fields


class ClubEnquiryCreateSerializer(serializers.ModelSerializer):
    clubName = serializers.CharField(source="club_name", required=False, allow_blank=True, max_length=200)
    clubSlug = serializers.SlugField(source="club_slug", required=False, allow_blank=True, max_length=200)
    pageUrl = serializers.CharField(source="page_url", required=False, allow_blank=True, max_length=500)
    website = serializers.CharField(required=False, allow_blank=True, max_length=200, write_only=True)

    class Meta:
        model = ClubEnquiry
        fields = ["email", "message", "clubName", "clubSlug", "pageUrl", "website"]
        extra_kwargs = {
            "email": {"required": True, "allow_blank": False, "max_length": 254},
            "message": {"required": True, "allow_blank": False, "max_length": 2000},
        }

    def validate_email(self, value):
        return value.strip().lower()

    def validate_message(self, value):
        value = clean_text(value)
        if len(value) < 10:
            raise serializers.ValidationError("Please enter at least 10 characters.")
        return value

    def validate_clubName(self, value):
        return clean_text(value)

    def validate_pageUrl(self, value):
        value = clean_text(value)
        if value and (not value.startswith("/") or value.startswith("//")):
            raise serializers.ValidationError("Page URL must be a relative website path.")
        return value

    def validate(self, attrs):
        allowed_fields = set(self.fields)
        unknown_fields = set(self.initial_data) - allowed_fields
        if unknown_fields:
            raise serializers.ValidationError({field: ["This field may not be set."] for field in unknown_fields})
        if attrs.get("website"):
            raise serializers.ValidationError({"website": ["Invalid submission."]})
        return attrs

    def create(self, validated_data):
        validated_data.pop("website", None)
        return super().create(validated_data)
