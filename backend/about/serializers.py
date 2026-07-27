from rest_framework import serializers

from .models import AboutPageContent


class AboutPageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutPageContent
        fields = [
            "hero",
            "purpose",
            "why_intro",
            "vision",
            "mission_intro",
            "values_intro",
            "identity_intro",
            "discipline",
            "standards",
            "audiences_intro",
            "audiences",
            "professional_promise",
            "faq",
            "final_cta",
            "seo",
            "statistics",
            "why_exists",
            "vision_pillars",
            "missions",
            "core_values",
            "identity_symbols",
            "updated_at",
        ]
        read_only_fields = fields
