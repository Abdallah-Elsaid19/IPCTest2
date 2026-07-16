from django.core.exceptions import ValidationError
from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from about.models import AboutPageContent
from awards.models import AwardPageContent
from clubs.models import ClubPageContent
from events.models import EventPageContent
from scholarships.models import ScholarshipContent
from sponsorship.models import SponsorshipContent


CONTENT_TABLES = {
    "about": {
        "label": "About",
        "model": AboutPageContent,
        "fields": ("statistics", "why_exists", "vision_pillars", "missions", "core_values", "identity_symbols"),
    },
    "awards": {
        "label": "Awards",
        "model": AwardPageContent,
        "fields": ("nomination_timeline", "impact_benefits", "integrity_principles"),
    },
    "clubs": {
        "label": "Clubs",
        "model": ClubPageContent,
        "fields": ("regional_clubs", "activities", "audience_values"),
    },
    "events": {
        "label": "Events",
        "model": EventPageContent,
        "fields": ("featured_programme", "formats", "audiences"),
    },
    "scholarships": {
        "label": "Scholarships",
        "model": ScholarshipContent,
        "fields": ("audiences", "values"),
    },
    "sponsorship": {
        "label": "Sponsorship",
        "model": SponsorshipContent,
        "fields": ("routes", "partner_types", "integrity_principles"),
    },
}


def add_active_defaults(value):
    if isinstance(value, list):
        return [add_active_defaults(item) for item in value]
    if isinstance(value, dict):
        normalized = {key: add_active_defaults(item) for key, item in value.items()}
        normalized.setdefault("is_active", True)
        return normalized
    return value


def serialize_content(slug, config, instance):
    return {
        "slug": slug,
        "label": config["label"],
        "table_name": instance._meta.db_table,
        "is_active": instance.is_active,
        "updated_at": instance.updated_at,
        "sections": {field: add_active_defaults(getattr(instance, field)) for field in config["fields"]},
    }


class AdminContentListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        results = []
        for slug, config in CONTENT_TABLES.items():
            instance = config["model"].objects.filter(key="main").first()
            if instance is not None:
                results.append(serialize_content(slug, config, instance))
        return Response(results)


class AdminContentDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @transaction.atomic
    def patch(self, request, slug):
        config = CONTENT_TABLES.get(slug)
        if config is None:
            return Response({"detail": "Content table was not found."}, status=status.HTTP_404_NOT_FOUND)

        instance = config["model"].objects.filter(key="main").first()
        if instance is None:
            return Response({"detail": "Content row was not found."}, status=status.HTTP_404_NOT_FOUND)

        allowed_payload_fields = {"sections", "is_active"}
        unknown_payload_fields = set(request.data) - allowed_payload_fields
        if unknown_payload_fields:
            return Response(
                {field: ["This field may not be set."] for field in unknown_payload_fields},
                status=status.HTTP_400_BAD_REQUEST,
            )

        sections = request.data.get("sections", {})
        if not isinstance(sections, dict):
            return Response({"sections": ["This field must be an object."]}, status=status.HTTP_400_BAD_REQUEST)
        unknown_sections = set(sections) - set(config["fields"])
        if unknown_sections:
            return Response(
                {"sections": {field: ["This content section may not be set."] for field in unknown_sections}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        for field, value in sections.items():
            setattr(instance, field, value)
        if "is_active" in request.data:
            if not isinstance(request.data["is_active"], bool):
                return Response({"is_active": ["This field must be true or false."]}, status=status.HTTP_400_BAD_REQUEST)
            instance.is_active = request.data["is_active"]

        try:
            instance.full_clean()
        except ValidationError as error:
            return Response(error.message_dict, status=status.HTTP_400_BAD_REQUEST)
        instance.save()
        return Response(serialize_content(slug, config, instance))
