from django.contrib import admin
from .models import Event, EventAttendee, EventPageContent, EventQuestion, EventRegistration, EventRegistrationAnswer, EventbriteConnection


@admin.register(EventPageContent)
class EventPageContentAdmin(admin.ModelAdmin):
    list_display = ("key", "is_active", "updated_at")
    list_filter = ("is_active",)
    readonly_fields = ("created_at", "updated_at")


class EventQuestionInline(admin.TabularInline):
    model = EventQuestion
    extra = 0


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "event_type", "starts_at", "display_status", "is_published", "eventbrite_id", "capacity")
    list_filter = ("event_type", "status", "is_online_event", "is_featured", "is_published", "starts_at")
    search_fields = ("title", "description", "location", "region", "venue_name", "eventbrite_id")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")
    inlines = (EventQuestionInline,)

    @admin.display(description="Status")
    def display_status(self, obj):
        return obj.lifecycle_status or "—"


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ("reference", "name", "email", "event_name", "quantity", "status", "confirmation_email_status", "created_at")
    list_filter = ("event_type", "status", "confirmation_email_status", "created_at")
    search_fields = ("reference", "name", "email", "event_name", "organisation")
    autocomplete_fields = ("event",)
    readonly_fields = ("reference", "access_token", "idempotency_key", "created_at", "updated_at")


admin.site.register(EventAttendee)
admin.site.register(EventRegistrationAnswer)


@admin.register(EventbriteConnection)
class EventbriteConnectionAdmin(admin.ModelAdmin):
    list_display = ("organization_name", "organization_id", "last_synced_at", "updated_at")
    readonly_fields = ("created_at", "updated_at", "last_synced_at")
    exclude = ("access_token",)
    search_fields = ("organization_name", "organization_id")
