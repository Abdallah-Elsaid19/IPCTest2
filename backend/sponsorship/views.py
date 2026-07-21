from django.http import Http404
from rest_framework import permissions
from rest_framework.generics import RetrieveAPIView

from .models import SponsorshipContent
from .serializers import SponsorshipContentSerializer


class SponsorshipContentView(RetrieveAPIView):
    serializer_class = SponsorshipContentSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        content = SponsorshipContent.objects.filter(key="main", is_active=True, status=SponsorshipContent.Status.PUBLISHED).first()
        if content is None:
            raise Http404("Sponsorship content is not available.")
        return content
