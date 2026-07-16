from django.http import Http404
from rest_framework import permissions
from rest_framework.generics import RetrieveAPIView

from .models import ScholarshipContent
from .serializers import ScholarshipContentSerializer


class ScholarshipContentView(RetrieveAPIView):
    serializer_class = ScholarshipContentSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        content = ScholarshipContent.objects.filter(key="main", is_active=True).first()
        if content is None:
            raise Http404("Scholarship content is not available.")
        return content

