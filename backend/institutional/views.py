from django.http import Http404
from rest_framework import permissions
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response

from .models import EmployerContent, PartnershipContent, PublicationContent
from .serializers import EmployerContentSerializer, PartnershipContentSerializer, PublicationContentSerializer


class PublishedContentView(RetrieveAPIView):
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        content = self.queryset.model.objects.filter(key="main").first()
        if content is None:
            raise Http404("Content is not available.")
        return content

    def retrieve(self, request, *args, **kwargs):
        content = self.get_object()
        if not content.is_active or content.status != content.Status.PUBLISHED:
            return Response({"is_active": False})
        return Response(self.get_serializer(content).data)


class EmployerContentView(PublishedContentView):
    queryset = EmployerContent.objects.all()
    serializer_class = EmployerContentSerializer


class PartnershipContentView(PublishedContentView):
    queryset = PartnershipContent.objects.all()
    serializer_class = PartnershipContentSerializer


class PublicationContentView(PublishedContentView):
    queryset = PublicationContent.objects.all()
    serializer_class = PublicationContentSerializer
