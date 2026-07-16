from django.http import Http404
from rest_framework import permissions
from rest_framework.generics import RetrieveAPIView

from .models import AboutPageContent
from .serializers import AboutPageContentSerializer


class AboutPageContentView(RetrieveAPIView):
    serializer_class = AboutPageContentSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        content = AboutPageContent.objects.filter(key="main", is_active=True).first()
        if content is None:
            raise Http404("About content is not available.")
        return content
