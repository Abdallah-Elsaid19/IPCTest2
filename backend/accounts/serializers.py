from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "name", "is_staff", "is_superuser", "role")
        read_only_fields = fields

    def get_name(self, user):
        return user.get_full_name().strip() or user.get_username()

    def get_role(self, user):
        profile = getattr(user, "admin_profile", None)
        return profile.role if profile else None



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
