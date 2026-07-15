from django.contrib import admin
from .models import Event, EventRegistration, EventbriteConnection


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "event_type", "starts_at", "status", "is_published", "eventbrite_id", "capacity")
    list_filter = ("event_type", "status", "is_online_event", "is_featured", "is_published", "starts_at")
    search_fields = ("title", "description", "location", "region", "venue_name", "eventbrite_id")
    prepopulated_fields = {"slug": ("title",)}
    readonly_fields = ("created_at", "updated_at")


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "event_name", "event_type", "status", "created_at")
    list_filter = ("event_type", "status", "created_at")
    search_fields = ("name", "email", "event_name", "organisation")
    autocomplete_fields = ("event",)


@admin.register(EventbriteConnection)
class EventbriteConnectionAdmin(admin.ModelAdmin):
    list_display = ("organization_name", "organization_id", "last_synced_at", "updated_at")
    readonly_fields = ("created_at", "updated_at", "last_synced_at")
    exclude = ("access_token",)
    search_fields = ("organization_name", "organization_id")
