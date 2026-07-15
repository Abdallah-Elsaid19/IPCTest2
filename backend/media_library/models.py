from django.db import models
from PIL import Image
from ipc_backend.validators import media_upload_to, validate_image


class MediaAsset(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=180)
    alt_text = models.CharField(max_length=240)
    image = models.ImageField(upload_to=media_upload_to, validators=[validate_image])
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    webp_image = models.ImageField(upload_to=media_upload_to, blank=True)
    avif_image = models.ImageField(upload_to=media_upload_to, blank=True)
    is_brand_asset = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["is_brand_asset"]),
            models.Index(fields=["created_at"]),
        ]

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image and (not self.width or not self.height):
            with Image.open(self.image.path) as img:
                self.width, self.height = img.size
            super().save(update_fields=["width", "height"])

    def __str__(self):
        return self.title


class MediaRendition(models.Model):
    class Format(models.TextChoices):
        ORIGINAL = "original", "Original"
        WEBP = "webp", "WebP"
        AVIF = "avif", "AVIF"

    asset = models.ForeignKey(MediaAsset, on_delete=models.CASCADE, related_name="renditions")
    format = models.CharField(max_length=16, choices=Format.choices)
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()
    file = models.ImageField(upload_to=media_upload_to, validators=[validate_image])
    file_size = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["asset", "width", "format"]
        constraints = [models.UniqueConstraint(fields=["asset", "format", "width", "height"], name="unique_media_rendition_size_format")]
        indexes = [
            models.Index(fields=["asset", "format"]),
            models.Index(fields=["width", "height"]),
        ]

    def save(self, *args, **kwargs):
        if self.file:
            self.file_size = getattr(self.file, "size", self.file_size or 0)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.asset.title} - {self.width}x{self.height} {self.format}"