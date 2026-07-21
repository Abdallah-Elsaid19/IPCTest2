from django.contrib import admin

from .models import ScholarshipContent


@admin.register(ScholarshipContent)
class ScholarshipContentAdmin(admin.ModelAdmin):
    list_display = ("key", "status", "is_active", "updated_at")
    list_filter = ("status", "is_active")
    readonly_fields = ("created_at", "updated_at")
