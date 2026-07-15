from rest_framework import serializers

from ipc_backend.validators import clean_text
from .models import ContactSubmission


class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = ["id", "created_at", "name", "email", "category", "message", "status"]
        read_only_fields = ["id", "created_at", "status"]

    def validate(self, attrs):
        for field in ("name", "category", "message"):
            if field in attrs:
                attrs[field] = clean_text(attrs[field])
        errors = {}
        if len(attrs.get("name", "")) < 2:
            errors["name"] = "Name must be at least 2 characters."
        if not attrs.get("category"):
            errors["category"] = "Enquiry category is required."
        if len(attrs.get("message", "")) < 10:
            errors["message"] = "Message must be at least 10 characters."
        if errors:
            raise serializers.ValidationError(errors)
        return attrs
