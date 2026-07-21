from django.contrib import admin

from .models import ClubEnquiry, ClubPageContent


@admin.register(ClubPageContent)
class ClubPageContentAdmin(admin.ModelAdmin):
    list_display = ("key", "status", "is_active", "updated_at")
    list_filter = ("status", "is_active")
    readonly_fields = ("created_at", "updated_at", "published_at", "updated_by")


@admin.register(ClubEnquiry)
class ClubEnquiryAdmin(admin.ModelAdmin):
    list_display = ("email", "club_name", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("email", "message", "club_name")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at")
