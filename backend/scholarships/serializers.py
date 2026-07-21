from rest_framework import serializers

from .models import ScholarshipContent


class ScholarshipContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipContent
        fields = [
            "hero", "commitment", "principles", "audiences_intro", "audiences", "values_intro", "values",
            "eligibility", "application_process", "partners", "impact",
            "faq", "final_cta", "seo", "updated_at",
        ]
        read_only_fields = fields
