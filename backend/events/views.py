import secrets
from datetime import timezone as dt_timezone
from secrets import token_urlsafe

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect
from django.urls import reverse
from django.utils import timezone
from rest_framework import filters, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .eventbrite import EventbriteError, exchange_code_for_token, get_authorization_url, save_connection
from .models import Event, EventRegistration
from .serializers import (
    AdminEventRegistrationSerializer, AdminEventSerializer, AdminEventVisibilitySerializer,
    EventRegistrationConfigSerializer, EventRegistrationCreateSerializer,
    EventRegistrationDetailSerializer, EventRegistrationSerializer, EventSerializer,
)
from .services.registration import create_registration
from .services.registration_email import registration_urls, send_registration_confirmation
from .services.eventbrite import EventbriteClient, get_configured_client
from .services.sync_eventbrite import sync_eventbrite_events


class EventViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Event.objects.filter(
        is_published=True,
        is_hidden_on_site=False,
    ).exclude(status__in=["canceled", "cancelled", "deleted"]).order_by("starts_at", "title")
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]


class AdminEventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all().order_by("-starts_at", "title")
    serializer_class = AdminEventSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "location", "region", "venue_name"]
    ordering_fields = ["title", "starts_at", "created_at", "updated_at", "status"]
    throttle_scope = None

    def get_queryset(self):
        queryset = super().get_queryset()
        event_type = self.request.query_params.get("event_type")
        published = self.request.query_params.get("published")
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        if published in ("true", "false"):
            queryset = queryset.filter(is_published=published == "true")
        return queryset

    @staticmethod
    def _clear_dashboard_cache():
        cache.delete("ipc:admin-dashboard:v2")

    def perform_create(self, serializer):
        serializer.save(eventbrite_id=None)
        self._clear_dashboard_cache()

    def perform_update(self, serializer):
        serializer.save()
        self._clear_dashboard_cache()

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        self._clear_dashboard_cache()

    @staticmethod
    def _eventbrite_read_only_response():
        return Response(
            {
                "detail": (
                    "Events imported from Eventbrite are read-only in IPC. "
                    "Update this event in Eventbrite and run the sync instead."
                )
            },
            status=status.HTTP_409_CONFLICT,
        )

    def update(self, request, *args, **kwargs):
        if self.get_object().eventbrite_id:
            return self._eventbrite_read_only_response()
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if self.get_object().eventbrite_id:
            return self._eventbrite_read_only_response()
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if self.get_object().eventbrite_id:
            return self._eventbrite_read_only_response()
        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=["patch"], url_path="visibility")
    def visibility(self, request, pk=None):
        validator = AdminEventVisibilitySerializer(data=request.data)
        validator.is_valid(raise_exception=True)
        event = self.get_object()
        event.is_hidden_on_site = validator.validated_data["hidden"]
        event.save(update_fields=["is_hidden_on_site", "updated_at"])
        self._clear_dashboard_cache()
        return Response(self.get_serializer(event).data)


class EventRegistrationViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = EventRegistration.objects.select_related("event")
    serializer_class = EventRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        registration = serializer.save()
        send_mail(
            "IPC event registration confirmed",
            f"Your interest in {registration.event_name} has been received.",
            settings.DEFAULT_FROM_EMAIL,
            [registration.email, settings.IPC_REVIEW_EMAIL],
            fail_silently=True,
        )


class EventRegistrationConfigView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, slug):
        event = get_object_or_404(
            Event.objects.prefetch_related("registration_questions"),
            slug=slug,
            is_published=True,
            is_hidden_on_site=False,
        )
        return Response(EventRegistrationConfigSerializer(event).data)


