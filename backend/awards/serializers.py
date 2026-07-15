from rest_framework import serializers
from ipc_backend.validators import clean_text
from .models import AwardProgramme, AwardsInterest


class AwardProgrammeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AwardProgramme
        fields = ["id", "title", "slug", "description", "category", "is_active"]


class AwardsInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AwardsInterest
        fields = ["id", "created_at", "programme", "name", "email", "interest_type", "message", "status"]
        read_only_fields = ["id", "created_at", "status"]

    def validate(self, attrs):
        for field in ["name", "message"]:
            if field in attrs:
                attrs[field] = clean_text(attrs[field])
        errors = {}
        if len(attrs.get("name", "")) < 2:
            errors["name"] = "Name must be at least 2 characters."
        if len(attrs.get("message", "")) < 10:
            errors["message"] = "Message must be at least 10 characters."
        if errors:
            raise serializers.ValidationError(errors)
        return attrs
