from django.contrib import admin
from .models import AwardCategory, AwardPageContent, AwardProgramme, AwardsInterest


@admin.register(AwardPageContent)
class AwardPageContentAdmin(admin.ModelAdmin):
    list_display = ("key", "status", "is_active", "published_at", "updated_at")
    list_filter = ("status", "is_active")
    readonly_fields = ("created_at", "updated_at", "published_at", "updated_by")


@admin.register(AwardCategory)
class AwardCategoryAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "sort_order", "is_active", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("title", "description", "highlights")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(AwardProgramme)
class AwardProgrammeAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "is_active", "created_at")
    list_filter = ("category", "is_active", "created_at")
    search_fields = ("title", "description", "criteria")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")
    autocomplete_fields = ("category",)


@admin.register(AwardsInterest)
class AwardsInterestAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "interest_type", "status", "created_at")
    list_filter = ("interest_type", "status", "created_at")
    search_fields = ("name", "email", "message")
    autocomplete_fields = ("programme",)
