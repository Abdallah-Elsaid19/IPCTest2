from django.contrib import admin

from .models import (
    BursaryApplication,
    BursaryApplicationStatusHistory,
    ScholarshipAnnouncementContent,
    ScholarshipContent,
    ScholarshipWinner,
)


@admin.register(ScholarshipContent)
class ScholarshipContentAdmin(admin.ModelAdmin):
    list_display = ("key", "status", "is_active", "updated_at")
    list_filter = ("status", "is_active")
    readonly_fields = ("created_at", "updated_at")


@admin.register(BursaryApplication)
class BursaryApplicationAdmin(admin.ModelAdmin):
    list_display = (
        "application_reference",
        "first_name",
        "last_name",
        "selected_modules",
        "award_round",
        "status",
        "submitted_at",
    )
    list_filter = ("award_round", "status", "currently_employed", "country")
    search_fields = (
        "application_reference",
        "membership_reference",
        "first_name",
        "last_name",
        "email",
        "mobile_phone_e164",
        "organisation_name",
    )
    readonly_fields = tuple(
        field.name
        for field in BursaryApplication._meta.fields
        if field.name not in {"status", "assigned_reviewer", "reviewer_internal_notes"}
    )

    @admin.display(description="Modules")
    def selected_modules(self, application):
        return application.get_bursary_selection_display()


@admin.register(BursaryApplicationStatusHistory)
class BursaryApplicationStatusHistoryAdmin(admin.ModelAdmin):
    list_display = (
        "application",
        "previous_status",
        "new_status",
        "changed_by",
        "changed_at",
    )
    readonly_fields = (
        "application",
        "previous_status",
        "new_status",
        "changed_by",
        "internal_reason",
        "changed_at",
    )


@admin.register(ScholarshipAnnouncementContent)
class ScholarshipAnnouncementContentAdmin(admin.ModelAdmin):
    list_display = ("key", "announcement_at", "announcement_round", "is_active", "updated_at")
    readonly_fields = ("created_at", "updated_at")


@admin.register(ScholarshipWinner)
class ScholarshipWinnerAdmin(admin.ModelAdmin):
    list_display = ("name", "award_round", "award_year", "country", "display_order", "is_published")
    list_filter = ("award_round", "award_year", "is_published", "country")
    search_fields = ("name", "award", "country", "category")
    ordering = ("award_round", "display_order", "name")
