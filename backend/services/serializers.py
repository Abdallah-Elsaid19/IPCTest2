from rest_framework import serializers

from .models import ServiceContent


class ServiceContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceContent
        fields = [
            "is_active",
            "hero",
            "principles",
            "portfolio",
            "audiences",
            "journey",
            "route_builder",
            "quality",
            "faq",
            "final_cta",
            "seo",
            "updated_at",
        ]
        read_only_fields = fields
