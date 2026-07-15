from django.conf import settings
from django.core.mail import send_mail
from rest_framework import mixins, permissions, viewsets
from .models import AwardProgramme, AwardsInterest
from .serializers import AwardProgrammeSerializer, AwardsInterestSerializer


class AwardProgrammeViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = AwardProgramme.objects.filter(is_active=True)
    serializer_class = AwardProgrammeSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"


class AwardsInterestViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = AwardsInterest.objects.select_related("programme")
    serializer_class = AwardsInterestSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        interest = serializer.save()
        send_mail(
            "IPC awards interest received",
            f"{interest.name} registered awards interest: {interest.interest_type}",
            settings.DEFAULT_FROM_EMAIL,
            [settings.IPC_REVIEW_EMAIL],
            fail_silently=True,
        )