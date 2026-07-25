from rest_framework import serializers

from .models import EmployerContent, PartnershipContent, PublicationContent


class EmployerContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployerContent
        exclude = ("id", "key", "status", "published_at", "updated_by", "created_at")
        read_only_fields = [field.name for field in EmployerContent._meta.fields]


class PartnershipContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartnershipContent
        exclude = ("id", "key", "status", "published_at", "updated_by", "created_at")
        read_only_fields = [field.name for field in PartnershipContent._meta.fields]


class PublicationContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicationContent
        exclude = ("id", "key", "status", "published_at", "updated_by", "created_at")
        read_only_fields = [field.name for field in PublicationContent._meta.fields]