class EventRegistrationCreateView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "event_registration"

    def post(self, request, slug):
        serializer = EventRegistrationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        idempotency_key = (request.headers.get("Idempotency-Key") or "").strip()
        if len(idempotency_key) < 16 or len(idempotency_key) > 72:
            return Response(
                {"idempotency_key": "A valid Idempotency-Key header is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            registration, created = create_registration(
                event_slug=slug,
                data=serializer.validated_data,
                user=request.user,
                idempotency_key=idempotency_key,
            )
        except Event.DoesNotExist:
            return Response({"detail": "Event not found."}, status=status.HTTP_404_NOT_FOUND)
        registration.refresh_from_db()
        payload = EventRegistrationDetailSerializer(registration).data
        payload.update(registration_urls(registration))
        payload["access_token"] = registration.access_token
        payload["created"] = created
        return Response(payload, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


def _can_view_registration(request, registration):
    if request.user.is_authenticated and (
        request.user.is_staff or registration.registered_user_id == request.user.id
    ):
        return True
    supplied = request.query_params.get("token", "")
    return bool(supplied and secrets.compare_digest(supplied, registration.access_token or ""))


class EventRegistrationDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, reference):
        registration = get_object_or_404(
            EventRegistration.objects.select_related("event").prefetch_related("attendees"),
            reference=reference,
        )
        if not _can_view_registration(request, registration):
            return Response({"detail": "Registration not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(EventRegistrationDetailSerializer(registration).data)


def _ics_escape(value):
    return str(value or "").replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")


class EventRegistrationCalendarView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, reference):
        registration = get_object_or_404(EventRegistration.objects.select_related("event"), reference=reference)
        if not _can_view_registration(request, registration):
            return Response({"detail": "Registration not found."}, status=status.HTTP_404_NOT_FOUND)
        event = registration.event
        if not event or not event.starts_at:
            return Response({"detail": "Calendar data is unavailable."}, status=status.HTTP_409_CONFLICT)
        start = event.starts_at.astimezone(dt_timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        end_value = event.ends_at or event.starts_at
        end = end_value.astimezone(dt_timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        location = "Online event" if event.is_online_event else (event.venue_name or event.location)
        content = "\r\n".join([
            "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//IPC//Event Registration//EN",
            "BEGIN:VEVENT", f"UID:{registration.reference}@ipc.invalid",
            f"DTSTAMP:{timezone.now().astimezone(dt_timezone.utc):%Y%m%dT%H%M%SZ}",
            f"DTSTART:{start}", f"DTEND:{end}", f"SUMMARY:{_ics_escape(event.title)}",
            f"DESCRIPTION:{_ics_escape(event.description)}", f"LOCATION:{_ics_escape(location)}",
            "END:VEVENT", "END:VCALENDAR", "",
        ])
        response = HttpResponse(content, content_type="text/calendar; charset=utf-8")
        response["Content-Disposition"] = f'attachment; filename="{registration.reference}.ics"'
        return response


class AdminEventRegistrationViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = EventRegistration.objects.select_related("event").prefetch_related("attendees").order_by("-created_at")
    serializer_class = AdminEventRegistrationSerializer
    permission_classes = [permissions.IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["reference", "event_name", "email", "name", "company"]
    ordering_fields = ["created_at", "event_name", "status", "quantity"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if event_id := self.request.query_params.get("event"):
            queryset = queryset.filter(event_id=event_id)
        if registration_status := self.request.query_params.get("status"):
            queryset = queryset.filter(status=registration_status)
        if email_status := self.request.query_params.get("email_status"):
            queryset = queryset.filter(confirmation_email_status=email_status)
        return queryset

    @action(detail=True, methods=["post"], url_path="resend-confirmation")
    def resend_confirmation(self, request, pk=None):
        registration = self.get_object()
        sent = send_registration_confirmation(registration.pk)
        registration.refresh_from_db()
        return Response({
            "sent": sent,
            "confirmation_email_status": registration.confirmation_email_status,
        }, status=status.HTTP_200_OK if sent else status.HTTP_502_BAD_GATEWAY)


class EventbriteAuthorizeView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if not request.user.is_authenticated or not request.user.is_staff:
            login_url = reverse("admin:login")
            return redirect(f"{login_url}?next={request.get_full_path()}")

        state = token_urlsafe(24)
        request.session["eventbrite_oauth_state"] = state
        return redirect(get_authorization_url(state))


class EventbriteCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        error = request.query_params.get("error")
        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        state = request.query_params.get("state")
        expected_state = request.session.get("eventbrite_oauth_state")
        if not expected_state or state != expected_state:
            return Response({"error": "Invalid OAuth state."}, status=status.HTTP_400_BAD_REQUEST)

        code = request.query_params.get("code")
        if not code:
            return Response({"error": "Missing Eventbrite authorization code."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token_data = exchange_code_for_token(code)
            connection = save_connection(token_data)
            synced = sync_eventbrite_events(
                client=EventbriteClient(connection.access_token),
                organization_id=connection.organization_id,
            )
        except EventbriteError as exc:
            return Response({"error": str(exc)}, status=exc.status_code)

        request.session.pop("eventbrite_oauth_state", None)
        return Response({"detail": "Eventbrite connected successfully.", "organization": connection.organization_name, "sync": synced})


def _eventbrite_event_payload(event):
    venue = event.get("venue") or {}
    availability = event.get("ticket_availability") or {}
    return {
        "eventbrite_id": event.get("id"),
        "title": (event.get("name") or {}).get("text") or "Untitled Event",
        "description": (event.get("description") or {}).get("text") or "",
        "start_time": (event.get("start") or {}).get("utc"),
        "end_time": (event.get("end") or {}).get("utc"),
        "url": event.get("url") or "",
        "image_url": (event.get("logo") or {}).get("url") or "",
        "status": event.get("status") or "",
        "venue_id": venue.get("id"),
        "venue_name": venue.get("name"),
        "capacity": event.get("capacity") or availability.get("maximum_ticket_quantity"),
        "is_online_event": bool(event.get("online_event")),
    }


class EventbriteOrganizationsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            organizations = get_configured_client().get_organizations()
        except EventbriteError as exc:
            return Response({"error": str(exc)}, status=exc.status_code)
        return Response([{"id": item.get("id"), "name": item.get("name")} for item in organizations])


class EventbriteEventsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        try:
            events = get_configured_client().get_organization_events(status=request.query_params.get("status", "live,started"))
        except EventbriteError as exc:
            return Response({"error": str(exc)}, status=exc.status_code)
        return Response([_eventbrite_event_payload(event) for event in events])


class AdminEventbriteAttendeesView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        cache_key = "ipc:admin:eventbrite-attendees:v2"
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        from .models import EventbriteConnection

        connection = EventbriteConnection.objects.first()
        organization_id = (
            connection.organization_id
            if connection and connection.organization_id
            else settings.EVENTBRITE_ORGANIZATION_ID
        )
        try:
            client = get_configured_client()
            attendees = client.get_organization_attendees(
                organization_id=organization_id,
            )
        except EventbriteError as exc:
            return Response({"detail": str(exc)}, status=exc.status_code)

        event_names = dict(
            Event.objects.exclude(eventbrite_id__isnull=True)
            .exclude(eventbrite_id="")
            .values_list("eventbrite_id", "title")
        )
        # Attendees may belong to an Eventbrite event not yet synced into the
        # local Event table. Resolve those titles from Eventbrite in one call.
        try:
            remote_events = client.get_organization_events(
                organization_id=organization_id,
                status=None,
            )
        except EventbriteError:
            remote_events = []
        for remote_event in remote_events:
            remote_id = str(remote_event.get("id") or "").strip()
            remote_title = (remote_event.get("name") or {}).get("text") or ""
            if remote_id and remote_title:
                event_names.setdefault(remote_id, remote_title)
        payload = []
        for attendee in attendees:
            profile = attendee.get("profile") or {}
            attendee_id = str(attendee.get("id") or "").strip()
            event_id = str(attendee.get("event_id") or "").strip()
            order_id = str(attendee.get("order_id") or "").strip()
            barcode_values = attendee.get("barcodes") or []
            barcode = str((barcode_values[0] if barcode_values else {}).get("barcode") or "").strip()
            if not attendee_id:
                continue
            if attendee.get("cancelled"):
                attendee_status = "cancelled"
            elif attendee.get("refunded"):
                attendee_status = "refunded"
            elif attendee.get("checked_in"):
                attendee_status = "checked_in"
            else:
                attendee_status = str(attendee.get("status") or "registered").lower().replace(" ", "_")
            payload.append({
                "id": f"eventbrite-{attendee_id}",
                "reference": f"EB-{order_id or barcode or attendee_id}",
                "name": profile.get("name") or "Eventbrite attendee",
                "email": profile.get("email") or "",
                "event_name": event_names.get(event_id, "Eventbrite event"),
                "ticket_name": attendee.get("ticket_class_name") or "Eventbrite ticket",
                "quantity": 1,
                "status": attendee_status,
                "created_at": attendee.get("created"),
                "source": "eventbrite",
            })

        payload.sort(key=lambda item: item.get("created_at") or "", reverse=True)
        payload = payload[:100]
        cache.set(cache_key, payload, 60)
        return Response(payload)


class EventbriteSyncView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        try:
            synced = sync_eventbrite_events()
        except EventbriteError as exc:
            return Response({"error": str(exc)}, status=exc.status_code)
        return Response(synced)
