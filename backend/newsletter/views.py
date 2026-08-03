from django.core.exceptions import ImproperlyConfigured
from django.db.models import F
from django.utils import timezone
from requests import RequestException
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from accounts.graph_mail import GraphMailError, send_scholarship_announcement_reminder_email

from .models import NewsletterSignup, ScholarshipAnnouncementReminder
from .serializers import (
    AdminScholarshipAnnouncementReminderSerializer,
    NewsletterSignupSerializer,
    ScholarshipAnnouncementReminderSerializer,
)


class NewsletterSignupViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = NewsletterSignup.objects.all()
    serializer_class = NewsletterSignupSerializer
    permission_classes = [permissions.AllowAny]


class ScholarshipAnnouncementReminderViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = ScholarshipAnnouncementReminder.objects.all()
    serializer_class = ScholarshipAnnouncementReminderSerializer
    permission_classes = [permissions.AllowAny]


class AdminScholarshipAnnouncementReminderViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    queryset = ScholarshipAnnouncementReminder.objects.all()
    serializer_class = AdminScholarshipAnnouncementReminderSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None

    @action(detail=True, methods=["post"], url_path="send-email")
    def send_email(self, request, pk=None):
        reminder = self.get_object()
        try:
            send_scholarship_announcement_reminder_email(recipient=reminder.email)
        except (GraphMailError, ImproperlyConfigured, RequestException):
            return Response(
                {"detail": "The reminder email could not be sent. Check the Microsoft Graph configuration."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        ScholarshipAnnouncementReminder.objects.filter(pk=reminder.pk).update(
            last_email_sent_at=timezone.now(),
            email_send_count=F("email_send_count") + 1,
        )
        reminder.refresh_from_db()
        return Response(self.get_serializer(reminder).data)
