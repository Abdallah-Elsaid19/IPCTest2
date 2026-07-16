from rest_framework import serializers
from ipc_backend.validators import clean_text
from .models import AwardCategory, AwardPageContent, AwardProgramme, AwardsInterest


class AwardPageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AwardPageContent
        fields = [
            "nomination_timeline",
            "impact_benefits",
            "integrity_principles",
            "updated_at",
        ]
        read_only_fields = fields


class AwardCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AwardCategory
        fields = [
            "id", "title", "slug", "description", "image_url", "icon_class",
            "highlights", "is_active", "sort_order",
        ]
        read_only_fields = fields


class AdminAwardCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AwardCategory
        fields = [
            "id", "title", "slug", "description", "image_url", "icon_class",
            "highlights", "is_active", "sort_order", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]
        extra_kwargs = {
            "title": {"required": True, "allow_blank": False},
            "description": {"required": True, "allow_blank": False},
            "image_url": {"required": True, "allow_blank": False},
            "icon_class": {"required": True, "allow_blank": False},
            "highlights": {"required": True},
            "is_active": {"required": True},
            "sort_order": {"required": True},
        }

    def validate_title(self, value):
        value = clean_text(value)
        if len(value) < 2:
            raise serializers.ValidationError("Title must be at least 2 characters.")
        return value

    def validate_description(self, value):
        value = clean_text(value)
        if len(value) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters.")
        return value

    def validate_icon_class(self, value):
        return clean_text(value)

    def validate_highlights(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Highlights must be a list.")
        cleaned = [clean_text(item) for item in value if isinstance(item, str) and item.strip()]
        if not cleaned:
            raise serializers.ValidationError("Add at least one highlight.")
        if len(cleaned) > 20:
            raise serializers.ValidationError("Add no more than 20 highlights.")
        return cleaned


class AwardProgrammeSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(read_only=True, slug_field="slug")
    category_title = serializers.CharField(source="category.title", read_only=True)

    class Meta:
        model = AwardProgramme
        fields = ["id", "title", "slug", "description", "criteria", "category", "category_title", "is_active"]
        read_only_fields = fields


class AdminAwardProgrammeSerializer(serializers.ModelSerializer):
    category = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=AwardCategory.objects.filter(is_active=True),
        required=True,
    )
    category_title = serializers.CharField(source="category.title", read_only=True)

    class Meta:
        model = AwardProgramme
        fields = [
            "id", "title", "slug", "description", "criteria", "category", "category_title",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "created_at", "updated_at"]
        extra_kwargs = {
            "title": {"required": True, "allow_blank": False},
            "description": {"required": True, "allow_blank": False},
            "criteria": {"required": True},
            "category": {"required": True},
            "is_active": {"required": True},
        }

    def validate_title(self, value):
        value = clean_text(value)
        if len(value) < 2:
            raise serializers.ValidationError("Title must be at least 2 characters.")
        return value

    def validate_description(self, value):
        value = clean_text(value)
        if len(value) < 10:
            raise serializers.ValidationError("Description must be at least 10 characters.")
        return value

    def validate_criteria(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Criteria must be a list.")
        cleaned = []
        for criterion in value:
            if not isinstance(criterion, str):
                raise serializers.ValidationError("Every criterion must be text.")
            criterion = clean_text(criterion)
            if criterion:
                cleaned.append(criterion)
        if len(cleaned) > 20:
            raise serializers.ValidationError("Add no more than 20 criteria.")
        if not cleaned:
            raise serializers.ValidationError("Add at least one criterion.")
        return cleaned


class AwardsInterestSerializer(serializers.ModelSerializer):
    programme = serializers.PrimaryKeyRelatedField(
        queryset=AwardProgramme.objects.filter(is_active=True),
        required=True,
    )

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
