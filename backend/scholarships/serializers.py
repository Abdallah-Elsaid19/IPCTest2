import base64
import binascii
from decimal import Decimal
from urllib.parse import urlparse

import phonenumbers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers

from applications.models import Application
from ipc_backend.validators import validate_identity_document, validate_image
from .models import (
    BursaryApplication,
    BursaryApplicationStatusHistory,
    ScholarshipContent,
    ScholarshipGatewayContent,
    ScholarshipPathwaysContent,
)


class ScholarshipContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipContent
        fields = [
            "hero", "commitment", "fund", "principles", "audiences_intro", "audiences", "values_intro", "values",
            "eligibility", "recipient_commitment", "application_process",
            "partners", "academic_partners", "conditions", "impact",
            "faq", "final_cta", "seo", "updated_at",
        ]
        read_only_fields = fields


class ScholarshipGatewayContentSerializer(serializers.ModelSerializer):
    gateway = serializers.SerializerMethodField()

    gateway_fields = (
        "hero",
        "partnership",
        "process",
        "funding",
        "government_funding",
        "funding_figures",
        "pathways_intro",
        "learning",
        "ai_spotlight",
        "comparison",
        "all_inclusive",
        "audiences",
        "eligibility",
        "commitment",
        "faq",
        "final_cta",
    )

    def get_gateway(self, instance):
        return {
            field: getattr(instance, field)
            for field in self.gateway_fields
        }

    class Meta:
        model = ScholarshipGatewayContent
        fields = ["gateway", "seo", "updated_at"]
        read_only_fields = fields


class ScholarshipPathwaysContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipPathwaysContent
        fields = ["modules", "pages", "updated_at"]
        read_only_fields = fields


def _required_text(value):
    value = value.strip()
    if not value:
        raise serializers.ValidationError("This field is required.")
    return value


class BursaryPersonalDetailsSerializer(serializers.Serializer):
    firstName = serializers.CharField(max_length=120, validators=[_required_text])
    lastName = serializers.CharField(max_length=120, validators=[_required_text])
    dateOfBirth = serializers.DateField()
    email = serializers.EmailField(max_length=254)
    phoneCountryIso2 = serializers.CharField(min_length=2, max_length=2)
    phoneDialCode = serializers.RegexField(r"^\+\d{1,4}$", max_length=8)
    phoneNationalNumber = serializers.RegexField(r"^[\d\s().-]+$", max_length=32)
    mobilePhoneE164 = serializers.CharField(max_length=20)
    homeAddressLine1 = serializers.CharField(max_length=255, validators=[_required_text])
    homeAddressLine2 = serializers.CharField(required=False, allow_blank=True, max_length=255)
    townOrCity = serializers.CharField(max_length=120, validators=[_required_text])
    countyOrRegion = serializers.CharField(required=False, allow_blank=True, max_length=120)
    postcode = serializers.CharField(max_length=32, validators=[_required_text])
    country = serializers.CharField(max_length=120, validators=[_required_text])
    linkedInProfileUrl = serializers.URLField(required=False, allow_blank=True, max_length=500)
    currentlyEmployed = serializers.BooleanField()
    currentProfessionalStatus = serializers.CharField(required=False, allow_blank=True, max_length=180)
    preferredContactMethod = serializers.ChoiceField(choices=BursaryApplication.ContactMethod.choices)

    def validate_dateOfBirth(self, value):
        today = timezone.localdate()
        latest_eligible = (today.year - 20, today.month, today.day)
        if (value.year, value.month, value.day) > latest_eligible:
            raise serializers.ValidationError("You must be at least 20 years old to apply.")
        return value

    def validate_email(self, value):
        return value.strip().lower()

    def validate_phoneCountryIso2(self, value):
        value = value.strip().upper()
        if value not in phonenumbers.SUPPORTED_REGIONS:
            raise serializers.ValidationError("Select a valid country calling code.")
        return value

    def validate_linkedInProfileUrl(self, value):
        if not value:
            return value
        hostname = (urlparse(value).hostname or "").lower().rstrip(".")
        if hostname != "linkedin.com" and not hostname.endswith(".linkedin.com"):
            raise serializers.ValidationError("Enter a valid LinkedIn profile URL.")
        return value

    def validate(self, attrs):
        iso2 = attrs["phoneCountryIso2"]
        try:
            parsed = phonenumbers.parse(attrs["phoneNationalNumber"], iso2)
        except phonenumbers.NumberParseException as error:
            raise serializers.ValidationError({
                "phoneNationalNumber": "Enter a valid mobile number for the selected country.",
            }) from error
        number_type = phonenumbers.number_type(parsed)
        accepted_types = {
            phonenumbers.PhoneNumberType.MOBILE,
            phonenumbers.PhoneNumberType.FIXED_LINE_OR_MOBILE,
        }
        if not phonenumbers.is_valid_number_for_region(parsed, iso2) or number_type not in accepted_types:
            raise serializers.ValidationError({
                "phoneNationalNumber": "Enter a valid mobile number for the selected country.",
            })
        expected_dial_code = f"+{parsed.country_code}"
        if attrs["phoneDialCode"] != expected_dial_code:
            raise serializers.ValidationError({
                "phoneDialCode": "The calling code does not match the selected country.",
            })
        attrs["mobilePhoneE164"] = phonenumbers.format_number(
            parsed,
            phonenumbers.PhoneNumberFormat.E164,
        )
        attrs["phoneNationalNumber"] = str(parsed.national_number)
        return attrs


