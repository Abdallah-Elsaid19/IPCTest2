from django.contrib import admin

from .models import (
    Application,
    ApplicationEvidence,
    ApplicationReference,
    ApplicationStatusHistory,
    FormDefinition,
    ReviewerNote,
)


class ApplicationEvidenceInline(admin.TabularInline):
    model = ApplicationEvidence
    extra = 0
    readonly_fields = ("original_name", "content_type", "file_size", "uploaded_at", "updated_at")


class ApplicationReferenceInline(admin.TabularInline):
    model = ApplicationReference
    extra = 0
    readonly_fields = ("created_at",)


class ReviewerNoteInline(admin.TabularInline):
    model = ReviewerNote
    extra = 0
    readonly_fields = ("author", "created_at")


class ApplicationStatusHistoryInline(admin.TabularInline):
    model = ApplicationStatusHistory
    extra = 0
    readonly_fields = ("from_status", "to_status", "changed_by", "note", "created_at")
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(FormDefinition)
class FormDefinitionAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "version", "is_active", "updated_at")
    list_filter = ("is_active", "version")
    search_fields = ("code", "name")
    readonly_fields = ("created_at", "updated_at")


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ("application_reference", "full_name", "membership_grade", "status", "email", "submitted_at", "reviewed_by")
    list_filter = ("membership_grade", "status", "form_definition", "submitted_at")
    search_fields = ("application_reference", "first_name", "last_name", "email", "organisation")
    readonly_fields = ("application_reference", "form_version", "submitted_at", "created_at", "updated_at", "reviewed_at")
    autocomplete_fields = ("membership_grade", "form_definition", "reviewed_by")
    inlines = [ApplicationEvidenceInline, ApplicationReferenceInline, ReviewerNoteInline, ApplicationStatusHistoryInline]
    fieldsets = (
        ("Applicant", {"fields": ("application_reference", "first_name", "last_name", "email", "phone", "country", "organisation", "contact_preference")}),
        ("Application form", {"fields": ("membership_grade", "form_definition", "form_version", "grade_specific_data")}),
        ("Consents", {"fields": ("code_of_conduct_consent", "privacy_consent")}),
        ("Review", {"fields": ("status", "reviewed_by", "reviewed_at")}),
        ("Timestamps", {"fields": ("submitted_at", "created_at", "updated_at")}),
    )

    @admin.display(description="Applicant")
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


@admin.register(ApplicationEvidence)
class ApplicationEvidenceAdmin(admin.ModelAdmin):
    list_display = ("application", "evidence_type", "original_name", "file_size", "uploaded_at")
    list_filter = ("evidence_type", "uploaded_at")
    search_fields = ("application__application_reference", "application__email", "original_name")
    readonly_fields = ("content_type", "file_size", "uploaded_at", "updated_at")


@admin.register(ApplicationStatusHistory)
class ApplicationStatusHistoryAdmin(admin.ModelAdmin):
    list_display = ("application", "from_status", "to_status", "changed_by", "created_at")
    list_filter = ("to_status", "created_at")
    search_fields = ("application__application_reference", "application__email", "note")
    readonly_fields = ("application", "from_status", "to_status", "changed_by", "note", "created_at")


@admin.register(ApplicationReference)
class ApplicationReferenceAdmin(admin.ModelAdmin):
    list_display = ("name", "application", "email", "organisation", "created_at")
    search_fields = ("name", "email", "organisation", "application__application_reference")
