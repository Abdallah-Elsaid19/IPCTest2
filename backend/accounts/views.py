from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer, UserSerializer


User = get_user_model()


def _set_auth_cookies(response, refresh):
    access = refresh.access_token
    common = {
        "httponly": True,
        "secure": settings.AUTH_COOKIE_SECURE,
        "samesite": settings.AUTH_COOKIE_SAMESITE,
        "domain": settings.AUTH_COOKIE_DOMAIN,
    }
    response.set_cookie(
        settings.AUTH_COOKIE_ACCESS,
        str(access),
        max_age=int(access.lifetime.total_seconds()),
        path="/",
        **common,
    )
    response.set_cookie(
        settings.AUTH_COOKIE_REFRESH,
        str(refresh),
        max_age=int(refresh.lifetime.total_seconds()),
        path="/api/auth/",
        **common,
    )


def _clear_auth_cookies(response):
    common = {
        "domain": settings.AUTH_COOKIE_DOMAIN,
        "samesite": settings.AUTH_COOKIE_SAMESITE,
    }
    response.delete_cookie(settings.AUTH_COOKIE_ACCESS, path="/", **common)
    response.delete_cookie(settings.AUTH_COOKIE_REFRESH, path="/api/auth/", **common)


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        update_last_login(None, user)
        response = Response({"user": UserSerializer(user).data})
        _set_auth_cookies(response, refresh)
        get_token(request)
        return response


@method_decorator(csrf_protect, name="dispatch")
class RefreshView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_refresh"

    def post(self, request):
        raw_refresh = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        if not raw_refresh:
            return Response({"detail": "Authentication required."}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(raw_refresh)
            user = User._default_manager.get(pk=refresh["user_id"], is_active=True)
            refresh.blacklist()
            rotated = RefreshToken.for_user(user)
        except (TokenError, User.DoesNotExist):
            response = Response({"detail": "Session expired."}, status=status.HTTP_401_UNAUTHORIZED)
            _clear_auth_cookies(response)
            return response

        response = Response(status=status.HTTP_204_NO_CONTENT)
        _set_auth_cookies(response, rotated)
        return response


@method_decorator(csrf_protect, name="dispatch")
class LogoutView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        raw_refresh = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        if raw_refresh:
            try:
                RefreshToken(raw_refresh).blacklist()
            except TokenError:
                pass
        response = Response(status=status.HTTP_204_NO_CONTENT)
        _clear_auth_cookies(response)
        return response


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"user": UserSerializer(request.user).data})
