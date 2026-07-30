from urllib.parse import urlparse

import phonenumbers
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import serializers

from applications.models import Application
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
        fields = ["pages", "updated_at"]
        read_only_fields = fields


def _required_text(value):
    value = value.strip()
    if not value:
        raise serializers.ValidationError("This field is required.")
    return value


class BursaryPersonalDetailsSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, allow_blank=True, max_length=40)
    membershipReference = serializers.CharField(max_length=40, validators=[_required_text])
    firstName = serializers.CharField(max_length=120, validators=[_required_text])
    lastName = serializers.CharField(max_length=120, validators=[_required_text])
    preferredName = serializers.CharField(required=False, allow_blank=True, max_length=120)
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
    linkedInProfileUrl = serializers.URLField(max_length=500)
    currentlyEmployed = serializers.BooleanField()
    currentProfessionalStatus = serializers.CharField(required=False, allow_blank=True, max_length=180)
    preferredContactMethod = serializers.ChoiceField(choices=BursaryApplication.ContactMethod.choices)

    def validate_dateOfBirth(self, value):
        if value >= timezone.localdate():
            raise serializers.ValidationError("Enter a valid date of birth in the past.")
        return value

    def validate_email(self, value):
        return value.strip().lower()

    def validate_phoneCountryIso2(self, value):
        value = value.strip().upper()
        if value not in phonenumbers.SUPPORTED_REGIONS:
            raise serializers.ValidationError("Select a valid country calling code.")
        return value

    def validate_linkedInProfileUrl(self, value):
        hostname = (urlparse(value).hostname or "").lower().rstrip(".")
        if hostname != "linkedin.com" and not hostname.endswith(".linkedin.com"):
            raise serializers.ValidationError("Enter a valid LinkedIn profile URL.")
        return value

    def validate(self, attrs):
        membership = Application.objects.filter(
            application_reference__iexact=attrs["membershipReference"].strip(),
            email__iexact=attrs["email"],
        ).only("application_reference").first()
        if membership is None:
            raise serializers.ValidationError({
                "membershipReference": (
                    "Enter a valid membership reference that matches your email address."
                ),
            })
        attrs["membershipReference"] = membership.application_reference
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
    lineManagerName = serializers.CharField(required=False, allow_blank=True, max_length=180)
    lineManagerEmail = serializers.EmailField(required=False, allow_blank=True)
    employerAwareness = serializers.ChoiceField(
        choices=BursaryApplication.EmployerAwareness.choices,
        required=False,
        allow_blank=True,
    )
    pathwayRoleSupport = serializers.CharField(required=False, allow_blank=True, max_length=8000)


class BursaryRequestSerializer(serializers.Serializer):
    quotedPathwayCostGbp = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True,
    )
    bursaryAmountRequestedGbp = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
    requestedBursaryPercentage = serializers.DecimalField(
        max_digits=5, decimal_places=2, min_value=0, max_value=100,
    )
    otherContributionAvailableGbp = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0, required=False, allow_null=True,
    )
    proceedWithLowerBursary = serializers.ChoiceField(choices=BursaryApplication.LowerBursaryResponse.choices)
    financialCircumstances = serializers.CharField(max_length=12000, validators=[_required_text])
    scholarshipOutcome = serializers.CharField(max_length=12000, validators=[_required_text])
    measurableResult = serializers.CharField(max_length=12000, validators=[_required_text])
    learningApplicationAndContribution = serializers.CharField(max_length=12000, validators=[_required_text])


class BursaryPathwaySelectionSerializer(serializers.Serializer):
    preferredPathway = serializers.ChoiceField(choices=BursaryApplication.PreferredPathway.choices)
    preferredStartMonthOrIntake = serializers.CharField(max_length=120, validators=[_required_text])
    highestRelevantQualification = serializers.CharField(required=False, allow_blank=True, max_length=255)
    professionalMembershipsOrCertifications = serializers.CharField(required=False, allow_blank=True, max_length=8000)
    relevantExperience = serializers.CharField(max_length=12000, validators=[_required_text])
    pathwayFitReason = serializers.CharField(max_length=12000, validators=[_required_text])