class BursaryOrganisationDetailsSerializer(serializers.Serializer):
    organisationNotApplicable = serializers.BooleanField()
    organisationName = serializers.CharField(required=False, allow_blank=True, max_length=255)
    organisationWebsite = serializers.URLField(required=False, allow_blank=True, max_length=500)
    industryOrSector = serializers.CharField(required=False, allow_blank=True, max_length=180)
    organisationAddressLine1 = serializers.CharField(required=False, allow_blank=True, max_length=255)
    organisationAddressLine2 = serializers.CharField(required=False, allow_blank=True, max_length=255)
    organisationTownOrCity = serializers.CharField(required=False, allow_blank=True, max_length=120)
    organisationCountyOrRegion = serializers.CharField(required=False, allow_blank=True, max_length=120)
    organisationPostcode = serializers.CharField(required=False, allow_blank=True, max_length=32)
    organisationCountry = serializers.CharField(required=False, allow_blank=True, max_length=120)
    organisationSize = serializers.CharField(required=False, allow_blank=True, max_length=80)
    jobTitle = serializers.CharField(required=False, allow_blank=True, max_length=180)
    departmentOrBusinessUnit = serializers.CharField(required=False, allow_blank=True, max_length=180)
    employmentStartDate = serializers.DateField(required=False, allow_null=True)
    employmentType = serializers.CharField(required=False, allow_blank=True, max_length=80)
    pathwayRoleSupport = serializers.CharField(required=False, allow_blank=True, max_length=8000)


class BursaryEmergencyInformationSerializer(serializers.Serializer):
    emergencyContactFullName = serializers.CharField(max_length=180, validators=[_required_text])
    emergencyContactEmail = serializers.EmailField(max_length=254)
    emergencyContactPhone = serializers.RegexField(r"^\+?[\d\s().-]{7,40}$", max_length=40)
    hasDisabilityOrHealthCondition = serializers.BooleanField()
    healthProblemCategories = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            "physical_disability", "sensory_impairment", "mental_health",
            "long_term_health_condition", "learning_difficulty",
            "neurodivergence", "other",
        ]),
        required=False,
        allow_empty=True,
        max_length=7,
    )
    primaryHealthProblem = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    def validate(self, attrs):
        if attrs["hasDisabilityOrHealthCondition"]:
            if not attrs.get("primaryHealthProblem", "").strip():
                raise serializers.ValidationError({
                    "primaryHealthProblem": "Tell us about the support or adjustments you may need.",
                })
            attrs["healthProblemCategories"] = []
        else:
            attrs["healthProblemCategories"] = []
            attrs["primaryHealthProblem"] = ""
        return attrs


