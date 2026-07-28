from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from applications.models import Application, FormDefinition
from awards.models import AwardProgramme
from events.models import EventRegistration
from ipc_backend.validators import clean_text
from memberships.models import MembershipGrade

from .models import (
    AwardNomination, AwardNominationDocument, Club, ClubMembership, ClubMessage, DiscussionCategory, DiscussionPost,
    DiscussionThread, ProfessionalInterest, Programme, ProgrammeEnquiry,
    Scholarship, ScholarshipApplication, Status, SupportMessage, SupportTicket,
    UserDocument, UserNotification, UserPreference, UserProfile,
)


PROFILE_FIELDS = (
    "preferred_name", "phone", "country", "city", "timezone", "biography",
    "job_title", "employer", "industry", "years_experience",
    "professional_headline", "qualifications",
)


def completion(profile):
    completed = sum(bool(getattr(profile, field)) for field in PROFILE_FIELDS)
    completed += bool(profile.interests.exists())
    missing = [field.replace("_", " ").title() for field in PROFILE_FIELDS if not getattr(profile, field)]
    if not profile.interests.exists():
        missing.append("Professional Interests")
    return {"percentage": round(completed / (len(PROFILE_FIELDS) + 1) * 100), "missing": missing}


class InterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalInterest
        fields = ["slug", "name"]


class ProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")
    email = serializers.EmailField(source="user.email", read_only=True)
    interests = serializers.SlugRelatedField(many=True, slug_field="slug", queryset=ProfessionalInterest.objects.filter(is_active=True), required=False)
    completion = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = ["first_name", "last_name", "email", *PROFILE_FIELDS, "certifications", "linkedin_url", "website_url", "interests", "completion", "updated_at"]
        read_only_fields = ["completion", "updated_at"]

    def get_completion(self, obj):
        return completion(obj)

    @transaction.atomic
    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        interests = validated_data.pop("interests", None)
        for key, value in validated_data.items():
            setattr(instance, key, clean_text(value) if isinstance(value, str) else value)
        instance.save()
        if user_data:
            instance.user.first_name = clean_text(user_data.get("first_name", instance.user.first_name))
            instance.user.last_name = clean_text(user_data.get("last_name", instance.user.last_name))
            instance.user.save(update_fields=["first_name", "last_name"])
        if interests is not None:
            instance.interests.set(interests)
        return instance


class MembershipApplicationSerializer(serializers.ModelSerializer):
    grade = serializers.SlugRelatedField(source="membership_grade", slug_field="code", queryset=MembershipGrade.objects.filter(is_active=True))
    grade_title = serializers.CharField(source="membership_grade.title", read_only=True)
    documents = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = ["application_reference", "grade", "grade_title", "status", "current_step", "first_name", "last_name", "email", "phone", "country", "organisation", "contact_preference", "grade_specific_data", "code_of_conduct_consent", "privacy_consent", "submitted_at", "updated_at", "documents"]
        read_only_fields = ["application_reference", "status", "submitted_at", "updated_at", "documents"]

    def get_documents(self, obj):
        return [{"id": item.pk, "name": item.original_name, "type": item.evidence_type, "size": item.file_size} for item in obj.evidence_files.all()]

    def create(self, validated_data):
        grade = validated_data["membership_grade"]
        form = FormDefinition.objects.filter(code=grade.code, is_active=True).order_by("-version").first()
        if not form:
            raise serializers.ValidationError({"grade": "Applications for this level are unavailable."})
        user = self.context["request"].user
        return Application.objects.create(applicant=user, form_definition=form, form_version=form.version, status=Application.Status.DRAFT, username=user.username, **validated_data)


class ScholarshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scholarship
        fields = ["public_id", "title", "slug", "summary", "description", "category", "eligibility", "funding_min_percent", "funding_max_percent", "partner_name", "partner_url", "deadline", "form_fields"]


