from rest_framework import serializers
from ipc_backend.validators import clean_text
from .models import Event, EventRegistration


class EventSerializer(serializers.ModelSerializer):
    start_time = serializers.DateTimeField(source="starts_at", read_only=True)
    end_time = serializers.DateTimeField(source="ends_at", read_only=True)
    url = serializers.URLField(source="eventbrite_url", read_only=True)

    class Meta:
        model = Event
        fields = [
            "id", "eventbrite_id", "title", "description", "start_time", "end_time", "url",
            "image_url", "status", "venue_name", "capacity", "is_online_event", "is_featured",
            "created_at", "updated_at",
            # Backwards-compatible fields used by the current frontend.
            "slug", "event_type", "location", "region", "starts_at", "ends_at", "eventbrite_url", "is_published",
        ]
        read_only_fields = fields


class EventRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = ["id", "created_at", "event", "event_name", "event_type", "name", "email", "organisation", "dietary_access_needs", "status"]
        read_only_fields = ["id", "created_at", "status"]

    def validate(self, attrs):
        for field in ["event_name", "name", "organisation", "dietary_access_needs"]:
            if field in attrs:
                attrs[field] = clean_text(attrs[field])
        event = attrs.get("event")
        event_name = attrs.get("event_name", "").strip()
        if not event and event_name:
            event = Event.objects.filter(title__iexact=event_name).first()
            if event:
                attrs["event"] = event
        if event:
            attrs["event_name"] = event.title
            attrs["event_type"] = event.get_event_type_display()
        errors = {}
        if len(attrs.get("name", "")) < 2:
            errors["name"] = "Name must be at least 2 characters."
        if not attrs.get("event_name"):
            errors["event_name"] = "Event name is required."
        if errors:
            raise serializers.ValidationError(errors)
        return attrs
