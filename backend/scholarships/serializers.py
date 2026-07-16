from rest_framework import serializers

from .models import ScholarshipContent


class ScholarshipContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipContent
        fields = ["audiences", "values", "updated_at"]
        read_only_fields = fields