class BursaryTermsSerializer(serializers.Serializer):
    linkedInAwardPostConsent = serializers.BooleanField()
    secondProgressPostConsent = serializers.BooleanField()
    tagIpcConsent = serializers.BooleanField()
    reshareAndQuoteConsent = serializers.BooleanField()
    professionalHeadshotConsent = serializers.BooleanField()
    participationConsent = serializers.BooleanField()
    approvedMediaUseConsent = serializers.BooleanField()
    reportRestrictionsConsent = serializers.BooleanField()
    publicityRestrictions = serializers.ListField(
        child=serializers.ChoiceField(choices=[
            "none_declared", "safeguarding", "accessibility", "religious",
            "security", "confidentiality", "employer_related", "other",
        ]),
        allow_empty=False,
        max_length=8,
    )
    publicityRestrictionDetails = serializers.CharField(required=False, allow_blank=True, max_length=8000)
    professionalHeadshotReference = serializers.CharField(required=False, allow_blank=True, max_length=500)
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
    fullLegalName = serializers.CharField(max_length=255, validators=[_required_text])
    dateSigned = serializers.DateField()
    electronicSignature = serializers.CharField(max_length=255, validators=[_required_text])
    signaturePlace = serializers.CharField(max_length=180, validators=[_required_text])
    preferredSecureSubmissionReference = serializers.CharField(required=False, allow_blank=True, max_length=180)
    additionalReviewInformation = serializers.CharField(required=False, allow_blank=True, max_length=12000)

    def validate_dateSigned(self, value):
        if value > timezone.localdate():
            raise serializers.ValidationError("The date signed cannot be in the future.")
        return value


PUBLIC_SECTION_FIELD_MAP = {
    "personalDetails": {
        "title": "title",
        "membershipReference": "membership_reference",
        "firstName": "first_name",
        "lastName": "last_name",
        "preferredName": "preferred_name",
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
        "lineManagerName": "line_manager_name",
        "lineManagerEmail": "line_manager_email",
        "employerAwareness": "employer_awareness",
        "pathwayRoleSupport": "pathway_role_support",
    },
    "bursaryRequest": {
        "quotedPathwayCostGbp": "quoted_pathway_cost_gbp",
        "bursaryAmountRequestedGbp": "bursary_amount_requested_gbp",
        "requestedBursaryPercentage": "requested_bursary_percentage",
        "otherContributionAvailableGbp": "other_contribution_available_gbp",
        "proceedWithLowerBursary": "proceed_with_lower_bursary",
        "financialCircumstances": "financial_circumstances",
        "scholarshipOutcome": "scholarship_outcome",
        "measurableResult": "measurable_result",
        "learningApplicationAndContribution": "learning_application_and_contribution",
    },
    "pathwaySelection": {
        "preferredPathway": "preferred_pathway",
        "preferredStartMonthOrIntake": "preferred_start_month_or_intake",
        "highestRelevantQualification": "highest_relevant_qualification",
        "professionalMembershipsOrCertifications": "professional_memberships_or_certifications",
        "relevantExperience": "relevant_experience",
        "pathwayFitReason": "pathway_fit_reason",
    },
    "termsAndConsents": {
        "linkedInAwardPostConsent": "linkedin_award_post_consent",
        "secondProgressPostConsent": "second_progress_post_consent",
        "tagIpcConsent": "tag_ipc_consent",
        "reshareAndQuoteConsent": "reshare_and_quote_consent",
        "professionalHeadshotConsent": "professional_headshot_consent",
        "participationConsent": "participation_consent",
        "approvedMediaUseConsent": "approved_media_use_consent",
        "reportRestrictionsConsent": "report_restrictions_consent",
        "publicityRestrictions": "publicity_restrictions",
        "publicityRestrictionDetails": "publicity_restriction_details",
        "professionalHeadshotReference": "professional_headshot_reference",
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
        "fullLegalName": "full_legal_name",
        "dateSigned": "date_signed",
        "electronicSignature": "electronic_signature",
        "signaturePlace": "signature_place",
        "preferredSecureSubmissionReference": "preferred_secure_submission_reference",
        "additionalReviewInformation": "additional_review_information",
    },
}


