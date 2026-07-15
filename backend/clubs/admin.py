from django.contrib import admin

from .models import ClubEnquiry


@admin.register(ClubEnquiry)
class ClubEnquiryAdmin(admin.ModelAdmin):
    list_display = ("email", "club_name", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("email", "message", "club_name")
    ordering = ("-created_at",)
    readonly_fields = ("id", "created_at", "updated_at")

