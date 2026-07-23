from django.http import Http404
from rest_framework import permissions
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response

from .models import ServiceContent
from .serializers import ServiceContentSerializer


class ServiceContentView(RetrieveAPIView):
    serializer_class = ServiceContentSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        content = ServiceContent.objects.filter(key="main").first()
        if content is None:
            raise Http404("Service content is not available.")
        return content

    def retrieve(self, request, *args, **kwargs):
        content = self.get_object()
        if not content.is_active or content.status != ServiceContent.Status.PUBLISHED:
            return Response({"is_active": False})
        return Response(self.get_serializer(content).data)
