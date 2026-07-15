from rest_framework import mixins, permissions, viewsets

from .models import MediaAsset
from .serializers import MediaAssetSerializer


class MediaAssetViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = MediaAsset.objects.prefetch_related("renditions")
    serializer_class = MediaAssetSerializer
    permission_classes = [permissions.AllowAny]
