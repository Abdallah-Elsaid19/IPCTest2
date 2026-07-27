from django.db import migrations


APPLICATION_PROCESS = {
    "eyebrow": "From Interest to Enrolment",
    "title": "One coordinated application journey.",
    "description": (
        "Applicants engage with both partners, but each partner has a clearly "
        "defined decision."
    ),
    "steps": [
        {
            "title": "Explore the Kent Business College programme",
            "description": (
                "Review the APM Level 4 or PCP Level 6 programme page and "
                "identify the route most relevant to your career."
            ),
        },
        {
            "title": "Submit an IPC scholarship application",
            "description": (
                "Email your CV or background summary, selected programme, "
                "scholarship category and a 500–1,000 word personal statement."
            ),
        },
        {
            "title": "IPC completes the values and funding review",
            "description": (
                "IPC assesses need, character, service, motivation, potential "
                "and available scholarship resources."
            ),
        },
        {
            "title": "Kent Business College completes admissions review",
            "description": (
                "KBC confirms programme fit, entry requirements, intake, "
                "delivery route and any other available funding."
            ),
        },
        {
            "title": "The funding package is confirmed",
            "description": (
                "IPC confirms its 50%–70% contribution and the applicant, "
                "employer or sponsor confirms the remaining contribution."
            ),
        },
        {
            "title": "Enrolment and professional journey begin",
            "description": (
                "The learner enrols with Kent Business College and begins "
                "engaging with the IPC membership, events and recognition "
                "pathway where included."
            ),
        },
    ],
}

RECIPIENT_COMMITMENT = {
    "eyebrow": "Scholarship Conditions",
    "title": "What the 50%–70% contribution means in practice.",
    "groups": [
        {
            "title": "Funding conditions",
            "items": [
                (
                    "Funding is discretionary and subject to available IPC "
                    "scholarship resources."
                ),
                (
                    "The final award may be 50%, 60%, 70% or another amount "
                    "stated in the written decision."
                ),
                (
                    "The award applies only to eligible costs identified in "
                    "the written scholarship offer."
                ),
                "Funding is not normally retrospective.",
                (
                    "Funding cannot be duplicated with costs already covered "
                    "by another funding source."
                ),
                (
                    "Kent Business College admission remains a separate "
                    "requirement."
                ),
            ],
            "is_active": True,
        },
        {
            "title": "Learner responsibilities",
            "items": [
                "Provide complete and truthful application information.",
                "Confirm how the remaining 30%–50% will be funded.",
                (
                    "Meet the programme’s entry and participation "
                    "requirements."
                ),
                "Attend, engage and complete required programme work.",
                "Inform IPC and KBC promptly if circumstances change.",
                (
                    "Follow the relevant codes of conduct and use recognition "
                    "titles accurately."
                ),
            ],
            "is_active": True,
        },
    ],
}

AUDIENCES_INTRO = {
    "eyebrow": "Who IPC May Support",
    "title": (
        "Scholarship routes designed for different forms of merit, need "
        "and potential."
    ),
    "description": (
        "Applicants are not selected only because they already possess "
        "technical expertise. The Fund considers character, need, service, "
        "resilience, leadership, influence and the ability to benefit from "
        "the opportunity."
    ),
}

AUDIENCE_SUMMARIES = {
    "access-hardship": {
        "title": "Access & Hardship",
        "subtitle": (
            "For applicants who cannot reasonably access professional "
            "education without financial support."
        ),
    },
    "character-service": {
        "title": "Character & Service",
        "subtitle": (
            "For people who demonstrate integrity and service through "
            "volunteering, caring, mentoring or helping others."
        ),
    },
    "community-impact": {
        "title": "Community Impact",
        "subtitle": (
            "For applicants contributing to social mobility, local "
            "communities, disadvantaged groups or public benefit."
        ),
    },
    "social-media-good": {
        "title": "Social Media for Good",
        "subtitle": (
            "For applicants with more than 10,000 followers using their "
            "influence for education, charity or another positive cause."
        ),
    },
    "charity-ngo": {
        "title": "Charity & NGO Leadership",
        "subtitle": (
            "For charity staff, trustees, volunteers and community leaders "
            "whose project capability can strengthen public benefit."
        ),
    },
    "public-service": {
        "title": "Veterans & Public Service Transition",
        "subtitle": (
            "For armed forces, emergency-service or public-service "
            "professionals moving into civilian project careers."
        ),
    },
    "second-chance": {
        "title": "Second Chance Career Repositioning",
        "subtitle": (
            "For people rebuilding employment prospects after custody, "
            "conviction, homelessness, recovery or serious disruption."
        ),
    },
    "independent": {
        "title": "Self-Employed Professionals & Consultants",
        "subtitle": (
            "For freelancers, sole traders and consultants without access to "
            "employer-funded professional development."
        ),
    },
    "career-returner": {
        "title": "Career Returners",
        "subtitle": (
            "For parents, carers, people returning after illness and "
            "professionals repositioning from another sector."
        ),
    },
    "emerging-talent": {
        "title": "Emerging Talent",
        "subtitle": (
            "For graduates, apprentices, college leavers and early-career "
            "applicants without employer sponsorship or professional networks."
        ),
    },
}