class ScholarshipApplicationSerializer(serializers.ModelSerializer):
    scholarship = serializers.SlugRelatedField(slug_field="slug", queryset=Scholarship.objects.filter(is_active=True))
    scholarship_title = serializers.CharField(source="scholarship.title", read_only=True)

    class Meta:
        model = ScholarshipApplication
        fields = ["public_id", "scholarship", "scholarship_title", "status", "current_step", "statement", "responses", "submitted_at", "updated_at"]
        read_only_fields = ["public_id", "status", "submitted_at", "updated_at"]

    def create(self, data):
        return ScholarshipApplication.objects.create(applicant=self.context["request"].user, **data)


class AwardSerializer(serializers.ModelSerializer):
    category = serializers.CharField(source="category.title", read_only=True)

    class Meta:
        model = AwardProgramme
        fields = ["title", "slug", "description", "criteria", "category"]


class NominationSerializer(serializers.ModelSerializer):
    programme = serializers.SlugRelatedField(slug_field="slug", queryset=AwardProgramme.objects.filter(is_active=True))
    programme_title = serializers.CharField(source="programme.title", read_only=True)
    documents = serializers.SerializerMethodField()

    class Meta:
        model = AwardNomination
        fields = ["public_id", "programme", "programme_title", "nominee_type", "nominee_name", "nominee_email", "statement", "responses", "status", "submitted_at", "updated_at", "documents"]
        read_only_fields = ["public_id", "status", "submitted_at", "updated_at"]

    def create(self, data):
        return AwardNomination.objects.create(applicant=self.context["request"].user, **data)

    def get_documents(self, obj):
        return [
            {
                "id": document.pk,
                "name": document.original_name,
                "content_type": document.content_type,
                "size": document.file_size,
                "download_url": f"/api/user/awards/nominations/{obj.public_id}/documents/{document.pk}/download",
            }
            for document in obj.documents.all()
        ]


