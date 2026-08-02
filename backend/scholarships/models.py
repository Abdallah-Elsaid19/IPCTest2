from uuid import uuid4

from django.core.exceptions import ValidationError
from django.db import models
from django.conf import settings
from django.utils import timezone

from ipc_backend.validators import (
    bursary_identity_upload_to,
    bursary_photo_upload_to,
    validate_identity_document,
    validate_image,
)
from ipc_backend.validators import validate_content_section
from .dashboard_defaults import (
    default_gateway_ai_spotlight,
    default_gateway_all_inclusive,
    default_gateway_audiences,
    default_gateway_commitment,
    default_gateway_comparison,
    default_gateway_eligibility,
    default_gateway_faq,
    default_gateway_final_cta,
    default_gateway_funding,
    default_gateway_funding_figures,
    default_gateway_government_funding,
    default_gateway_hero,
    default_gateway_learning,
    default_gateway_partnership,
    default_gateway_pathways_intro,
    default_gateway_process,
    default_gateway_seo,
    default_pathway_pages,
)


CARD_FIELDS = ("title", "description")


def validate_card_collection(value):
    if not isinstance(value, list):
        raise ValidationError("This value must be a list of cards.")
    if not value:
        raise ValidationError("Add at least one card.")
    if len(value) > 24:
        raise ValidationError("Add no more than 24 cards.")

    for index, card in enumerate(value, start=1):
        if not isinstance(card, dict):
            raise ValidationError(f"Card {index} must be an object.")
        for field in CARD_FIELDS:
            field_value = card.get(field)
            if not isinstance(field_value, str) or not field_value.strip():
                raise ValidationError(f"Card {index} must include a non-empty {field}.")

        icon = card.get("icon")
        if icon is not None and (not isinstance(icon, str) or not icon.strip()):
            raise ValidationError(
                f"Card {index} icon must be a non-empty string when provided."
            )


class ScholarshipContent(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    key = models.SlugField(max_length=40, unique=True, default="main")
    hero = models.JSONField(default=dict, validators=[validate_content_section])
    commitment = models.JSONField(default=dict, validators=[validate_content_section])
    fund = models.JSONField(default=dict, validators=[validate_content_section])
    principles = models.JSONField(default=dict, validators=[validate_content_section])
    audiences_intro = models.JSONField(default=dict, validators=[validate_content_section])
    audiences = models.JSONField(validators=[validate_card_collection])
    values = models.JSONField(validators=[validate_card_collection])
    values_intro = models.JSONField(default=dict, validators=[validate_content_section])
    eligibility = models.JSONField(default=dict, validators=[validate_content_section])
    recipient_commitment = models.JSONField(default=dict, validators=[validate_content_section])
    application_process = models.JSONField(default=dict, validators=[validate_content_section])
    partners = models.JSONField(default=dict, validators=[validate_content_section])
    academic_partners = models.JSONField(default=dict, validators=[validate_content_section])
    conditions = models.JSONField(default=dict, validators=[validate_content_section])
    impact = models.JSONField(default=dict, validators=[validate_content_section])
    faq = models.JSONField(default=dict, validators=[validate_content_section])
    final_cta = models.JSONField(default=dict, validators=[validate_content_section])
    seo = models.JSONField(default=dict, validators=[validate_content_section])
    legacy_content = models.JSONField(default=dict, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PUBLISHED)
    is_active = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="updated_scholarship_content")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "scholarships_legacy_content"
        verbose_name = "Scholarship page content"
        verbose_name_plural = "Scholarship page content"

    def __str__(self):
        return self.key


