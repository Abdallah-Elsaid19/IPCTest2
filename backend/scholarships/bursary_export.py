"""Canonical Bursary application columns shared by CSV and Google Sheets."""

from .models import BursaryApplication


BURSARY_MODULE_PRICING = {
    "ai": (4000, 50),
    "pmi_sp": (4000, 50),
    "evm": (4000, 50),
    "risk": (4000, 50),
    "ppc": (4000, 50),
    "msp": (4000, 50),
    "managing_portfolios": (4000, 50),
    "stakeholder_management": (4000, 50),
    "pmo_module": (4000, 50),
    "pmp": (8000, 75),
    "pmo": (16000, 75),
    "mba_level_7": (6000, 80),
}

BURSARY_MODULE_PAYABLE_OVERRIDE = {
    "mba_level_7": 1000,
}

BURSARY_EXPORT_HEADERS = [
    "Application reference", "Membership reference", "Status",
    "Submitted at", "Updated at", "Assigned reviewer", "Internal review notes",
    "First name", "Last name", "Date of birth", "Email",
    "Phone country", "Calling code", "Mobile national number", "Mobile E.164",
    "Home address line 1", "Home address line 2", "Town or city",
    "County or region", "Postcode", "Country", "LinkedIn profile URL",
    "Currently employed", "Current professional status", "Preferred contact method",
    "Organisation name", "Organisation website", "Industry or sector",
    "Organisation size", "Organisation address line 1", "Organisation address line 2",
    "Organisation town or city", "Organisation county or region",
    "Organisation postcode", "Organisation country", "Job title",
    "Department or business unit", "Employment start date", "Employment type",
    "How modules support role and organisation",
    "Emergency contact full name", "Emergency contact email", "Emergency contact phone",
    "Proof of identification provided", "Applicant photo provided",
    "Long-term disability, health problem or learning difficulty",
    "Additional support required", "Preferred modules",
    "Total module cost (GBP)", "IPC Fund contribution (GBP)",
    "Estimated amount applicant pays (GBP)",
    "Mandatory terms accepted", "Date signed", "Electronic signature provided",
]

BURSARY_GOOGLE_SHEET_HEADERS = [
    "First name",
    "Last name",
    "Date of birth",
    "Email",
    "Country",
    "Organisation name",
    "Job title",
    "Employment type",
    "Preferred modules",
    "Estimated amount applicant pays (GBP)",
    "Long-term disability, health problem or learning difficulty",
    "Additional support required",
]


def export_safe(value):
    if value is None:
        return ""
    if isinstance(value, bool):
        return "Yes" if value else "No"
    if isinstance(value, (list, tuple)):
        value = ", ".join(str(item) for item in value)
    elif hasattr(value, "isoformat"):
        value = value.isoformat()
    else:
        value = str(value)
    if value.lstrip().startswith(("=", "+", "-", "@")):
        return f"'{value}"
    return value


def bursary_export_row(application):
    module_labels = dict(BursaryApplication.PreferredModule.choices)
    selected_modules = [
        module_labels[value]
        for value in application.preferred_modules
        if value in module_labels
    ]
    total_cost = 0
    total_contribution = 0
    for value in application.preferred_modules:
        cost, percentage = BURSARY_MODULE_PRICING.get(value, (0, 0))
        total_cost += cost
        payable_override = BURSARY_MODULE_PAYABLE_OVERRIDE.get(value)
        total_contribution += cost - payable_override if payable_override is not None else cost * percentage // 100
    reviewer = application.assigned_reviewer
    reviewer_name = (
        reviewer.get_full_name().strip() or reviewer.get_username()
        if reviewer else ""
    )
    values = [
        application.application_reference,
        application.membership_reference,
        application.get_status_display(),
        application.submitted_at,
        application.updated_at,
        reviewer_name,
        application.reviewer_internal_notes,
        application.first_name,
        application.last_name,
        application.date_of_birth,
        application.email,
        application.phone_country_iso2,
        application.phone_dial_code,
        application.phone_national_number,
        application.mobile_phone_e164,
        application.home_address_line_1,
        application.home_address_line_2,
        application.town_or_city,
        application.county_or_region,
        application.postcode,
        application.country,
        application.linkedin_profile_url,
        application.currently_employed,
        application.current_professional_status,
        application.get_preferred_contact_method_display(),
        application.organisation_name,
        application.organisation_website,
        application.industry_or_sector,
        application.organisation_size,
        application.organisation_address_line_1,
        application.organisation_address_line_2,
        application.organisation_town_or_city,
        application.organisation_county_or_region,
        application.organisation_postcode,
        application.organisation_country,
        application.job_title,
        application.department_or_business_unit,
        application.employment_start_date,
        application.employment_type,
        application.pathway_role_support,
        application.emergency_contact_full_name,
        application.emergency_contact_email,
        application.emergency_contact_phone,
        bool(application.identity_document),
        bool(application.applicant_photo),
        application.has_disability_or_health_condition,
        application.primary_health_problem,
        selected_modules,
        total_cost,
        total_contribution,
        total_cost - total_contribution,
        application.mandatory_terms_accepted,
        application.date_signed,
        bool(application.electronic_signature),
    ]
    return [export_safe(value) for value in values]


def bursary_google_sheet_row(application):
    module_labels = dict(BursaryApplication.PreferredModule.choices)
    selected_modules = [
        module_labels[value]
        for value in application.preferred_modules
        if value in module_labels
    ]
    total_cost = 0
    total_contribution = 0
    for value in application.preferred_modules:
        cost, percentage = BURSARY_MODULE_PRICING.get(value, (0, 0))
        total_cost += cost
        payable_override = BURSARY_MODULE_PAYABLE_OVERRIDE.get(value)
        total_contribution += cost - payable_override if payable_override is not None else cost * percentage // 100

    values = [
        application.first_name,
        application.last_name,
        application.date_of_birth,
        application.email,
        application.country,
        application.organisation_name,
        application.job_title,
        application.employment_type,
        selected_modules,
        total_cost - total_contribution,
        application.has_disability_or_health_condition,
        application.primary_health_problem,
    ]
    row = [export_safe(value) for value in values]
    row[9] = total_cost - total_contribution
    return row