FAQ = {
    "eyebrow": "Frequently Asked Questions",
    "title": "IPC and Kent Business College scholarship questions.",
    "items": [
        {
            "question": "Does IPC guarantee 70% funding to every applicant?",
            "answer": (
                "No. Funding is discretionary and depends on applicant need, "
                "available scholarship resources, programme route and the "
                "written award decision. The contribution may be 50%, 60%, "
                "70% or another approved amount."
            ),
            "is_active": True,
        },
        {
            "question": "Who pays the remaining 30%–50%?",
            "answer": (
                "The remaining contribution may be paid by the learner, an "
                "employer, a sponsor or another approved co-funding source. "
                "The complete funding route must be confirmed before enrolment."
            ),
            "is_active": True,
        },
        {
            "question": (
                "Can the IPC contribution be combined with apprenticeship "
                "funding?"
            ),
            "answer": (
                "It may be possible where the relevant funding rules allow it, "
                "but the same eligible cost cannot be funded twice. IPC and "
                "Kent Business College will confirm the permitted arrangement "
                "in writing."
            ),
            "is_active": True,
        },
        {
            "question": "Should I apply to IPC or Kent Business College first?",
            "answer": (
                "Explore the official Kent Business College programme page "
                "first, then submit your IPC scholarship application. Kent "
                "Business College confirms programme suitability and "
                "admission; IPC confirms the scholarship contribution."
            ),
            "is_active": True,
        },
        {
            "question": (
                "Can self-employed professionals and consultants apply?"
            ),
            "answer": (
                "Yes. Freelancers, sole traders and consultants may apply "
                "where they meet the scholarship criteria and do not have "
                "access to sufficient employer-funded professional development."
            ),
            "is_active": True,
        },
        {
            "question": "Do I need existing project controls expertise?",
            "answer": (
                "No. Applicants may be new to project controls. IPC considers "
                "character, need, service, motivation, transferable "
                "experience, potential and the ability to benefit from the "
                "opportunity."
            ),
            "is_active": True,
        },
        {
            "question": "Does scholarship approval guarantee admission?",
            "answer": (
                "No. Scholarship approval and programme admission are separate "
                "decisions. Kent Business College must confirm that the "
                "applicant meets the programme’s entry, suitability and "
                "participation requirements."
            ),
            "is_active": True,
        },
    ],
}

FINAL_CTA = {
    "eyebrow": "IPC × Kent Business College",
    "title": "Apply for 50%–70% IPC scholarship funding.",
    "description": (
        "Choose the Associate Project Manager Level 4 or Project Controls "
        "Professional Level 6 pathway, then submit your funding application "
        "to the Institute of Project Controls."
    ),
    "primary_cta_label": "Apply for IPC Scholarship",
    "primary_cta_url": (
        "https://outlook.office.com/mail/deeplink/compose"
        "?to=office%40instituteofprojectcontrols.org"
        "&subject=IPC%20Scholarship%20Application"
    ),
    "secondary_cta_label": "Explore APM Level 4",
    "secondary_cta_url": (
        "https://kentbusinesscollege.com/"
        "associate-project-manager-level-4/"
    ),
    "tertiary_cta_label": "Explore PCP Level 6",
    "tertiary_cta_url": (
        "https://kentbusinesscollege.com/"
        "project-control-professional-level-6/"
    ),
    "address_label": "IPC address",
    "email_label": "IPC email",
    "email": "office@instituteofprojectcontrols.org",
    "address": "39 Maidstone Innovation Centre, Maidstone, Kent, ME14 5FY",
}


def refresh_scholarship_sections(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")

    for content in ScholarshipContent.objects.all():
        audiences = []
        for index, raw_item in enumerate(content.audiences or []):
            if not isinstance(raw_item, dict):
                audiences.append(raw_item)
                continue
            item = dict(raw_item)
            summary = AUDIENCE_SUMMARIES.get(item.get("id"))
            if summary is None and index < len(AUDIENCE_SUMMARIES):
                summary = list(AUDIENCE_SUMMARIES.values())[index]
            if summary:
                item.update(summary)
            audiences.append(item)

        ScholarshipContent.objects.filter(pk=content.pk).update(
            application_process=APPLICATION_PROCESS,
            recipient_commitment=RECIPIENT_COMMITMENT,
            audiences_intro=AUDIENCES_INTRO,
            audiences=audiences,
            faq=FAQ,
            final_cta=FINAL_CTA,
        )


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0020_remove_programme_popup_title"),
    ]

    operations = [
        migrations.RunPython(
            refresh_scholarship_sections,
            migrations.RunPython.noop,
        ),
    ]
