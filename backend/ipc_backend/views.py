from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET


@require_GET
@ensure_csrf_cookie
def csrf_cookie(request):
    """Set Django's CSRF cookie without exposing any application secrets."""
    return JsonResponse({"detail": "CSRF cookie set."})