class BursaryPathwaySelectionSerializer(serializers.Serializer):
    preferredModules = serializers.ListField(
        child=serializers.ChoiceField(
            choices=BursaryApplication.PreferredModule.choices,
        ),
        allow_empty=False,
    )
    professionalMembershipsOrCertifications = serializers.CharField(required=False, allow_blank=True, max_length=8000)
    relevantExperience = serializers.CharField(required=False, allow_blank=True, default="", max_length=12000)
    pathwayFitReason = serializers.CharField(required=False, allow_blank=True, default="", max_length=12000)

    def validate_preferredModules(self, modules):
        if len(modules) != len(set(modules)):
            raise serializers.ValidationError("Select each module only once.")
        return modules


class BursaryTermsSerializer(serializers.Serializer):
    mandatoryTermsAccepted = serializers.BooleanField()
    generalMarketingConsent = serializers.BooleanField(default=False, required=False)


class BursaryReviewSerializer(serializers.Serializer):
    section1Complete = serializers.BooleanField()
    section2CompleteOrNotApplicable = serializers.BooleanField()
    section3Complete = serializers.BooleanField()
    section4Complete = serializers.BooleanField()
    section5Complete = serializers.BooleanField()
    informationAccurateDeclaration = serializers.BooleanField()
    noAwardGuaranteeDeclaration = serializers.BooleanField()
    pathwayTermsDeclaration = serializers.BooleanField()
    processingConsentDeclaration = serializers.BooleanField()
    applicantIdentityDeclaration = serializers.BooleanField()
    dateSigned = serializers.DateField()
    electronicSignature = serializers.CharField(max_length=300000)

    def validate_electronicSignature(self, value):
        prefix = "data:image/png;base64,"
        if not value.startswith(prefix):
            raise serializers.ValidationError("Draw your signature before submitting.")
        try:
            decoded = base64.b64decode(value[len(prefix):], validate=True)
        except (binascii.Error, ValueError):
            raise serializers.ValidationError("Draw your signature before submitting.")
        if not decoded or len(decoded) > 225000:
            raise serializers.ValidationError("The drawn signature is invalid or too large.")
        return value


PUBLIC_SECTION_FIELD_MAP = {
    "personalDetails": {
        "firstName": "first_name",
        "lastName": "last_name",
        "dateOfBirth": "date_of_birth",
        "email": "email",
        "phoneCountryIso2": "phone_country_iso2",
        "phoneDialCode": "phone_dial_code",
        "phoneNationalNumber": "phone_national_number",
        "mobilePhoneE164": "mobile_phone_e164",
        "homeAddressLine1": "home_address_line_1",
        "homeAddressLine2": "home_address_line_2",
        "townOrCity": "town_or_city",
        "countyOrRegion": "county_or_region",
        "postcode": "postcode",
        "country": "country",
        "linkedInProfileUrl": "linkedin_profile_url",
        "currentlyEmployed": "currently_employed",
        "currentProfessionalStatus": "current_professional_status",
        "preferredContactMethod": "preferred_contact_method",
    },
    "organisationDetails": {
        "organisationNotApplicable": "organisation_not_applicable",
        "organisationName": "organisation_name",
        "organisationWebsite": "organisation_website",
        "industryOrSector": "industry_or_sector",
        "organisationAddressLine1": "organisation_address_line_1",
        "organisationAddressLine2": "organisation_address_line_2",
        "organisationTownOrCity": "organisation_town_or_city",
        "organisationCountyOrRegion": "organisation_county_or_region",
        "organisationPostcode": "organisation_postcode",
        "organisationCountry": "organisation_country",
        "organisationSize": "organisation_size",
        "jobTitle": "job_title",
        "departmentOrBusinessUnit": "department_or_business_unit",
        "employmentStartDate": "employment_start_date",
        "employmentType": "employment_type",
        "pathwayRoleSupport": "pathway_role_support",
    },
    "emergencyInformation": {
        "emergencyContactFullName": "emergency_contact_full_name",
        "emergencyContactEmail": "emergency_contact_email",
        "emergencyContactPhone": "emergency_contact_phone",
        "hasDisabilityOrHealthCondition": "has_disability_or_health_condition",
        "healthProblemCategories": "health_problem_categories",
        "primaryHealthProblem": "primary_health_problem",
    },
    "pathwaySelection": {
        "preferredModules": "preferred_modules",
        "professionalMembershipsOrCertifications": "professional_memberships_or_certifications",
        "relevantExperience": "relevant_experience",
        "pathwayFitReason": "pathway_fit_reason",
    },
    "termsAndConsents": {
        "mandatoryTermsAccepted": "mandatory_terms_accepted",
        "generalMarketingConsent": "general_marketing_consent",
    },
    "reviewAndDeclaration": {
        "section1Complete": "section_1_complete",
        "section2CompleteOrNotApplicable": "section_2_complete_or_not_applicable",
        "section3Complete": "section_3_complete",
        "section4Complete": "section_4_complete",
        "section5Complete": "section_5_complete",
        "informationAccurateDeclaration": "information_accurate_declaration",
        "noAwardGuaranteeDeclaration": "no_award_guarantee_declaration",
        "pathwayTermsDeclaration": "pathway_terms_declaration",
        "processingConsentDeclaration": "processing_consent_declaration",
        "applicantIdentityDeclaration": "applicant_identity_declaration",
        "dateSigned": "date_signed",
        "electronicSignature": "electronic_signature",
    },
}


