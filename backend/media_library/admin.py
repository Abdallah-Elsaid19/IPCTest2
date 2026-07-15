from django.contrib import admin
from .models import MediaAsset, MediaRendition


class MediaRenditionInline(admin.TabularInline):
    model = MediaRendition
    extra = 0
    readonly_fields = ("file_size", "created_at")


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("title", "alt_text", "width", "height", "is_brand_asset", "created_at")
    list_filter = ("is_brand_asset", "created_at")
    search_fields = ("title", "alt_text")
    readonly_fields = ("width", "height", "created_at", "updated_at")
    inlines = [MediaRenditionInline]


@admin.register(MediaRendition)
class MediaRenditionAdmin(admin.ModelAdmin):
    list_display = ("asset", "format", "width", "height", "file_size", "created_at")
    list_filter = ("format", "created_at")
    search_fields = ("asset__title", "asset__alt_text")
    autocomplete_fields = ("asset",)
    readonly_fields = ("file_size", "created_at")