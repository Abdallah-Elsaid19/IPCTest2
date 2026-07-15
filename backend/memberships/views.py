from rest_framework import mixins, permissions, viewsets

from .models import MembershipGrade
from .serializers import MembershipGradeSerializer


class MembershipGradeViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = MembershipGrade.objects.filter(is_active=True).prefetch_related("benefits", "requirements")
    serializer_class = MembershipGradeSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "code"