class ScholarshipGatewayContent(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    key = models.SlugField(max_length=40, unique=True, default="main")
    hero = models.JSONField(default=default_gateway_hero, validators=[validate_content_section])
    partnership = models.JSONField(default=default_gateway_partnership, validators=[validate_content_section])
    process = models.JSONField(default=default_gateway_process, validators=[validate_content_section])
    funding = models.JSONField(default=default_gateway_funding, validators=[validate_content_section])
    government_funding = models.JSONField(default=default_gateway_government_funding, validators=[validate_content_section])
    funding_figures = models.JSONField(default=default_gateway_funding_figures, validators=[validate_content_section])
    pathways_intro = models.JSONField(default=default_gateway_pathways_intro, validators=[validate_content_section])
    learning = models.JSONField(default=default_gateway_learning, validators=[validate_content_section])
    ai_spotlight = models.JSONField(default=default_gateway_ai_spotlight, validators=[validate_content_section])
    comparison = models.JSONField(default=default_gateway_comparison, validators=[validate_content_section])
    all_inclusive = models.JSONField(default=default_gateway_all_inclusive, validators=[validate_content_section])
    audiences = models.JSONField(default=default_gateway_audiences, validators=[validate_content_section])
    eligibility = models.JSONField(default=default_gateway_eligibility, validators=[validate_content_section])
    commitment = models.JSONField(default=default_gateway_commitment, validators=[validate_content_section])
    faq = models.JSONField(default=default_gateway_faq, validators=[validate_content_section])
    final_cta = models.JSONField(default=default_gateway_final_cta, validators=[validate_content_section])
    seo = models.JSONField(default=default_gateway_seo, validators=[validate_content_section])
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PUBLISHED)
    is_active = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="updated_scholarship_gateway_content",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "scholarships_content"
        verbose_name = "Scholarship gateway content"
        verbose_name_plural = "Scholarship gateway content"

    def __str__(self):
        return self.key


