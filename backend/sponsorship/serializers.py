from rest_framework import serializers

from .models import SponsorshipContent


class SponsorshipContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = SponsorshipContent
        fields = ["routes", "partner_types", "integrity_principles", "updated_at"]
        read_only_fields = fields