class BursaryApplicationPublicSerializer(serializers.Serializer):
    personalDetails = BursaryPersonalDetailsSerializer()
    organisationDetails = BursaryOrganisationDetailsSerializer()
    bursaryRequest = BursaryRequestSerializer()
    pathwaySelection = BursaryPathwaySelectionSerializer()
    termsAndConsents = BursaryTermsSerializer()
    reviewAndDeclaration = BursaryReviewSerializer()

    mandatory_terms = (
        "linkedInAwardPostConsent", "secondProgressPostConsent", "tagIpcConsent",
        "reshareAndQuoteConsent", "professionalHeadshotConsent", "participationConsent",
        "approvedMediaUseConsent", "reportRestrictionsConsent",
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
                "lineManagerName": "",
                "lineManagerEmail": "",
                "employerAwareness": "",
                "pathwayRoleSupport": "",
            }
        return super().to_internal_value(data)

    def validate(self, attrs):
        personal = attrs["personalDetails"]
        organisation = attrs["organisationDetails"]
        terms = attrs["termsAndConsents"]
        review = attrs["reviewAndDeclaration"]
        errors = {}

        request = self.context.get("request")
        if request and request.user.is_authenticated:
            owns_membership_reference = Application.objects.filter(
                Q(application_reference__iexact=personal["membershipReference"]),
                Q(applicant=request.user) | Q(approved_user=request.user),
            ).exists()
            if not owns_membership_reference:
                errors.setdefault("personalDetails", {})["membershipReference"] = (
                    "This membership reference is not linked to the account currently signed in."
                )

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

        missing_terms = {
            field: "You must accept this mandatory term."
            for field in self.mandatory_terms
            if terms.get(field) is not True
        }
        if missing_terms:
            errors.setdefault("termsAndConsents", {}).update(missing_terms)

        restrictions = terms["publicityRestrictions"]
        if len(restrictions) != len(set(restrictions)):
            errors.setdefault("termsAndConsents", {})["publicityRestrictions"] = "Select each restriction once."
        if "none_declared" in restrictions and len(restrictions) > 1:
            errors.setdefault("termsAndConsents", {})["publicityRestrictions"] = (
                "None declared cannot be selected with another restriction."
            )
        if any(value != "none_declared" for value in restrictions):
            if not terms.get("publicityRestrictionDetails", "").strip():
                errors.setdefault("termsAndConsents", {})["publicityRestrictionDetails"] = (
                    "Describe the restriction, approval or safe alternative."
                )

        missing_review = {
            field: "You must confirm this item."
            for field in self.mandatory_review
            if review.get(field) is not True
        }
        if missing_review:
            errors.setdefault("reviewAndDeclaration", {}).update(missing_review)
        if review["dateSigned"] < personal["dateOfBirth"]:
            errors.setdefault("reviewAndDeclaration", {})["dateSigned"] = "Enter a valid signing date."

        if errors:
            raise serializers.ValidationError(errors)
        return attrs

    @transaction.atomic
    def create(self, validated_data):
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
        application = BursaryApplication.objects.create(**model_values)
        BursaryApplicationStatusHistory.objects.create(
            application=application,
            previous_status="",
            new_status=BursaryApplication.Status.SUBMITTED,
            internal_reason="Application submitted.",
        )
        return application

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
    preferred_pathway_label = serializers.CharField(source="get_preferred_pathway_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = BursaryApplication
        fields = [
            "id", "application_reference", "membership_reference", "applicant_name", "email",
            "mobile_phone_e164", "country", "currently_employed", "organisation_name",
            "preferred_pathway", "preferred_pathway_label", "bursary_amount_requested_gbp",
            "requested_bursary_percentage", "status", "status_label", "submitted_at",
        ]
        read_only_fields = fields

    def get_applicant_name(self, application):
        return f"{application.first_name} {application.last_name}".strip()


class BursaryApplicationDetailSerializer(serializers.ModelSerializer):
    preferred_pathway_label = serializers.CharField(source="get_preferred_pathway_display", read_only=True)
    status_label = serializers.CharField(source="get_status_display", read_only=True)
    assigned_reviewer_name = serializers.SerializerMethodField()
    status_history = BursaryStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = BursaryApplication
        fields = "__all__"

    def get_assigned_reviewer_name(self, application):
        user = application.assigned_reviewer
        return (user.get_full_name().strip() or user.get_username()) if user else ""


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
            attrs["status"] == BursaryApplication.Status.REJECTED
            and not internal_reason
        ):
            raise serializers.ValidationError({
                "internal_reason": "Enter the rejection reason that will be sent to the applicant.",
            })
        attrs["internal_reason"] = internal_reason
        return attrs


class BursaryApplicationNoteSerializer(serializers.Serializer):
    reviewer_internal_notes = serializers.CharField(allow_blank=True, max_length=12000)