class ScholarshipPathwaysContent(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    key = models.SlugField(max_length=40, unique=True, default="main")
    pages = models.JSONField(default=default_pathway_pages, validators=[validate_content_section])
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PUBLISHED)
    is_active = models.BooleanField(default=True)
    published_at = models.DateTimeField(null=True, blank=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="updated_scholarship_pathways_content",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "scholarships_pathways_content"
        verbose_name = "Scholarship pathways content"
        verbose_name_plural = "Scholarship pathways content"

    def __str__(self):
        return self.key


def generate_bursary_application_reference():
    """Generate an opaque, server-owned reference using the site's existing style."""
    return f"IPC-BSA-{timezone.now().year}-{uuid4().hex[:12].upper()}"


class BursaryApplication(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = "submitted", "Submitted"
        UNDER_REVIEW = "under_review", "Under review"
        NEEDS_INFORMATION = "needs_information", "Needs information"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    class PreferredModule(models.TextChoices):
        AI = "ai", "AI"
        PMI_SP = "pmi_sp", "PMI-SP"
        EVM = "evm", "EVM"
        RISK = "risk", "Risk"
        PPC = "ppc", "PPC"
        MSP = "msp", "MSP"
        MANAGING_PORTFOLIOS = "managing_portfolios", "Managing Portfolios"
        STAKEHOLDER_MANAGEMENT = "stakeholder_management", "Stakeholder"
        PMP = "pmp", "PMP"
        PMO = "pmo", "PMO"

    class PreferredPathway(models.TextChoices):
        # Retained only so applications submitted before the move to modules
        # keep their original display label.
        OPERATIONAL = "operational", "Operational Pathway"
        STRATEGIC = "strategic", "Strategic Pathway"
        CHARTERED = "chartered", "Chartered Pathway"
        CERTIFIED_PMO = "certified_pmo_professional", "Certified PMO Professional"
        APM = "apm", "APM Pathway"

    class ContactMethod(models.TextChoices):
        EMAIL = "email", "Email"
        PHONE = "phone", "Phone"
        EITHER = "either", "Either"

    class LowerBursaryResponse(models.TextChoices):
        YES = "yes", "Yes"
        NO = "no", "No"
        DISCUSS = "discuss", "I would need to discuss the offer"

    class EmployerAwareness(models.TextChoices):
        YES = "yes", "Yes"
        NO = "no", "No"
        DISCUSS_LATER = "discuss_later", "Prefer to discuss later"

    application_reference = models.CharField(
        max_length=40,
        unique=True,
        default=generate_bursary_application_reference,
        editable=False,
    )
    form_version = models.CharField(max_length=24, default="IPC-BSAF-2026-01", editable=False)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.SUBMITTED)
    submitted_at = models.DateTimeField(default=timezone.now, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="submitted_bursary_applications",
    )
    assigned_reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_bursary_applications",
    )
    reviewer_internal_notes = models.TextField(blank=True)
    approval_email_sent_at = models.DateTimeField(null=True, blank=True, editable=False)
    rejection_email_sent_at = models.DateTimeField(null=True, blank=True, editable=False)

    # Section 1 — Personal details
    title = models.CharField(max_length=40, blank=True)
    membership_reference = models.CharField(max_length=40, db_index=True, default="")
    first_name = models.CharField(max_length=120)
    last_name = models.CharField(max_length=120)
    preferred_name = models.CharField(max_length=120, blank=True)
    date_of_birth = models.DateField()
    email = models.EmailField()
    phone_country_iso2 = models.CharField(max_length=2)
    phone_dial_code = models.CharField(max_length=8)
    phone_national_number = models.CharField(max_length=32)
    mobile_phone_e164 = models.CharField(max_length=20)
    home_address_line_1 = models.CharField(max_length=255)
    home_address_line_2 = models.CharField(max_length=255, blank=True)
    town_or_city = models.CharField(max_length=120)
    county_or_region = models.CharField(max_length=120, blank=True)
    postcode = models.CharField(max_length=32)
    country = models.CharField(max_length=120)
    linkedin_profile_url = models.URLField(max_length=500)
    currently_employed = models.BooleanField()
    current_professional_status = models.CharField(max_length=180, blank=True)
    preferred_contact_method = models.CharField(max_length=16, choices=ContactMethod.choices)

    # Section 2 — Organisation details
    organisation_not_applicable = models.BooleanField(default=False)
    organisation_name = models.CharField(max_length=255, blank=True)
    organisation_website = models.URLField(max_length=500, blank=True)
    industry_or_sector = models.CharField(max_length=180, blank=True)
    organisation_address_line_1 = models.CharField(max_length=255, blank=True)
    organisation_address_line_2 = models.CharField(max_length=255, blank=True)
    organisation_town_or_city = models.CharField(max_length=120, blank=True)
    organisation_county_or_region = models.CharField(max_length=120, blank=True)
    organisation_postcode = models.CharField(max_length=32, blank=True)
    organisation_country = models.CharField(max_length=120, blank=True)
    organisation_size = models.CharField(max_length=80, blank=True)
    job_title = models.CharField(max_length=180, blank=True)
    department_or_business_unit = models.CharField(max_length=180, blank=True)
    employment_start_date = models.DateField(null=True, blank=True)
    employment_type = models.CharField(max_length=80, blank=True)
    line_manager_name = models.CharField(max_length=180, blank=True)
    line_manager_email = models.EmailField(blank=True)
    employer_awareness = models.CharField(max_length=24, choices=EmployerAwareness.choices, blank=True)
    pathway_role_support = models.TextField(blank=True)

    # Section 3 — Bursary request
    quoted_pathway_cost_gbp = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    bursary_amount_requested_gbp = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    requested_bursary_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    other_contribution_available_gbp = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    proceed_with_lower_bursary = models.CharField(max_length=16, choices=LowerBursaryResponse.choices, blank=True)
    financial_circumstances = models.TextField(blank=True)
    scholarship_outcome = models.TextField(blank=True)
    measurable_result = models.TextField(blank=True)
    learning_application_and_contribution = models.TextField(blank=True)
    emergency_contact_full_name = models.CharField(max_length=180, default="")
    emergency_contact_relationship = models.CharField(max_length=120, default="", blank=True)
    emergency_contact_email = models.EmailField(blank=True)
    emergency_contact_phone = models.CharField(max_length=40, default="")
    has_disability_or_health_condition = models.BooleanField(default=False)
    health_problem_categories = models.JSONField(default=list)
    primary_health_problem = models.TextField(blank=True)
    identity_document = models.FileField(
        upload_to=bursary_identity_upload_to,
        validators=[validate_identity_document],
        blank=True,
    )
    applicant_photo = models.ImageField(
        upload_to=bursary_photo_upload_to,
        validators=[validate_image],
        blank=True,
    )

    # Section 4 — Pathway selection
    preferred_pathway = models.CharField(
        "legacy preferred pathway",
        max_length=40,
        choices=PreferredPathway.choices,
        blank=True,
        default="",
    )
    preferred_modules = models.JSONField(default=list)
    preferred_start_month_or_intake = models.CharField(max_length=120, blank=True)
    highest_relevant_qualification = models.CharField(max_length=255, blank=True)
    professional_memberships_or_certifications = models.TextField(blank=True)
    relevant_experience = models.TextField()
    pathway_fit_reason = models.TextField("reason for requesting an IPC bursary")

    def get_bursary_selection_display(self):
        module_labels = dict(self.PreferredModule.choices)
        selected_modules = [
            module_labels[value]
            for value in self.preferred_modules
            if value in module_labels
        ]
        if selected_modules:
            return ", ".join(selected_modules)
        return self.get_preferred_pathway_display() if self.preferred_pathway else ""

    # Section 5 — Mandatory terms and consents
    linkedin_award_post_consent = models.BooleanField()
    second_progress_post_consent = models.BooleanField()
    tag_ipc_consent = models.BooleanField()
    reshare_and_quote_consent = models.BooleanField()
    professional_headshot_consent = models.BooleanField()
    participation_consent = models.BooleanField()
    approved_media_use_consent = models.BooleanField()
    report_restrictions_consent = models.BooleanField()
    mandatory_terms_accepted = models.BooleanField(default=False)
    publicity_restrictions = models.JSONField(default=list)
    publicity_restriction_details = models.TextField(blank=True)
    professional_headshot_reference = models.CharField(max_length=500, blank=True)
    general_marketing_consent = models.BooleanField(default=False)
    terms_accepted_at = models.DateTimeField(default=timezone.now, editable=False)

    # Section 6 — Review, declaration and signature
    section_1_complete = models.BooleanField()
    section_2_complete_or_not_applicable = models.BooleanField()
    section_3_complete = models.BooleanField()
    section_4_complete = models.BooleanField()
    section_5_complete = models.BooleanField()
    information_accurate_declaration = models.BooleanField()
    no_award_guarantee_declaration = models.BooleanField()
    pathway_terms_declaration = models.BooleanField()
    processing_consent_declaration = models.BooleanField()
    applicant_identity_declaration = models.BooleanField()
    full_legal_name = models.CharField(max_length=255, blank=True)
    date_signed = models.DateField(null=True, blank=True)
    electronic_signature = models.TextField(blank=True)
    signature_place = models.CharField(max_length=180, blank=True)
    preferred_secure_submission_reference = models.CharField(max_length=180, blank=True)
    additional_review_information = models.TextField(blank=True)
    declarations_accepted_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ["-submitted_at", "-id"]
        indexes = [
            models.Index(fields=["status", "submitted_at"], name="bursary_status_submitted_idx"),
            models.Index(fields=["preferred_pathway", "submitted_at"], name="bursary_pathway_submitted_idx"),
            models.Index(fields=["country"], name="bursary_country_idx"),
            models.Index(fields=["email"], name="bursary_email_idx"),
            models.Index(fields=["currently_employed"], name="bursary_employed_idx"),
            models.Index(fields=["assigned_reviewer"], name="bursary_reviewer_idx"),
        ]

    def __str__(self):
        return f"{self.application_reference} — {self.first_name} {self.last_name}"


class BursaryApplicationStatusHistory(models.Model):
    application = models.ForeignKey(
        BursaryApplication,
        on_delete=models.CASCADE,
        related_name="status_history",
    )
    previous_status = models.CharField(max_length=24, blank=True)
    new_status = models.CharField(max_length=24, choices=BursaryApplication.Status.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="bursary_status_changes",
    )
    internal_reason = models.TextField(blank=True)
    changed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-changed_at", "-id"]

    def __str__(self):
        return f"{self.application.application_reference}: {self.previous_status} → {self.new_status}"