class AdminNominationSerializer(serializers.ModelSerializer):
    programme_title = serializers.CharField(source="programme.title", read_only=True)
    programme_slug = serializers.CharField(source="programme.slug", read_only=True)
    applicant_name = serializers.CharField(source="applicant.get_full_name", read_only=True)
    applicant_email = serializers.EmailField(source="applicant.email", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    documents = serializers.SerializerMethodField()

    class Meta:
        model = AwardNomination
        fields = [
            "public_id", "programme_title", "programme_slug", "applicant_name",
            "applicant_email", "nominee_type", "nominee_name", "nominee_email",
            "statement", "responses", "status", "status_label", "submitted_at",
            "created_at", "updated_at", "documents",
        ]
        read_only_fields = fields

    def get_documents(self, obj):
        return [
            {
                "id": document.pk,
                "name": document.original_name,
                "content_type": document.content_type,
                "size": document.file_size,
                "download_url": f"/api/admin/award-nominations/{obj.public_id}/documents/{document.pk}/download",
            }
            for document in obj.documents.all()
        ]


class ClubSerializer(serializers.ModelSerializer):
    membership_status = serializers.SerializerMethodField()
    membership_role = serializers.SerializerMethodField()
    membership_joined_at = serializers.SerializerMethodField()
    active_member_count = serializers.SerializerMethodField()
    discussion_count = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()
    categories = serializers.SerializerMethodField()

    class Meta:
        model = Club
        fields = [
            "public_id", "name", "slug", "summary", "description", "location",
            "specialism", "membership_status", "membership_role",
            "membership_joined_at", "active_member_count", "discussion_count",
            "message_count", "members", "categories",
        ]

    def _membership(self, obj):
        return obj.memberships.filter(user=self.context["request"].user).first()

    def get_membership_status(self, obj):
        membership = self._membership(obj)
        return membership.status if membership else "not_joined"

    def get_membership_role(self, obj):
        membership = self._membership(obj)
        return membership.role if membership else None

    def get_membership_joined_at(self, obj):
        membership = self._membership(obj)
        return membership.created_at if membership and membership.status == ClubMembership.State.ACTIVE else None

    def get_active_member_count(self, obj):
        return obj.memberships.filter(status=ClubMembership.State.ACTIVE).count()

    def get_discussion_count(self, obj):
        return DiscussionThread.objects.filter(category__club=obj).count()

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_members(self, obj):
        request = self.context["request"]
        requester_membership = self._membership(obj)
        if not request.user.is_staff and (
            not requester_membership
            or requester_membership.status != ClubMembership.State.ACTIVE
        ):
            return []

        visible_members = []
        memberships = obj.memberships.filter(
            status=ClubMembership.State.ACTIVE,
        ).select_related("user", "user__panel_profile", "user__panel_preferences")[:100]
        for club_membership in memberships:
            user = club_membership.user
            preferences = getattr(user, "panel_preferences", None)
            if (
                user != request.user
                and preferences
                and preferences.profile_visibility == UserPreference.Visibility.PRIVATE
            ):
                continue
            profile = getattr(user, "panel_profile", None)
            name = (
                getattr(profile, "preferred_name", "")
                or user.get_full_name()
                or user.email.split("@", 1)[0]
            )
            initials = "".join(part[0] for part in name.split()[:2]).upper()
            visible_members.append({
                "name": name,
                "initials": initials,
                "club_role": club_membership.role,
                "job_title": getattr(profile, "job_title", "") if profile else "",
                "employer": getattr(profile, "employer", "") if profile else "",
                "city": getattr(profile, "city", "") if profile else "",
            })
        return visible_members

    def get_categories(self, obj):
        return CategorySerializer(obj.categories.all(), many=True).data


class AdminClubMembershipSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    applicant_email = serializers.EmailField(source="user.email", read_only=True)
    club_name = serializers.CharField(source="club.name", read_only=True)
    club_slug = serializers.CharField(source="club.slug", read_only=True)

    class Meta:
        model = ClubMembership
        fields = [
            "id", "applicant_name", "applicant_email", "club_name", "club_slug",
            "status", "role", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "applicant_name", "applicant_email", "club_name", "club_slug",
            "created_at", "updated_at",
        ]

    def get_applicant_name(self, obj):
        return obj.user.get_full_name() or obj.user.email.split("@", 1)[0]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = DiscussionCategory
        fields = ["id", "name", "slug"]


class ThreadSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.get_full_name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    reply_count = serializers.IntegerField(source="posts.count", read_only=True)

    class Meta:
        model = DiscussionThread
        fields = ["public_id", "category", "category_name", "author_name", "title", "body", "is_pinned", "is_locked", "reply_count", "created_at", "updated_at"]
        read_only_fields = ["public_id", "category_name", "author_name", "is_pinned", "is_locked", "reply_count", "created_at", "updated_at"]


class PostSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.get_full_name", read_only=True)

    class Meta:
        model = DiscussionPost
        fields = ["id", "parent", "author_name", "body", "is_edited", "created_at", "updated_at"]
        read_only_fields = ["id", "author_name", "is_edited", "created_at", "updated_at"]


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.get_full_name", read_only=True)

    class Meta:
        model = ClubMessage
        fields = ["public_id", "sender_name", "body", "is_edited", "created_at", "updated_at"]
        read_only_fields = ["public_id", "sender_name", "is_edited", "created_at", "updated_at"]


class BookingSerializer(serializers.ModelSerializer):
    event_slug = serializers.CharField(source="event.slug", read_only=True)
    starts_at = serializers.DateTimeField(source="event.starts_at", read_only=True)
    ends_at = serializers.DateTimeField(source="event.ends_at", read_only=True)
    location = serializers.CharField(source="event.location", read_only=True)
    venue_name = serializers.CharField(source="event.venue_name", read_only=True)
    timezone = serializers.CharField(source="event.timezone", read_only=True)
    is_online_event = serializers.BooleanField(source="event.is_online_event", read_only=True)

    class Meta:
        model = EventRegistration
        fields = [
            "reference", "event_name", "event_slug", "starts_at", "ends_at",
            "location", "venue_name", "timezone", "is_online_event", "status",
            "quantity", "ticket_name", "unit_price", "total_amount", "currency",
            "payment_status", "confirmation_email_status", "name", "email",
            "company", "job_title", "created_at",
        ]


class DocumentSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = UserDocument
        fields = ["public_id", "title", "category", "original_name", "content_type", "file_size", "expires_at", "created_at", "download_url"]

    def get_download_url(self, obj):
        return f"/api/user/documents/{obj.public_id}/download"


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNotification
        fields = ["public_id", "notification_type", "title", "message", "target_url", "is_read", "read_at", "created_at"]


class ProgrammeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programme
        fields = ["title", "slug", "summary", "provider", "external_url"]


class EnquirySerializer(serializers.ModelSerializer):
    programme = serializers.SlugRelatedField(slug_field="slug", queryset=Programme.objects.filter(is_active=True))
    programme_title = serializers.CharField(source="programme.title", read_only=True)

    class Meta:
        model = ProgrammeEnquiry
        fields = ["public_id", "programme", "programme_title", "message", "status", "created_at", "updated_at"]
        read_only_fields = ["public_id", "status", "created_at", "updated_at"]

    def create(self, data):
        return ProgrammeEnquiry.objects.create(applicant=self.context["request"].user, **data)


class SupportMessageSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    is_read = serializers.SerializerMethodField()

    class Meta:
        model = SupportMessage
        fields = ["id", "author_name", "body", "is_staff_reply", "is_read", "read_at", "created_at"]
        read_only_fields = ["id", "author_name", "is_staff_reply", "is_read", "read_at", "created_at"]

    def get_author_name(self, obj):
        if not obj.author:
            return "IPC Support"
        return obj.author.get_full_name() or obj.author.email

    def get_is_read(self, obj):
        return obj.read_at is not None


class SupportSerializer(serializers.ModelSerializer):
    initial_message = serializers.CharField(write_only=True, min_length=10)
    messages = SupportMessageSerializer(many=True, read_only=True)
    unread_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = SupportTicket
        fields = ["public_id", "category", "subject", "status", "initial_message", "messages", "unread_count", "last_message", "closed_at", "created_at", "updated_at"]
        read_only_fields = ["public_id", "status", "messages", "closed_at", "created_at", "updated_at"]

    @transaction.atomic
    def create(self, data):
        body = data.pop("initial_message")
        ticket = SupportTicket.objects.create(requester=self.context["request"].user, **data)
        SupportMessage.objects.create(ticket=ticket, author=ticket.requester, body=body)
        return ticket

    def get_unread_count(self, obj):
        request = self.context.get("request")
        staff_view = bool(request and request.user.is_staff)
        return obj.messages.filter(
            is_staff_reply=not staff_view,
            read_at__isnull=True,
        ).count()

    def get_last_message(self, obj):
        message = obj.messages.order_by("-created_at").first()
        return SupportMessageSerializer(message).data if message else None


class AdminSupportSerializer(SupportSerializer):
    requester_name = serializers.SerializerMethodField()
    requester_email = serializers.EmailField(source="requester.email", read_only=True)

    class Meta(SupportSerializer.Meta):
        fields = [
            "public_id", "requester_name", "requester_email", "category",
            "subject", "status", "messages", "unread_count", "last_message",
            "closed_at", "created_at", "updated_at",
        ]

    def get_requester_name(self, obj):
        return obj.requester.get_full_name() or obj.requester.email


class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ["profile_visibility", "email_notifications", "club_communications", "event_reminders", "marketing_consent", "updated_at"]
        read_only_fields = ["updated_at"]


def submit(instance, required):
    errors = {field: "Required before submission." for field in required if not getattr(instance, field)}
    if errors:
        raise serializers.ValidationError(errors)
    instance.status = Status.SUBMITTED
    instance.submitted_at = timezone.now()
    instance.save(update_fields=["status", "submitted_at", "updated_at"])
    return instance
