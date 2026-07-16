from rest_framework import serializers

from .models import AboutPageContent


class AboutPageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutPageContent
        fields = [
            "statistics",
            "why_exists",
            "vision_pillars",
            "missions",
            "core_values",
            "identity_symbols",
            "updated_at",
        ]
        read_only_fields = fields
