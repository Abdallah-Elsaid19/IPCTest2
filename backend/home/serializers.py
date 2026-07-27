from rest_framework import serializers

from .models import HomeContent


class HomeContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeContent
        fields = [
            "hero", "decision_confidence", "principles", "why_ipc",
            "recognition_pathway", "discipline_system", "values", "audiences",
            "ecosystem", "events", "scholarships", "awards", "clubs",
            "publications", "partners", "sponsorship", "governance", "faq",
            "final_cta", "seo", "updated_at",
        ]
        read_only_fields = fields
