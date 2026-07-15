from django.contrib import admin
from .models import AwardProgramme, AwardsInterest


@admin.register(AwardProgramme)
class AwardProgrammeAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_active", "created_at")
    list_filter = ("category", "is_active", "created_at")
    search_fields = ("title", "description")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")


@admin.register(AwardsInterest)
class AwardsInterestAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "interest_type", "status", "created_at")
    list_filter = ("interest_type", "status", "created_at")
    search_fields = ("name", "email", "message")
    autocomplete_fields = ("programme",)