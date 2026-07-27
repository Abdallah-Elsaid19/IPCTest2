from rest_framework import serializers

from .models import ServiceContent


class ServiceContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceContent
        fields = [
            "is_active",
            "hero",
            "impact_strip",
            "why_services",
            "principles",
            "portfolio",
            "audiences",
            "journey",
            "route_builder",
            "quality",
            "employer_solutions",
            "academic_solutions",
            "outcomes",
            "engagement",
            "faq",
            "final_cta",
            "seo",
            "updated_at",
        ]
        read_only_fields = fields
