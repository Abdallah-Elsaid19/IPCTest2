from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.db import transaction
from rest_framework import serializers

from django.core.exceptions import ValidationError as DjangoValidationError

from ipc_backend.validators import normalise_international_telephone, validate_image
from .models import AdminProfile


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    profile_image_url = serializers.SerializerMethodField()
    membership_active = serializers.SerializerMethodField()
    membership_grade = serializers.SerializerMethodField()
    telephone = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "name", "is_staff", "is_superuser", "role", "profile_image_url", "telephone", "membership_active", "membership_grade")
        read_only_fields = fields

    def get_name(self, user):
        return user.get_full_name().strip() or user.get_username()

    def get_role(self, user):
        profile = getattr(user, "admin_profile", None)
        if profile:
            return profile.role
        return "admin" if user.is_staff else "user"

    def get_profile_image_url(self, user):
        profile = getattr(user, "admin_profile", None)
        return profile.profile_image.url if profile and profile.profile_image else None

    def get_telephone(self, user):
        profile = getattr(user, "admin_profile", None)
        return profile.telephone if profile else ""

    def get_membership_active(self, user):
        try:
            application = user.membership_application
        except User.membership_application.RelatedObjectDoesNotExist:
            return False
        return application.status == "approved"

    def get_membership_grade(self, user):
        try:
            application = user.membership_application
        except User.membership_application.RelatedObjectDoesNotExist:
            return None
        return application.membership_grade.code if application.status == "approved" else None


class UserProfileUpdateSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=300, trim_whitespace=True)
    username = serializers.CharField(max_length=150, validators=[UnicodeUsernameValidator()])
    telephone = serializers.CharField(max_length=24, required=False, allow_blank=False)
    profile_image = serializers.ImageField(required=False, validators=[validate_image])

    def validate_full_name(self, value):
        value = " ".join(value.split())
        if len(value) < 2:
            raise serializers.ValidationError("Full name must contain at least 2 characters.")
        return value

    def validate_username(self, value):
        value = value.strip()
        queryset = User.objects.filter(username__iexact=value).exclude(pk=self.context["request"].user.pk)
        if queryset.exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_telephone(self, value):
        try:
            return normalise_international_telephone(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error

    @transaction.atomic
    def update(self, user, validated_data):
        full_name = validated_data["full_name"]
        name_parts = full_name.split(maxsplit=1)
        user.first_name = name_parts[0]
        user.last_name = name_parts[1] if len(name_parts) > 1 else ""
        user.username = validated_data["username"]
        user.save(update_fields=["first_name", "last_name", "username"])

        image = validated_data.get("profile_image")
        telephone = validated_data.get("telephone")
        if image is not None or telephone is not None:
            profile, _ = AdminProfile.objects.get_or_create(
                user=user,
                defaults={
                    "role": AdminProfile.Role.ADMIN if user.is_staff else AdminProfile.Role.USER,
                },
            )
            updated_fields = ["updated_at"]
            if telephone is not None:
                profile.telephone = telephone
                updated_fields.append("telephone")
            if image is not None:
                old_image = profile.profile_image
                profile.profile_image = image
                updated_fields.append("profile_image")
            else:
                old_image = None
            profile.save(update_fields=updated_fields)
            if old_image and old_image.name != profile.profile_image.name:
                old_image.delete(save=False)
        return user



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=254)
    password = serializers.CharField(trim_whitespace=False, write_only=True)

    default_error_messages = {
        "invalid_credentials": "Unable to sign in with the provided credentials.",
    }

    def validate(self, attrs):
        matches = User._default_manager.filter(email__iexact=attrs["email"], is_active=True)
        user = matches.first() if matches.count() == 1 else None
        if user is None:
            # Perform a password hash even when the email is unknown to reduce timing leakage.
            User().set_password(attrs["password"])
            self.fail("invalid_credentials")

        authenticated = authenticate(
            request=self.context.get("request"),
            username=user.get_username(),
            password=attrs["password"],
        )
        if authenticated is None or not authenticated.is_active:
            self.fail("invalid_credentials")

        attrs["user"] = authenticated
        return attrs
