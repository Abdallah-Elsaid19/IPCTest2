from django.conf import settings
from django.core.mail import send_mail
from django.db import models
from django.http import Http404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.exceptions import NotFound
from rest_framework.generics import RetrieveAPIView
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from events.models import Event
from events.serializers import EventSerializer
from user_panel.models import Club, ClubMembership

from .models import ClubPageContent, ClubPagesContent
from .serializers import ClubEnquiryCreateSerializer, ClubPageContentSerializer


class ClubPageContentView(RetrieveAPIView):
    serializer_class = ClubPageContentSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        content = ClubPageContent.objects.filter(key="main", is_active=True, status=ClubPageContent.Status.PUBLISHED).first()
        if content is None:
            raise Http404("Club content is not available.")
        return content


class PublicClubDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        club = Club.objects.filter(slug=slug, is_active=True).first()
        content = ClubPageContent.objects.filter(
            key="main",
            is_active=True,
            status=ClubPageContent.Status.PUBLISHED,
        ).first()
        regional_club = next(
            (
                item for item in (content.regional_clubs if content else [])
                if str(item.get("id") or "").strip() == slug
            ),
            None,
        )
        pages_content = ClubPagesContent.objects.filter(key="main").first()
        if pages_content is not None and (
            not pages_content.is_active
            or pages_content.status != ClubPagesContent.Status.PUBLISHED
        ):
            raise NotFound("Club page is not available.")
        matching_page = next(
            (
                item for item in (pages_content.pages if pages_content else [])
                if isinstance(item, dict)
                and str(item.get("slug") or item.get("id") or "").strip() == slug
            ),
            None,
        )
        if matching_page is not None and matching_page.get("is_active", True) is False:
            raise NotFound("Club page is not available.")
        managed_page = matching_page
        if club is None and managed_page is None and regional_club is None:
            raise NotFound("Club not found.")

        membership = None
        if club is not None and request.user.is_authenticated:
            membership = club.memberships.filter(user=request.user).first()

        managed_page = managed_page or {}
        hero = managed_page.get("hero") if isinstance(managed_page.get("hero"), dict) else {}
        about = managed_page.get("about") if isinstance(managed_page.get("about"), dict) else {}
        regional_club = regional_club or {}
        location = str(
            managed_page.get("location")
            or (club.location if club else "")
            or regional_club.get("name")
            or ""
        ).strip()
        regional_events = Event.objects.filter(
            event_type=Event.EventType.REGIONAL_CLUB,
            is_published=True,
            is_hidden_on_site=False,
        ).filter(
            models.Q(region__icontains=location)
            | models.Q(location__icontains=location)
        ).order_by("starts_at")[:6]

        return Response({
            "public_id": club.public_id if club else slug,
            "name": str(
                managed_page.get("name")
                or hero.get("title")
                or (club.name if club else "")
                or f"{location} Club"
            ).strip(),
            "slug": club.slug if club else slug,
            "summary": str(
                hero.get("summary")
                or managed_page.get("summary")
                or (club.summary if club else "")
                or regional_club.get("description")
                or regional_club.get("label")
                or ""
            ).strip(),
            "description": str(
                about.get("description")
                or managed_page.get("description")
                or (club.description if club else "")
                or regional_club.get("detail")
                or regional_club.get("description")
                or ""
            ).strip(),
            "location": location,
            "specialism": str(
                about.get("specialism")
                or managed_page.get("specialism")
                or (club.specialism if club else "")
                or regional_club.get("focus")
                or regional_club.get("label")
                or ""
            ).strip(),
            "page_content": managed_page,
            "membership_status": membership.status if membership else "not_joined",
            "active_member_count": (
                club.memberships.filter(status=ClubMembership.State.ACTIVE).count()
                if club else 0
            ),
            "discussion_count": (
                club.categories.aggregate(total=models.Count("threads"))["total"] or 0
                if club else 0
            ),
            "upcoming_events": EventSerializer(regional_events, many=True).data,
        })


class ClubEnquiryCreateView(APIView):
    permission_classes = [permissions.AllowAny]
    parser_classes = [JSONParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "club_enquiries"

    def post(self, request):
        serializer = ClubEnquiryCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {
                    "success": False,
                    "code": "VALIDATION_ERROR",
                    "errors": serializer.errors,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        enquiry = serializer.save()
        submitted_at = timezone.localtime(enquiry.created_at).strftime("%d %B %Y at %H:%M %Z")
        send_mail(
            "New Clubs Enquiry",
            (
                f"Email: {enquiry.email}\n"
                f"Club: {enquiry.club_name or 'General'}\n"
                f"Message:\n{enquiry.message}\n\n"
                f"Submission date: {submitted_at}"
            ),
            settings.DEFAULT_FROM_EMAIL,
            [settings.IPC_REVIEW_EMAIL],
            fail_silently=True,
        )

        return Response(
            {
                "success": True,
                "data": {
                    "id": str(enquiry.id),
                    "message": "Your enquiry has been submitted successfully.",
                },
            },
            status=status.HTTP_201_CREATED,
        )
