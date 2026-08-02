import os
import re
from pathlib import Path
from uuid import uuid4

import phonenumbers
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
UK_TELEPHONE_ERROR = "Enter a valid UK telephone number, for example 07700 900123 or +44 7700 900123."
INTERNATIONAL_TELEPHONE_ERROR = (
    "Enter a valid telephone number with its country calling code, "
    "for example +20 106 705 5973 or +44 7700 900123."
)


def clean_text(value):
    if value is None:
        return value
    return re.sub(r"[<>]", "", str(value)).strip()


def normalise_uk_telephone(value):
    """Validate a UK number and return its canonical +44 E.164 representation."""
    compact = re.sub(r"[\s().-]", "", clean_text(value) or "")
    if compact.startswith("0044"):
        compact = f"+44{compact[4:]}"
    if compact.startswith("+440"):
        compact = f"+44{compact[4:]}"
    elif compact.startswith("0"):
        compact = f"+44{compact[1:]}"
    # UK national numbers use 01 (excluding the unallocated 010 range),
    # 02, 03, 07, 08 or 09 prefixes after the domestic trunk zero.
    if not re.fullmatch(r"\+44(?:1[1-9]\d{8}|[23789]\d{9})", compact):
        raise ValidationError(UK_TELEPHONE_ERROR)
    return compact


def validate_uk_telephone(value):
    normalise_uk_telephone(value)


def normalise_international_telephone(value):
    """Return a possible international telephone number in canonical E.164 format."""
    compact = re.sub(r"[\s().-]", "", clean_text(value) or "")
    if compact.startswith("00"):
        compact = f"+{compact[2:]}"
    if not compact.startswith("+"):
        # Preserve support for existing UK national-format membership records.
        try:
            return normalise_uk_telephone(compact)
        except ValidationError:
            raise ValidationError(INTERNATIONAL_TELEPHONE_ERROR)
    try:
        parsed = phonenumbers.parse(compact, None)
    except phonenumbers.NumberParseException as error:
        raise ValidationError(INTERNATIONAL_TELEPHONE_ERROR) from error
    if not phonenumbers.is_possible_number(parsed):
        raise ValidationError(INTERNATIONAL_TELEPHONE_ERROR)
    return phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)


def validate_international_telephone(value):
    normalise_international_telephone(value)


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


def profile_image_upload_to(instance, filename):
    ext = Path(filename).suffix.lower()
    return os.path.join("profiles", str(instance.user_id or "pending"), f"{uuid4().hex}{ext}")


def bursary_identity_upload_to(instance, filename):
    ext = Path(filename).suffix.lower()
    return os.path.join("bursary-applications", "identity", str(instance.pk or "pending"), f"{uuid4().hex}{ext}")


def bursary_photo_upload_to(instance, filename):
    ext = Path(filename).suffix.lower()
    return os.path.join("bursary-applications", "photos", str(instance.pk or "pending"), f"{uuid4().hex}{ext}")


def validate_identity_document(file):
    try:
        validate_upload(file)
        return
    except ValidationError:
        file.seek(0)
    try:
        validate_image(file)
    except ValidationError as error:
        raise ValidationError(
            "Upload a PDF, DOC, DOCX, JPG, JPEG, PNG or WebP identity document."
        ) from error


def validate_content_section(value):
    if not isinstance(value, (dict, list)):
        raise ValidationError("Content sections must be an object or a list.")
