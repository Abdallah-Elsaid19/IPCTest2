from rest_framework import serializers

from .models import FundContent


class FundContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundContent
        fields = [
            "is_active",
            "hero",
            "purpose",
            "programmes",
            "routes",
            "applicant_matcher",
            "impact",
            "research",
            "employer",
            "partners",
            "principles",
            "route_builder",
            "governance",
            "process",
            "assurance",
            "faq",
            "final_cta",
            "seo",
            "updated_at",
        ]
        read_only_fields = fields
