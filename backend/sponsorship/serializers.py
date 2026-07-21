from rest_framework import serializers

from .models import SponsorshipContent


class SponsorshipContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SponsorshipContent
        fields = [
            "hero", "principles", "purpose", "routes_intro", "routes", "benefits",
            "partners_intro", "partner_types", "integrity_intro", "integrity_principles", "route_builder",
            "process", "impact", "faq", "final_cta", "seo", "updated_at",
        ]
        read_only_fields = fields
