from rest_framework import serializers

from .models import ScholarshipContent


class ScholarshipContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipContent
        fields = [
            "hero", "commitment", "fund", "principles", "audiences_intro", "audiences", "values_intro", "values",
            "eligibility", "recipient_commitment", "application_process",
            "partners", "academic_partners", "conditions", "impact",
            "faq", "final_cta", "seo", "updated_at",
        ]
        read_only_fields = fields
