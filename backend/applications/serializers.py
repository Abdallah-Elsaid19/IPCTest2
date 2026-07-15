import re

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from ipc_backend.validators import clean_text, validate_upload
from memberships.models import MembershipGrade

from .models import (
    Application,
    ApplicationEvidence,
    ApplicationReference,
    ApplicationStatusHistory,
    FormDefinition,
    ReviewerNote,
)


LEGACY_DETAIL_FIELDS = (
    "job_title",
    "years_experience",
    "professional_background",
    "professional_statement",
    "cpd_evidence",
    "work_evidence",
    "references_text",
)


class ApplicationEvidenceSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.CharField(source="uploaded_by.get_username", read_only=True)

    class Meta:
        model = ApplicationEvidence
        fields = ["id", "evidence_type", "original_name", "file_url", "content_type", "file_size", "uploaded_by_name", "uploaded_at", "updated_at"]
        read_only_fields = fields

    def get_file_url(self, obj):
        request = self.context.get("request")
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else ""


class ApplicationReferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationReference
        fields = ["id", "name", "email", "organisation", "relationship", "notes", "created_at"]
        read_only_fields = ["id", "created_at"]


class ReviewerNoteSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.get_username", read_only=True)

    class Meta:
        model = ReviewerNote
        fields = ["id", "author_name", "note", "is_internal", "created_at"]
        read_only_fields = fields


class ApplicationStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(source="changed_by.get_username", read_only=True)

    class Meta:
        model = ApplicationStatusHistory
        fields = ["id", "from_status", "to_status", "changed_by_name", "note", "created_at"]
        read_only_fields = fields


