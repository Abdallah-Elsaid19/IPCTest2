from django.http import Http404
from rest_framework import permissions
from rest_framework.generics import RetrieveAPIView

from .models import HomeContent
from .serializers import HomeContentSerializer


class HomeContentView(RetrieveAPIView):
    serializer_class = HomeContentSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        content = HomeContent.objects.filter(key="main", is_active=True, status=HomeContent.Status.PUBLISHED).first()
        if content is None:
            raise Http404("Home content is not available.")
        return content
