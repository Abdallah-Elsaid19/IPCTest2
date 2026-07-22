from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.http import Http404
from django.db.models.deletion import ProtectedError
from django.utils.text import slugify
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from .models import AwardCategory, AwardPageContent, AwardProgramme, AwardsInterest
from .serializers import (
    AdminAwardCategorySerializer,
    AdminAwardProgrammeSerializer,
    AwardCategorySerializer,
    AwardPageContentSerializer,
    AwardProgrammeSerializer,
    AwardsInterestSerializer,
)


class AwardPageContentView(RetrieveAPIView):
    serializer_class = AwardPageContentSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        content = AwardPageContent.objects.filter(
            key="main",
            is_active=True,
            status=AwardPageContent.Status.PUBLISHED,
        ).first()
        if content is None:
            raise Http404("Awards content is not available.")
        return content


class AwardCategoryViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = AwardCategory.objects.filter(is_active=True)
    serializer_class = AwardCategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"


class AwardProgrammeViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = AwardProgramme.objects.filter(is_active=True)
    serializer_class = AwardProgrammeSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"


class AdminAwardProgrammeViewSet(viewsets.ModelViewSet):
    queryset = AwardProgramme.objects.select_related("category").all()
    serializer_class = AdminAwardProgrammeSerializer
    permission_classes = [permissions.IsAdminUser]
    throttle_scope = None

    @staticmethod
    def _unique_slug(title):
        base = slugify(title)[:180] or "award-programme"
        candidate = base
        suffix = 2
        while AwardProgramme.objects.filter(slug=candidate).exists():
            candidate = f"{base[:190 - len(str(suffix))]}-{suffix}"
            suffix += 1
        return candidate

    def perform_create(self, serializer):
        serializer.save(slug=self._unique_slug(serializer.validated_data["title"]))
        cache.delete("ipc:admin-dashboard:v2")

    def perform_update(self, serializer):
        serializer.save()
        cache.delete("ipc:admin-dashboard:v2")

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        cache.delete("ipc:admin-dashboard:v2")


class AdminAwardCategoryViewSet(viewsets.ModelViewSet):
    queryset = AwardCategory.objects.all()
    serializer_class = AdminAwardCategorySerializer
    permission_classes = [permissions.IsAdminUser]
    throttle_scope = None

    @staticmethod
    def _unique_slug(title):
        base = slugify(title)[:120] or "award-category"
        candidate = base
        suffix = 2
        while AwardCategory.objects.filter(slug=candidate).exists():
            candidate = f"{base[:130 - len(str(suffix))]}-{suffix}"
            suffix += 1
        return candidate

    def perform_create(self, serializer):
        serializer.save(slug=self._unique_slug(serializer.validated_data["title"]))

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
        except ProtectedError:
            return Response(
                {"detail": "This category is used by award programmes. Move or delete those programmes first."},
                status=409,
            )
        return Response(status=204)


class AwardsInterestViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = AwardsInterest.objects.select_related("programme")
    serializer_class = AwardsInterestSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        interest = serializer.save()
        send_mail(
            "IPC awards interest received",
            (
                f"{interest.name} registered awards interest: {interest.interest_type}\n"
                f"Award programme: {interest.programme.title}"
            ),
            settings.DEFAULT_FROM_EMAIL,
            [settings.IPC_REVIEW_EMAIL],
            fail_silently=True,
        )
