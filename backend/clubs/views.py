from django.conf import settings
from django.core.mail import send_mail
from django.http import Http404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.generics import RetrieveAPIView
from rest_framework.parsers import JSONParser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

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
