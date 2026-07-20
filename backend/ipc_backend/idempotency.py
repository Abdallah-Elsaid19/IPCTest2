import hashlib
import re
from datetime import timedelta

from django.db import IntegrityError, OperationalError, ProgrammingError, transaction
from django.http import HttpResponse, JsonResponse, RawPostDataException
from django.utils import timezone

from accounts.models import ApiIdempotencyRecord


class IdempotencyMiddleware:
    """Replay completed unsafe API actions that use the same client action key."""

    def __init__(self, get_response):
        self.get_response = get_response

    @staticmethod
    def _fingerprint(request):
        supplied = (request.headers.get("Idempotency-Fingerprint") or "").strip()
        if supplied:
            return supplied[:128]
        try:
            payload = request.body
        except RawPostDataException:
            payload = b""
        return hashlib.sha256(payload).hexdigest()

    @staticmethod
    def _replay(record):
        response = HttpResponse(
            bytes(record.response_body),
            status=record.response_status,
            content_type=record.response_content_type,
        )
        response["Idempotency-Replayed"] = "true"
        return response

    def __call__(self, request):
        key = (request.headers.get("Idempotency-Key") or "").strip()
        if (
            not key
            or request.method not in {"POST", "PUT", "PATCH", "DELETE"}
            or not request.path.startswith("/api/")
            or request.path.startswith("/api/auth/")
            # Event registration already has domain-level idempotency tied to
            # the event and registration payload.
            or re.fullmatch(r"/api/events/[^/]+/register/?", request.path)
        ):
            return self.get_response(request)
        if len(key) < 16 or len(key) > 72:
            return JsonResponse(
                {"idempotency_key": "Idempotency-Key must contain 16 to 72 characters."},
                status=400,
            )

        fingerprint = self._fingerprint(request)
        now = timezone.now()
        user_identifier = str(request.user.pk) if request.user.is_authenticated else ""
        try:
            with transaction.atomic():
                record = ApiIdempotencyRecord.objects.create(
                    key=key,
                    method=request.method,
                    path=request.path,
                    fingerprint=fingerprint,
                    user_identifier=user_identifier,
                    expires_at=now + timedelta(hours=24),
                )
            owns_action = True
        except (OperationalError, ProgrammingError):
            # Deployments can briefly run application code before the new
            # migration has reached the database. Never break the underlying
            # write operation during that window.
            return self.get_response(request)
        except IntegrityError:
            record = ApiIdempotencyRecord.objects.filter(key=key).first()
            if record is None:
                return JsonResponse({"detail": "The action could not be deduplicated. Please retry."}, status=409)
            if record.expires_at <= now:
                record.delete()
                return self.__call__(request)
            if (
                record.method != request.method
                or record.path != request.path
                or record.fingerprint != fingerprint
            ):
                return JsonResponse(
                    {"detail": "This Idempotency-Key was already used for a different request."},
                    status=409,
                )
            if record.processing_status == ApiIdempotencyRecord.ProcessingStatus.COMPLETED:
                return self._replay(record)
            response = JsonResponse({"detail": "This action is already being processed."}, status=409)
            response["Retry-After"] = "1"
            return response

        try:
            response = self.get_response(request)
        except Exception:
            if owns_action:
                record.delete()
            raise

        if (
            getattr(response, "streaming", False)
            or response.status_code in {401, 403}
            or response.status_code >= 500
        ):
            record.delete()
            return response

        if hasattr(response, "render") and not getattr(response, "is_rendered", True):
            response.render()

        record.processing_status = ApiIdempotencyRecord.ProcessingStatus.COMPLETED
        record.response_status = response.status_code
        record.response_body = response.content
        record.response_content_type = response.get("Content-Type", "application/json")
        record.save(update_fields=[
            "processing_status",
            "response_status",
            "response_body",
            "response_content_type",
            "updated_at",
        ])
        return response
