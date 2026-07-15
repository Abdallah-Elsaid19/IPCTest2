from rest_framework import serializers
from .models import MediaAsset, MediaRendition


class MediaRenditionSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaRendition
        fields = ["id", "format", "width", "height", "file_url", "file_size"]

    def get_file_url(self, obj):
        request = self.context.get("request")
        url = obj.file.url if obj.file else ""
        return request.build_absolute_uri(url) if request and url else url


class MediaAssetSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    webp_url = serializers.SerializerMethodField()
    avif_url = serializers.SerializerMethodField()
    renditions = MediaRenditionSerializer(many=True, read_only=True)

    class Meta:
        model = MediaAsset
        fields = [
            "id", "title", "alt_text", "image_url", "webp_url", "avif_url",
            "width", "height", "is_brand_asset", "renditions",
        ]

    def get_image_url(self, obj):
        return self._absolute(obj.image.url if obj.image else "")

    def get_webp_url(self, obj):
        return self._absolute(obj.webp_image.url if obj.webp_image else "")

    def get_avif_url(self, obj):
        return self._absolute(obj.avif_image.url if obj.avif_image else "")

    def _absolute(self, url):
        request = self.context.get("request")
        return request.build_absolute_uri(url) if request and url else url