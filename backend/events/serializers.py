from rest_framework import serializers
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
from ipc_backend.validators import clean_text
from .models import Event, EventAttendee, EventPageContent, EventQuestion, EventRegistration
from .services.registration import registration_availability, registration_state


class EventSerializer(serializers.ModelSerializer):
    start_time = serializers.DateTimeField(source="starts_at", read_only=True)
    end_time = serializers.DateTimeField(source="ends_at", read_only=True)
    url = serializers.URLField(source="eventbrite_url", read_only=True)

    class Meta:
        model = Event
        fields = [
            "id", "eventbrite_id", "title", "description", "details_content", "start_time", "end_time", "url",
            "image_url", "image_thumbnail_url", "status", "venue_name", "capacity", "is_online_event", "is_featured",
            "created_at", "updated_at",
            # Backwards-compatible fields used by the current frontend.
            "slug", "event_type", "location", "region", "starts_at", "ends_at", "eventbrite_url", "is_published",
            "registration_title", "registration_description", "registration_opens_at",
            "registration_closes_at", "max_tickets_per_registration", "timezone",
        ]
        read_only_fields = fields


class EventPageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventPageContent
        fields = ["featured_programme", "formats", "audiences", "updated_at"]
        read_only_fields = fields


class AdminEventSerializer(serializers.ModelSerializer):
    lifecycle_status = serializers.CharField(read_only=True)

    class Meta:
        model = Event
        fields = [
            "id", "title", "slug", "event_type", "description", "details_content", "location",
            "region", "venue_name", "starts_at", "ends_at", "capacity",
            "image_url", "image_thumbnail_url", "eventbrite_id", "eventbrite_url", "status",
            "is_online_event", "is_featured", "is_published", "created_at",
            "is_hidden_on_site", "updated_at", "lifecycle_status",
            "registration_title", "registration_description", "registration_opens_at",
            "registration_closes_at", "max_tickets_per_registration", "timezone",
        ]
        read_only_fields = [
            "id", "eventbrite_id", "image_thumbnail_url", "is_hidden_on_site", "created_at", "updated_at",
        ]

    def validate_eventbrite_id(self, value):
        return value.strip() or None if value else None

    def validate_timezone(self, value):
        value = value.strip()
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError as exc:
            raise serializers.ValidationError("Enter a valid IANA timezone, such as Europe/London.") from exc
        return value

    def validate(self, attrs):
        for field in (
            "title", "slug", "description", "location", "region",
            "venue_name", "status",
        ):
            if field in attrs:
                attrs[field] = clean_text(attrs[field])

        starts_at = attrs.get("starts_at", getattr(self.instance, "starts_at", None))
        ends_at = attrs.get("ends_at", getattr(self.instance, "ends_at", None))
        if starts_at and ends_at and ends_at < starts_at:
            raise serializers.ValidationError({
                "ends_at": "The event end date must be after the start date."
            })
        return attrs


class AdminEventVisibilitySerializer(serializers.Serializer):
    hidden = serializers.BooleanField()


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


class EventQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventQuestion
        fields = ["id", "label", "help_text", "question_type", "options", "is_required", "sort_order"]


class EventRegistrationConfigSerializer(EventSerializer):
    questions = serializers.SerializerMethodField()
    available_places = serializers.SerializerMethodField()
    registration_is_open = serializers.SerializerMethodField()
    registration_closed_reason = serializers.SerializerMethodField()

    class Meta(EventSerializer.Meta):
        fields = EventSerializer.Meta.fields + [
            "available_places", "registration_is_open", "registration_closed_reason", "questions",
        ]

    def get_available_places(self, obj):
        return registration_availability(obj)

    def get_questions(self, obj):
        questions = obj.registration_questions.filter(is_active=True).order_by("sort_order", "id")
        return EventQuestionSerializer(questions, many=True).data

    def get_registration_is_open(self, obj):
        return registration_state(obj)[0]

    def get_registration_closed_reason(self, obj):
        return registration_state(obj)[1]


class RegistrationContactSerializer(serializers.Serializer):
    first_name = serializers.CharField(min_length=1, max_length=80)
    last_name = serializers.CharField(min_length=1, max_length=80)
    email = serializers.EmailField()
    mobile = serializers.CharField(max_length=40, required=False, allow_blank=True)
    company = serializers.CharField(max_length=180, required=False, allow_blank=True)
    job_title = serializers.CharField(max_length=160, required=False, allow_blank=True)
    city = serializers.CharField(max_length=120, required=False, allow_blank=True)

    def validate(self, attrs):
        for field in attrs:
            if isinstance(attrs[field], str):
                attrs[field] = clean_text(attrs[field])
        return attrs


class RegistrationAttendeeInputSerializer(RegistrationContactSerializer):
    dietary_access_needs = serializers.CharField(max_length=1000, required=False, allow_blank=True)


class RegistrationAnswerInputSerializer(serializers.Serializer):
    question_id = serializers.IntegerField(min_value=1)
    attendee_index = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    value = serializers.JSONField()


class EventRegistrationCreateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=20)
    contact = RegistrationContactSerializer()
    attendees = RegistrationAttendeeInputSerializer(many=True)
    answers = RegistrationAnswerInputSerializer(many=True, required=False, default=list)
    marketing_consent = serializers.BooleanField(required=False, default=False)
    terms_accepted = serializers.BooleanField()

    def validate_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the registration terms.")
        return value


class EventAttendeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventAttendee
        fields = [
            "id", "first_name", "last_name", "email", "mobile", "company",
            "job_title", "city", "dietary_access_needs",
        ]


class EventRegistrationDetailSerializer(serializers.ModelSerializer):
    attendees = EventAttendeeSerializer(many=True, read_only=True)
    event = EventSerializer(read_only=True)

    class Meta:
        model = EventRegistration
        fields = [
            "reference", "created_at", "updated_at", "event", "event_name", "name", "status",
            "contact_first_name", "contact_last_name", "email", "contact_mobile", "company",
            "job_title", "city", "quantity", "ticket_name", "unit_price", "total_amount",
            "currency", "payment_status", "marketing_consent", "terms_accepted", "confirmation_email_status",
            "attendees",
        ]


class AdminEventRegistrationSerializer(EventRegistrationDetailSerializer):
    class Meta(EventRegistrationDetailSerializer.Meta):
        fields = EventRegistrationDetailSerializer.Meta.fields + ["id", "confirmation_email_sent_at"]
