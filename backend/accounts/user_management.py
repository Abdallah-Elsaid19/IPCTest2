from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ImproperlyConfigured, ValidationError as DjangoValidationError
from django.core.cache import cache
from django.db import transaction
from django.db.models import Q
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.tokens import default_token_generator
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework import serializers, status
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from requests import RequestException

from .graph_mail import GraphMailError, send_password_reset_email
from .models import AdminProfile


User = get_user_model()


class IsUserAdministrator(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated or not request.user.is_staff:
            return False
        profile = getattr(request.user, "admin_profile", None)
        return request.user.is_superuser or profile is None or profile.role == AdminProfile.Role.ADMIN


class AdminUserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    ipc_email = serializers.EmailField(source="email", read_only=True)
    personal_email = serializers.SerializerMethodField()
    membership_application_id = serializers.SerializerMethodField()
    membership_reference = serializers.SerializerMethodField()
    membership_grade = serializers.SerializerMethodField()
    application_status = serializers.SerializerMethodField()
    application_submitted_at = serializers.SerializerMethodField()
    application_approved_at = serializers.SerializerMethodField()
    account_created_at = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id", "username", "email", "first_name", "last_name", "name", "role",
            "is_staff", "is_superuser", "is_active", "date_joined", "last_login",
            "ipc_email", "personal_email", "membership_application_id",
            "membership_reference", "membership_grade", "application_status",
            "application_submitted_at", "application_approved_at", "account_created_at",
        )
        read_only_fields = ("id", "name", "is_superuser", "date_joined", "last_login")

    def get_name(self, user):
        return user.get_full_name().strip() or user.get_username()

    def get_role(self, user):
        profile = getattr(user, "admin_profile", None)
        if profile:
            return profile.role
        return AdminProfile.Role.ADMIN if user.is_staff else AdminProfile.Role.USER

    @staticmethod
    def _application(user):
        try:
            return user.membership_application
        except User.membership_application.RelatedObjectDoesNotExist:
            return None

    def get_personal_email(self, user):
        application = self._application(user)
        return application.email if application else None

    def get_membership_application_id(self, user):
        application = self._application(user)
        return application.pk if application else None

    def get_membership_reference(self, user):
        application = self._application(user)
        return application.application_reference if application else None

    def get_membership_grade(self, user):
        application = self._application(user)
        return application.membership_grade.code if application else None

    def get_application_status(self, user):
        application = self._application(user)
        return application.status if application else None

    def get_application_submitted_at(self, user):
        application = self._application(user)
        return application.submitted_at if application else None

    def get_application_approved_at(self, user):
        application = self._application(user)
        return application.approved_at if application else None

    def get_account_created_at(self, user):
        application = self._application(user)
        return application.account_created_at if application else user.date_joined


class AdminUserWriteSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=AdminProfile.Role.choices,
        default=AdminProfile.Role.USER,
        required=False,
    )

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "role", "is_active")

    def validate_email(self, value):
        if not value:
            raise serializers.ValidationError("Email address is required.")
        queryset = User.objects.filter(email__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        request = self.context["request"]
        instance = self.instance
        if instance:
            if instance == request.user and attrs.get("is_active") is False:
                raise serializers.ValidationError({"is_active": "You cannot deactivate your own account."})
            if instance == request.user and attrs.get("role") == AdminProfile.Role.USER:
                raise serializers.ValidationError({"role": "You cannot remove your own admin access."})
            if instance.is_superuser and not request.user.is_superuser:
                raise serializers.ValidationError("Only a superuser can modify another superuser.")
            if instance.is_superuser and attrs.get("role") == AdminProfile.Role.USER:
                raise serializers.ValidationError({"role": "A superuser cannot be changed to the user role."})
        return attrs

    def _save_role(self, user, role):
        AdminProfile.objects.update_or_create(user=user, defaults={"role": role})
        should_be_staff = role == AdminProfile.Role.ADMIN or user.is_superuser
        if user.is_staff != should_be_staff:
            user.is_staff = should_be_staff
            user.save(update_fields=["is_staff"])

    @transaction.atomic
    def create(self, validated_data):
        role = validated_data.pop("role", AdminProfile.Role.USER)
        user = User(is_staff=role == AdminProfile.Role.ADMIN, **validated_data)
        user.set_unusable_password()
        user.save()
        self._save_role(user, role)
        return user

    @transaction.atomic
    def update(self, instance, validated_data):
        existing_profile = getattr(instance, "admin_profile", None)
        role = validated_data.pop("role", existing_profile.role if existing_profile else (AdminProfile.Role.ADMIN if instance.is_staff else AdminProfile.Role.USER))
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        self._save_role(instance, role)
        return instance


class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class AdminUserViewSet(ModelViewSet):
    permission_classes = [IsUserAdministrator]
    pagination_class = UserPagination
    throttle_scope = None
    queryset = User.objects.select_related(
        "admin_profile",
        "membership_application__membership_grade",
    ).order_by("-date_joined")

    def get_serializer_class(self):
        return AdminUserSerializer if self.action in ("list", "retrieve") else AdminUserWriteSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(AdminUserSerializer(user).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(AdminUserSerializer(user).data)

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(membership_application__email__icontains=search)
                | Q(membership_application__application_reference__icontains=search)
                | Q(membership_application__membership_grade__code__icontains=search)
            ).distinct()
        active = self.request.query_params.get("active")
        if active in ("true", "false"):
            queryset = queryset.filter(is_active=active == "true")
        role = self.request.query_params.get("role")
        if role == AdminProfile.Role.ADMIN:
            queryset = queryset.filter(Q(admin_profile__role=role) | Q(admin_profile__isnull=True, is_staff=True))
        elif role == AdminProfile.Role.USER:
            queryset = queryset.filter(Q(admin_profile__role=role) | Q(admin_profile__isnull=True, is_staff=False))
        return queryset

    def perform_destroy(self, instance):
        if instance == self.request.user:
            raise serializers.ValidationError("You cannot delete your own account.")
        if instance.is_superuser and not self.request.user.is_superuser:
            raise serializers.ValidationError("Only a superuser can delete another superuser.")
        instance.delete()

    @action(detail=True, methods=["post"], url_path="send-password-reset", throttle_classes=[ScopedRateThrottle], throttle_scope="admin_password_reset")
    def send_password_reset(self, request, pk=None):
        user = self.get_object()
        if user.is_superuser and not request.user.is_superuser:
            return Response({"detail": "Only a superuser can reset another superuser's password."}, status=status.HTTP_403_FORBIDDEN)
        try:
            application = user.membership_application
        except User.membership_application.RelatedObjectDoesNotExist:
            application = None
        recipient = application.email if application else user.email
        if not recipient:
            return Response({"email": ["This user does not have an email address."]}, status=status.HTTP_400_BAD_REQUEST)
        cooldown_key = f"ipc:password-reset-email:{user.pk}"
        if cache.get(cooldown_key):
            return Response({"detail": "A password-reset email was sent recently. Please wait before trying again."}, status=status.HTTP_429_TOO_MANY_REQUESTS)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?uid={uid}&token={token}"
        try:
            send_password_reset_email(recipient=recipient, name=user.get_full_name().strip() or user.get_username(), reset_url=reset_url)
        except (GraphMailError, ImproperlyConfigured, RequestException):
            return Response({"detail": "The reset email could not be sent. Check the Microsoft Graph configuration."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        cache.set(cooldown_key, True, settings.EMAIL_COOLDOWN_MINUTES * 60)
        return Response({"detail": "Password-reset email sent."})


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        try:
            user_id = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=user_id, is_active=True)
        except (ValueError, TypeError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"token": "This password-reset link is invalid or expired."}) from None
        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError({"token": "This password-reset link is invalid or expired."})
        try:
            validate_password(attrs["password"], user=user)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": list(error.messages)}) from error
        attrs["user"] = user
        return attrs


@method_decorator(csrf_protect, name="dispatch")
class PasswordResetConfirmView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "password_reset_confirm"

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password updated successfully."})
