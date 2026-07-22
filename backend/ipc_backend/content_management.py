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
from memberships.models import MembershipContent
from home.models import HomeContent
from django.utils import timezone


CONTENT_TABLES = {
    "home": {
        "label": "Home Content",
        "model": HomeContent,
        "fields": ("hero", "principles", "discipline_system", "recognition_pathway", "intelligence_layer", "member_value", "organisational_value", "application_journey", "seo"),
        "publishing": True,
    },
    "membership": {
        "label": "Membership Content",
        "model": MembershipContent,
        "fields": ("hero", "grades_intro", "comparison", "member_value", "professional_visibility", "application_journey", "organisational_membership", "questions", "grade_finder", "final_cta", "seo"),
        "publishing": True,
    },
    "about": {
        "label": "About",
        "model": AboutPageContent,
        "fields": ("statistics", "why_exists", "vision_pillars", "missions", "core_values", "identity_symbols"),
    },
    "awards": {
        "label": "Awards Content",
        "model": AwardPageContent,
        "fields": (
            "hero", "framework_intro", "featured_intro", "timeline_intro",
            "nomination_timeline", "benefits_intro", "impact_benefits",
            "beneficiaries_intro", "beneficiaries", "integrity_intro",
            "integrity_principles", "partnerships_intro", "partnerships",
            "faq", "interest_intro", "final_cta", "seo",
        ),
        "publishing": True,
    },
    "clubs": {
        "label": "Clubs Content",
        "model": ClubPageContent,
        "fields": (
            "hero", "principles", "purpose", "locations_intro", "regional_clubs",
            "programme_intro", "activities", "audiences_intro", "audience_values",
            "upcoming", "contribution", "partners", "faq", "final_cta", "seo",
        ),
        "publishing": True,
    },
    "events": {
        "label": "Events",
        "model": EventPageContent,
        "fields": ("featured_programme", "formats", "audiences"),
    },
    "scholarships": {
        "label": "Scholarship Content",
        "model": ScholarshipContent,
        "fields": ("hero", "commitment", "principles", "audiences_intro", "audiences", "values_intro", "values", "eligibility", "application_process", "partners", "impact", "faq", "final_cta", "seo"),
        "publishing": True,
    },
    "sponsorship": {
        "label": "Sponsorship Content",
        "model": SponsorshipContent,
        "fields": ("hero", "principles", "purpose", "routes_intro", "routes", "benefits", "integrity_intro", "integrity_principles", "route_builder", "process", "impact", "partners_intro", "partner_types", "faq", "final_cta", "seo"),
        "publishing": True,
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
    payload = {
        "slug": slug,
        "label": config["label"],
        "table_name": instance._meta.db_table,
        "is_active": instance.is_active,
        "updated_at": instance.updated_at,
        "sections": {field: add_active_defaults(getattr(instance, field)) for field in config["fields"]},
    }
    if config.get("publishing"):
        payload.update({
            "status": instance.status,
            "published_at": instance.published_at,
            "updated_by": instance.updated_by_id,
        })
    return payload


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
        if config.get("publishing"):
            allowed_payload_fields.add("status")
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
        if "status" in request.data:
            if request.data["status"] not in ("draft", "published"):
                return Response({"status": ["Status must be draft or published."]}, status=status.HTTP_400_BAD_REQUEST)
            instance.status = request.data["status"]
            if instance.status == "published" and instance.published_at is None:
                instance.published_at = timezone.now()
        if config.get("publishing"):
            instance.updated_by = request.user

        try:
            instance.full_clean()
        except ValidationError as error:
            return Response(error.message_dict, status=status.HTTP_400_BAD_REQUEST)
        instance.save()
        return Response(serialize_content(slug, config, instance))