class ApplicationSerializer(serializers.ModelSerializer):
    grade = serializers.CharField(write_only=True)
    application_id = serializers.IntegerField(source="pk", read_only=True)
    membership_grade_code = serializers.CharField(source="membership_grade.code", read_only=True)
    form_definition_code = serializers.CharField(source="form_definition.code", read_only=True)
    cv = serializers.FileField(write_only=True, required=False, allow_null=False, allow_empty_file=False, validators=[validate_upload])
    cpd_file = serializers.FileField(write_only=True, required=False, allow_null=False, allow_empty_file=False, validators=[validate_upload])
    work_file = serializers.FileField(write_only=True, required=False, allow_null=False, allow_empty_file=False, validators=[validate_upload])
    references_file = serializers.FileField(write_only=True, required=False, allow_null=False, allow_empty_file=False, validators=[validate_upload])
    evidence = serializers.FileField(write_only=True, required=False, allow_null=False, allow_empty_file=False, validators=[validate_upload])
    evidence_files = ApplicationEvidenceSerializer(many=True, read_only=True)
    reviewer_notes = ReviewerNoteSerializer(many=True, read_only=True)
    status_history = ApplicationStatusHistorySerializer(many=True, read_only=True)
    application_references = ApplicationReferenceSerializer(source="references", many=True, read_only=True)

    for _field_name in LEGACY_DETAIL_FIELDS:
        locals()[_field_name] = serializers.CharField(write_only=True, required=False, allow_blank=True)
    del _field_name

    class Meta:
        model = Application
        fields = [
            "id", "application_id", "application_reference", "created_at", "updated_at", "submitted_at", "status",
            "grade", "membership_grade_code", "form_definition_code", "form_version", "first_name", "last_name",
            "email", "phone", "country", "organisation", "contact_preference", "grade_specific_data",
            *LEGACY_DETAIL_FIELDS, "code_of_conduct_consent", "privacy_consent", "cv", "cpd_file", "work_file",
            "references_file", "evidence", "evidence_files", "application_references", "reviewer_notes", "status_history",
        ]
        read_only_fields = [
            "id", "application_id", "application_reference", "created_at", "updated_at", "submitted_at", "status",
            "membership_grade_code", "form_definition_code", "form_version", "evidence_files", "application_references",
            "reviewer_notes", "status_history",
        ]

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation["grade"] = instance.membership_grade.code
        for field in LEGACY_DETAIL_FIELDS:
            representation[field] = instance.grade_specific_data.get(field, "")
        return representation

    def validate(self, attrs):
        explicit_specific_data = "grade_specific_data" in attrs
        detail_data = dict(attrs.get("grade_specific_data") or {})
        if not isinstance(detail_data, dict):
            raise serializers.ValidationError({"grade_specific_data": "Must be a JSON object."})

        text_fields = ["first_name", "last_name", "phone", "country", "organisation", *LEGACY_DETAIL_FIELDS]
        for field in text_fields:
            if field in attrs:
                attrs[field] = clean_text(attrs[field])
        for key, value in list(detail_data.items()):
            if isinstance(value, str):
                detail_data[key] = clean_text(value)

        errors = {}
        if not attrs.get("code_of_conduct_consent", getattr(self.instance, "code_of_conduct_consent", False)):
            errors["code_of_conduct_consent"] = "Consent to the code of conduct is required."

        for field, label in (("first_name", "First name"), ("last_name", "Last name")):
            value = attrs.get(field, getattr(self.instance, field, ""))
            if not value:
                errors[field] = f"{label} is required."
            elif not re.fullmatch("[A-Za-z\\u00C0-\\u024F\\u0600-\\u06FF' -]+", value):
                errors[field] = f"{label} can contain letters, spaces, apostrophes and hyphens only."

        email = attrs.get("email", getattr(self.instance, "email", ""))
        if email:
            attrs["email"] = email.strip().lower()
            try:
                validate_email(attrs["email"])
            except DjangoValidationError:
                errors["email"] = "Enter a valid email address."

        grade_code = attrs.get("grade") or (self.instance.membership_grade.code if self.instance else None)
        try:
            grade = MembershipGrade.objects.get(code=grade_code, is_active=True)
        except MembershipGrade.DoesNotExist:
            errors["grade"] = "Select an active membership grade."
            grade = None

        form_definition = None
        if grade:
            form_definition = FormDefinition.objects.filter(code=grade.code, is_active=True).order_by("-version").first()
            if not form_definition:
                errors["grade"] = "No active application form is configured for this membership grade."

        required_uploads = {
            "AffIPC": ("cv", "evidence"),
            "MIPC": ("cv", "cpd_file"),
            "AFIPC_L3": ("cv", "cpd_file", "work_file"),
            "AFIPC_L4": ("cv", "cpd_file", "work_file", "evidence"),
            "FIPC": ("cv", "cpd_file", "work_file", "evidence"),
        }
        if not self.instance and grade_code in required_uploads:
            for upload_field in required_uploads[grade_code]:
                if not attrs.get(upload_field):
                    errors[upload_field] = "Please upload the required file."

        for field in LEGACY_DETAIL_FIELDS:
            if field in attrs:
                detail_data[field] = attrs[field]

        if explicit_specific_data and form_definition:
            schema_errors = self._validate_specific_data(detail_data, form_definition.validation_schema)
            if schema_errors:
                errors["grade_specific_data"] = schema_errors
        elif not self.instance:
            for field in ("professional_background", "professional_statement"):
                value = detail_data.get(field, "")
                if len(value) < 20:
                    errors[field] = "Enter at least 20 characters."

        if errors:
            raise serializers.ValidationError(errors)

        attrs["grade_specific_data"] = detail_data
        attrs["_resolved_grade"] = grade
        attrs["_resolved_form_definition"] = form_definition
        for field in LEGACY_DETAIL_FIELDS:
            attrs.pop(field, None)
        return attrs

    @staticmethod
    def _validate_specific_data(data, schema):
        errors = {}
        for field in schema.get("required", []):
            value = data.get(field)
            if value is None or value == "" or value == [] or value is False:
                errors[field] = "This field is required."
        for field, rules in schema.get("properties", {}).items():
            value = data.get(field)
            if value in (None, ""):
                continue
            expected_type = rules.get("type")
            if expected_type == "string" and not isinstance(value, str):
                errors[field] = "Must be text."
            elif expected_type == "array" and not isinstance(value, list):
                errors[field] = "Must be a list."
            elif isinstance(value, str):
                if rules.get("minLength") and len(value) < rules["minLength"]:
                    errors[field] = f"Enter at least {rules['minLength']} characters."
                if rules.get("maxLength") and len(value) > rules["maxLength"]:
                    errors[field] = f"Enter no more than {rules['maxLength']} characters."
        return errors

    @transaction.atomic
    def create(self, validated_data):
        uploads = self._pop_uploads(validated_data)
        grade = validated_data.pop("_resolved_grade")
        form_definition = validated_data.pop("_resolved_form_definition")
        validated_data.pop("grade", None)
        application = Application.objects.create(
            membership_grade=grade,
            form_definition=form_definition,
            form_version=form_definition.version,
            **validated_data,
        )
        self._create_evidence(application, uploads)
        return application

    @transaction.atomic
    def update(self, instance, validated_data):
        uploads = self._pop_uploads(validated_data)
        grade = validated_data.pop("_resolved_grade", instance.membership_grade)
        form_definition = validated_data.pop("_resolved_form_definition", instance.form_definition)
        validated_data.pop("grade", None)
        instance.membership_grade = grade
        instance.form_definition = form_definition
        instance.form_version = form_definition.version
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        self._create_evidence(instance, uploads)
        return instance

    @staticmethod
    def _pop_uploads(validated_data):
        return {
            "cv": validated_data.pop("cv", None),
            "cpd": validated_data.pop("cpd_file", None),
            "work": validated_data.pop("work_file", None),
            "references": validated_data.pop("references_file", None),
            "other": validated_data.pop("evidence", None),
        }

    def _create_evidence(self, application, uploads):
        request = self.context.get("request")
        uploader = request.user if request and request.user.is_authenticated else None
        for evidence_type, file in uploads.items():
            if file:
                ApplicationEvidence.objects.create(
                    application=application,
                    evidence_type=evidence_type,
                    file=file,
                    original_name=file.name,
                    content_type=getattr(file, "content_type", ""),
                    file_size=getattr(file, "size", 0),
                    uploaded_by=uploader,
                )


class AdminApplicationSerializer(ApplicationSerializer):
    reviewer_note = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta(ApplicationSerializer.Meta):
        fields = ApplicationSerializer.Meta.fields + ["reviewed_by", "reviewed_at", "reviewer_note"]
        read_only_fields = [
            "id", "application_id", "application_reference", "created_at", "updated_at", "submitted_at",
            "membership_grade_code", "form_definition_code", "form_version", "evidence_files", "application_references",
            "reviewer_notes", "status_history",
            "reviewed_by", "reviewed_at",
        ]

    def update(self, instance, validated_data):
        note = clean_text(validated_data.pop("reviewer_note", ""))
        request = self.context.get("request")
        user = request.user if request and request.user.is_authenticated else None
        if "status" in validated_data and validated_data["status"] != instance.status:
            instance.reviewed_by = user or instance.reviewed_by
            instance.reviewed_at = timezone.now()
            instance._changed_by = user
            instance._status_note = note
        instance = super().update(instance, validated_data)
        if note:
            ReviewerNote.objects.create(application=instance, author=user, note=note)
        return instance
