from rest_framework import serializers

from .models import HomeContent


class HomeContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomeContent
        fields = [
            "hero", "principles", "discipline_system", "recognition_pathway",
            "intelligence_layer", "member_value", "organisational_value",
            "application_journey", "seo", "updated_at",
        ]
        read_only_fields = fields
