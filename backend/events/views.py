from secrets import token_urlsafe

from django.conf import settings
from django.core.mail import send_mail
from django.shortcuts import redirect
from django.urls import reverse
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .eventbrite import EventbriteError, exchange_code_for_token, get_authorization_url, save_connection
from .models import Event, EventRegistration
from .serializers import EventRegistrationSerializer, EventSerializer
from .services.eventbrite import EventbriteClient, get_configured_client
from .services.sync_eventbrite import sync_eventbrite_events


class EventViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = Event.objects.filter(is_published=True).exclude(status__in=["canceled", "cancelled", "deleted"]).order_by("starts_at", "title")
    serializer_class = EventSerializer
    permission_classes = [permissions.AllowAny]


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


class EventbriteSyncView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        try:
            synced = sync_eventbrite_events()
        except EventbriteError as exc:
            return Response({"error": str(exc)}, status=exc.status_code)
        return Response(synced)
