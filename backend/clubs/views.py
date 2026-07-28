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

from .models import ClubPageContent
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
        managed_club = None
        if club is None:
            content = ClubPageContent.objects.filter(
                key="main",
                is_active=True,
                status=ClubPageContent.Status.PUBLISHED,
            ).first()
            managed_club = next(
                (
                    item for item in (content.regional_clubs if content else [])
                    if str(item.get("id") or "").strip() == slug
                ),
                None,
            )
            if managed_club is None:
                raise NotFound("Club not found.")

        membership = None
        if club is not None and request.user.is_authenticated:
            membership = club.memberships.filter(user=request.user).first()

        location = club.location if club else str(managed_club.get("name") or "").strip()
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
            "name": club.name if club else f"{location} Club",
            "slug": club.slug if club else slug,
            "summary": club.summary if club else str(
                managed_club.get("description")
                or managed_club.get("label")
                or ""
            ),
            "description": club.description if club else str(
                managed_club.get("detail")
                or managed_club.get("description")
                or ""
            ),
            "location": location,
            "specialism": club.specialism if club else str(
                managed_club.get("focus")
                or managed_club.get("label")
                or ""
            ),
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
