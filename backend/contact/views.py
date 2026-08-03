from django.conf import settings
from rest_framework import mixins, permissions, viewsets
from ipc_backend.email_branding import send_branded_mail as send_mail
from .models import ContactSubmission
from .serializers import ContactSubmissionSerializer


class ContactSubmissionViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = ContactSubmission.objects.all()
    serializer_class = ContactSubmissionSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        submission = serializer.save()
        send_mail(
            "IPC contact form received",
            f"{submission.name} <{submission.email}> sent a {submission.category} enquiry.\n\n{submission.message}",
            settings.DEFAULT_FROM_EMAIL,
            [settings.IPC_REVIEW_EMAIL],
            fail_silently=True,
        )
