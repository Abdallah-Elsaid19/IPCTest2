from rest_framework import mixins, permissions, viewsets

from .models import NewsletterSignup
from .serializers import NewsletterSignupSerializer


class NewsletterSignupViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = NewsletterSignup.objects.all()
    serializer_class = NewsletterSignupSerializer
    permission_classes = [permissions.AllowAny]
