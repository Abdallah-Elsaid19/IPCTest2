import os
import re
from pathlib import Path
from uuid import uuid4
from django.core.exceptions import ValidationError

ALLOWED_UPLOAD_EXTENSIONS = {".pdf", ".doc", ".docx"}
ALLOWED_UPLOAD_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_IMAGE_CONTENT_TYPES = {"image/png", "image/jpeg", "image/webp"}
MAX_UPLOAD_SIZE = 10 * 1024 * 1024
MAX_IMAGE_SIZE = 2 * 1024 * 1024


def clean_text(value):
    if value is None:
        return value
    return re.sub(r"[<>]", "", str(value)).strip()


def validate_upload(file):
    if not file or not getattr(file, "size", 0):
        raise ValidationError("Please upload the required file.")
    ext = Path(file.name).suffix.lower()
    if ext not in ALLOWED_UPLOAD_EXTENSIONS:
        raise ValidationError("Only PDF, DOC, and DOCX files are allowed.")
    content_type = getattr(file, "content_type", "")
    if content_type and content_type not in ALLOWED_UPLOAD_CONTENT_TYPES:
        raise ValidationError("The uploaded document content type is not supported.")
    if file.size > MAX_UPLOAD_SIZE:
        raise ValidationError("File must be less than 10MB.")
    header = file.read(8)
    file.seek(0)
    signatures = {
        ".pdf": (b"%PDF-",),
        ".doc": (b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",),
        ".docx": (b"PK\x03\x04",),
    }
    if not any(header.startswith(signature) for signature in signatures[ext]):
        raise ValidationError("The uploaded file content does not match its extension.")


def validate_image(file):
    if not file or not getattr(file, "size", 0):
        raise ValidationError("Please upload an image.")
    ext = Path(file.name).suffix.lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError("Only JPG, JPEG, PNG, and WebP images are allowed.")
    content_type = getattr(file, "content_type", "")
    if content_type and content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise ValidationError("The uploaded image content type is not supported.")
    if file.size > MAX_IMAGE_SIZE:
        raise ValidationError("Image must be less than 2MB.")


def evidence_upload_to(instance, filename):
    ext = Path(filename).suffix.lower()
    return os.path.join("applications", str(instance.application_id or "pending"), f"{uuid4().hex}{ext}")


def media_upload_to(instance, filename):
    ext = Path(filename).suffix.lower()
    return os.path.join("media-library", f"{uuid4().hex}{ext}")