def bursary_application_to_public_values(application):
    values = {}
    for section_name, field_map in PUBLIC_SECTION_FIELD_MAP.items():
        section = {}
        for public_name, model_name in field_map.items():
            value = getattr(application, model_name)
            if isinstance(value, Decimal):
                value = float(value)
            elif hasattr(value, "isoformat"):
                value = value.isoformat()
            elif value is None and model_name == "employment_start_date":
                value = ""
            section[public_name] = value
        values[section_name] = section
    values["emergencyInformation"]["identityDocument"] = "existing" if application.identity_document else ""
    values["emergencyInformation"]["applicantPhoto"] = "existing" if application.applicant_photo else ""
    return values


class BursaryApplicationPublicSerializer(serializers.Serializer):
    personalDetails = BursaryPersonalDetailsSerializer()
    organisationDetails = BursaryOrganisationDetailsSerializer()
    emergencyInformation = BursaryEmergencyInformationSerializer()
    pathwaySelection = BursaryPathwaySelectionSerializer()
    termsAndConsents = BursaryTermsSerializer()
    reviewAndDeclaration = BursaryReviewSerializer()
    identityDocument = serializers.FileField(
        write_only=True,
        required=False,
        validators=[validate_identity_document],
    )
    applicantPhoto = serializers.ImageField(
        write_only=True,
        required=False,
        validators=[validate_image],
    )

    mandatory_review = (
        "section1Complete", "section2CompleteOrNotApplicable", "section3Complete",
        "section4Complete", "section5Complete", "informationAccurateDeclaration",
        "noAwardGuaranteeDeclaration", "pathwayTermsDeclaration",
        "processingConsentDeclaration", "applicantIdentityDeclaration",
    )

    def to_internal_value(self, data):
        personal = data.get("personalDetails", {}) if isinstance(data, dict) else {}
        if personal.get("currentlyEmployed") is False:
            data = data.copy()
            data["organisationDetails"] = {
                "organisationNotApplicable": True,
                "organisationName": "",
                "organisationWebsite": "",
                "industryOrSector": "",
                "organisationAddressLine1": "",
                "organisationAddressLine2": "",
                "organisationTownOrCity": "",
                "organisationCountyOrRegion": "",
                "organisationPostcode": "",
                "organisationCountry": "",
                "organisationSize": "",
                "jobTitle": "",
                "departmentOrBusinessUnit": "",
                "employmentStartDate": None,
                "employmentType": "",
                "pathwayRoleSupport": "",
            }
        return super().to_internal_value(data)

    def validate(self, attrs):
        personal = attrs["personalDetails"]
        organisation = attrs["organisationDetails"]
        terms = attrs["termsAndConsents"]
        review = attrs["reviewAndDeclaration"]
        errors = {}

        if personal["currentlyEmployed"]:
            if organisation["organisationNotApplicable"]:
                errors["organisationDetails"] = {
                    "organisationNotApplicable": "Employed applicants must complete organisation details.",
                }
            organisation_errors = {}
            if not organisation.get("organisationName", "").strip():
                organisation_errors["organisationName"] = "Organisation name is required when employed."
            if not organisation.get("jobTitle", "").strip():
                organisation_errors["jobTitle"] = "Your job title is required when employed."
            if organisation_errors:
                errors.setdefault("organisationDetails", {}).update(organisation_errors)
        elif not organisation["organisationNotApplicable"]:
            errors["organisationDetails"] = {
                "organisationNotApplicable": "Mark organisation details not applicable when you are not employed.",
            }

        if terms.get("mandatoryTermsAccepted") is not True:
            errors.setdefault("termsAndConsents", {})["mandatoryTermsAccepted"] = (
                "Accept all mandatory terms before continuing."
            )

        if not self.instance and not attrs.get("identityDocument"):
            errors.setdefault("emergencyInformation", {})["identityDocument"] = (
                "Upload a government-issued proof of identification."
            )
        missing_review = {
            field: "You must confirm this item."
            for field in self.mandatory_review
            if review.get(field) is not True
        }
        if missing_review:
            errors.setdefault("reviewAndDeclaration", {}).update(missing_review)
        if errors:
            raise serializers.ValidationError(errors)
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        identity_document = validated_data.pop("identityDocument", None)
        applicant_photo = validated_data.pop("applicantPhoto", None)
        model_values = {}
        for section_name, field_map in PUBLIC_SECTION_FIELD_MAP.items():
            section_data = validated_data[section_name]
            for public_name, model_name in field_map.items():
                if public_name in section_data:
                    model_values[model_name] = section_data[public_name]
        now = timezone.now()
        model_values["submitted_at"] = now
        model_values["terms_accepted_at"] = now
        model_values["declarations_accepted_at"] = now
        membership_application = self.context.get("membership_application")
        model_values["membership_reference"] = (
            membership_application.application_reference if membership_application else ""
        )
        model_values["submitted_by"] = self.context.get("submitted_by")
        model_values.update({
            "linkedin_award_post_consent": True,
            "second_progress_post_consent": True,
            "tag_ipc_consent": True,
            "reshare_and_quote_consent": True,
            "professional_headshot_consent": True,
            "participation_consent": True,
            "approved_media_use_consent": True,
            "report_restrictions_consent": True,
        })
        if identity_document:
            model_values["identity_document"] = identity_document
        if applicant_photo:
            model_values["applicant_photo"] = applicant_photo
        application = BursaryApplication.objects.create(**model_values)
        BursaryApplicationStatusHistory.objects.create(
            application=application,
            previous_status="",
            new_status=BursaryApplication.Status.SUBMITTED,
            internal_reason="Application submitted.",
        )
        return application

    @transaction.atomic
    def update(self, instance, validated_data):
        changed_by = validated_data.pop("changed_by", None)
        identity_document = validated_data.pop("identityDocument", None)
        applicant_photo = validated_data.pop("applicantPhoto", None)
        previous_status = instance.status
        model_values = {}
        for section_name, field_map in PUBLIC_SECTION_FIELD_MAP.items():
            section_data = validated_data[section_name]
            for public_name, model_name in field_map.items():
                if public_name in section_data:
                    model_values[model_name] = section_data[public_name]

        now = timezone.now()
        for model_name, value in model_values.items():
            setattr(instance, model_name, value)
        if identity_document:
            instance.identity_document = identity_document
        if applicant_photo:
            instance.applicant_photo = applicant_photo
        instance.status = BursaryApplication.Status.UNDER_REVIEW
        instance.submitted_at = now
        instance.terms_accepted_at = now
        instance.declarations_accepted_at = now
        instance.save()
        BursaryApplicationStatusHistory.objects.create(
            application=instance,
            previous_status=previous_status,
            new_status=BursaryApplication.Status.UNDER_REVIEW,
            changed_by=changed_by,
            internal_reason="Applicant resubmitted the requested information.",
        )
        return instance

    def to_representation(self, instance):
        return {
            "id": instance.pk,
            "applicationReference": instance.application_reference,
            "status": instance.status,
            "submittedAt": instance.submitted_at.isoformat(),
        }


class BursaryStatusHistorySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = BursaryApplicationStatusHistory
        fields = [
            "id", "previous_status", "new_status", "changed_by",
            "changed_by_name", "internal_reason", "changed_at",
        ]
        read_only_fields = fields

    def get_changed_by_name(self, history):
        user = history.changed_by
        return (user.get_full_name().strip() or user.get_username()) if user else ""


class BursaryApplicationListSerializer(serializers.ModelSerializer):
    applicant_name = serializers.SerializerMethodField()
    preferred_pathway_label = serializers.CharField(source="get_bursary_selection_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = BursaryApplication
        fields = [
            "id", "application_reference", "membership_reference", "applicant_name", "email",
            "mobile_phone_e164", "country", "currently_employed", "organisation_name",
            "preferred_pathway", "preferred_modules", "preferred_pathway_label", "status", "status_label", "submitted_at",
        ]
        read_only_fields = fields

    def get_applicant_name(self, application):
        return f"{application.first_name} {application.last_name}".strip()


class ScholarshipAnnouncementRecipientSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    award = serializers.CharField(source="get_bursary_selection_display", read_only=True)
    modules = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    year = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = BursaryApplication
        fields = [
            "id",
            "name",
            "award",
            "country",
            "modules",
            "category",
            "year",
            "photo_url",
        ]
        read_only_fields = fields

    def get_name(self, application):
        first_name = application.preferred_name.strip() or application.first_name.strip()
        return f"{first_name} {application.last_name.strip()}".strip()

    def get_modules(self, application):
        module_labels = dict(BursaryApplication.PreferredModule.choices)
        return [
            module_labels[module]
            for module in application.preferred_modules
            if module in module_labels
        ]

    def get_category(self, application):
        return "IPC Scholarship Fund"

    def get_year(self, application):
        return 2026

    def get_photo_url(self, application):
        if not application.applicant_photo or not application.professional_headshot_consent:
            return ""
        return f"/api/scholarship-announcement/recipients/{application.pk}/photo"


class BursaryApplicationDetailSerializer(serializers.ModelSerializer):
    preferred_pathway_label = serializers.CharField(source="get_bursary_selection_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    assigned_reviewer_name = serializers.SerializerMethodField()
    status_history = BursaryStatusHistorySerializer(many=True, read_only=True)
    identity_document = serializers.SerializerMethodField()
    applicant_photo = serializers.SerializerMethodField()

    class Meta:
        model = BursaryApplication
        fields = "__all__"

    def get_assigned_reviewer_name(self, application):
        user = application.assigned_reviewer
        return (user.get_full_name().strip() or user.get_username()) if user else ""

    def get_identity_document(self, application):
        return f"/api/admin/bursary-applications/{application.pk}/identity-document" if application.identity_document else ""

    def get_applicant_photo(self, application):
        return f"/api/admin/bursary-applications/{application.pk}/applicant-photo" if application.applicant_photo else ""


class BursaryApplicationStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=BursaryApplication.Status.choices)
    internal_reason = serializers.CharField(required=False, allow_blank=True, max_length=4000)
    assigned_reviewer = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.filter(is_active=True, is_staff=True),
        required=False,
        allow_null=True,
    )

    def validate(self, attrs):
        internal_reason = attrs.get("internal_reason", "").strip()
        if (
            attrs["status"] in (
                BursaryApplication.Status.REJECTED,
                BursaryApplication.Status.NEEDS_INFORMATION,
            )
            and not internal_reason
        ):
            raise serializers.ValidationError({
                "internal_reason": "Enter the message that will be sent to the applicant.",
            })
        attrs["internal_reason"] = internal_reason
        return attrs


class BursaryApplicationNoteSerializer(serializers.Serializer):
    reviewer_internal_notes = serializers.CharField(allow_blank=True, max_length=12000)
