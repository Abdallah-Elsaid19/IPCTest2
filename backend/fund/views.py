from django.http import Http404
from rest_framework import permissions
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response

from .models import FundContent
from .serializers import FundContentSerializer


class FundContentView(RetrieveAPIView):
    serializer_class = FundContentSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        content = FundContent.objects.filter(key="main").first()
        if content is None:
            raise Http404("Fund content is not available.")
        return content

    def retrieve(self, request, *args, **kwargs):
        content = self.get_object()
        if not content.is_active or content.status != FundContent.Status.PUBLISHED:
            return Response({"is_active": False})
        return Response(self.get_serializer(content).data)
