from django.db import migrations, models

import ipc_backend.validators


HERO = {
    "eyebrow": "About the Institute",
    "title": "A professional institution for the people behind",
    "title_accent": "credible project decisions.",
    "description": (
        "The Institute of Project Controls exists to recognise, develop and connect "
        "the professionals who make project performance visible, forecasts credible, "
        "change controlled and decisions evidence-based."
    ),
    "cta_label": "Explore Membership",
    "cta_url": "/membership",
}

PURPOSE = {
    "eyebrow": "Why the Institute exists",
    "title": "Project controls carries major responsibility but often lacks",
    "title_accent": "a clear professional identity.",
    "paragraphs": [
        (
            "Projects depend on professionals who translate scope, schedule, cost, "
            "risk, change and performance data into information that leaders can trust."
        ),
        (
            "They build baselines, test progress, interpret variance, examine uncertainty, "
            "challenge forecasts, control change and help leaders understand what may happen next."
        ),
        (
            "The Institute provides a specialist professional home that makes competence "
            "visible, strengthens standards, creates progression routes and connects "
            "education with employer need."
        ),
    ],
}

STATISTICS = [
    {"number": "05", "label": "Recognition grades"},
    {"number": "04", "label": "Regional clubs"},
    {"number": "06", "label": "Connected pillars"},
    {"number": "01", "label": "Specialist discipline"},
]

WHY_INTRO = {
    "eyebrow": "Why IPC is different",
    "title": "Specialist enough to understand the discipline.",
    "title_accent": "Broad enough to connect the profession.",
    "description": (
        "IPC focuses specifically on the capabilities that make project controls "
        "credible, explainable and useful."
    ),
}

WHY_EXISTS = [
    {
        "icon": "ri-layout-grid-line",
        "title": "Project controls first",
        "description": (
            "The Institute centres planning, cost, estimating, risk, change, "
            "forecasting, assurance, reporting and integrated controls."
        ),
    },
    {
        "icon": "ri-line-chart-line",
        "title": "Statistics and uncertainty",
        "description": (
            "IPC promotes probability, confidence, variation and transparent "
            "assumptions rather than false precision in forecasts."
        ),
    },
    {
        "icon": "ri-award-line",
        "title": "Recognition by evidence",
        "description": (
            "Membership progression is connected to competence, conduct, "
            "responsibility and contribution rather than job title alone."
        ),
    },
    {
        "icon": "ri-cpu-line",
        "title": "Responsible technology",
        "description": (
            "IPC recognises digital tools, automation and AI while protecting "
            "data integrity, transparency and human accountability."
        ),
    },
    {
        "icon": "ri-leaf-line",
        "title": "Sustainability and value",
        "description": (
            "The profession should connect delivery choices with carbon, resources, "
            "lifecycle value, social impact and public benefit."
        ),
    },
    {
        "icon": "ri-team-line",
        "title": "Community and opportunity",
        "description": (
            "Membership, events, clubs, scholarships, awards and publications "
            "create a professional ecosystem rather than a certificate only."
        ),
    },
]

VISION = {
    "eyebrow": "Our Vision",
    "title": "A trusted professional home for",
    "title_accent": "project controls.",
    "paragraphs": [
        (
            "To become a trusted professional home for project controls, recognised "
            "by practitioners, employers, educators and partners as a mark of "
            "competence, integrity, contribution and leadership."
        ),
        (
            "A stronger profession makes project information more credible, "
            "professional capability more visible and better decisions easier to make."
        ),
    ],
}

VISION_PILLARS = [
    {"icon": "ri-brain-line", "title": "Competence"},
    {"icon": "ri-shield-check-line", "title": "Integrity"},
    {"icon": "ri-vip-crown-line", "title": "Leadership"},
]

MISSION_INTRO = {
    "eyebrow": "Our Mission",
    "title": "Advance project controls through recognition, capability and connection.",
    "description": (
        "To advance project controls by recognising professional competence, "
        "developing specialist capability, connecting professionals and employers, "
        "widening access to learning and promoting ethical, data-led project decision-making."
    ),
}

MISSIONS = [
    {
        "icon": "ri-award-line",
        "title": "Recognise competence",
        "description": (
            "Create visible, evidence-led routes from affiliation through applied "
            "recognition to senior professional standing."
        ),
    },
    {
        "icon": "ri-graduation-cap-line",
        "title": "Develop capability",
        "description": (
            "Support specialist learning in planning, cost, risk, change, data, "
            "assurance, sustainability and leadership."
        ),
    },
    {
        "icon": "ri-links-line",
        "title": "Connect the profession",
        "description": (
            "Bring together professionals, employers, consultants, academics, "
            "students and partners through useful professional activity."
        ),
    },
    {
        "icon": "ri-door-open-line",
        "title": "Widen opportunity",
        "description": (
            "Open routes into the discipline through affiliation, scholarships, "
            "events, clubs, mentoring and employer connection."
        ),
    },
]

VALUES_INTRO = {
    "eyebrow": "Our values",
    "title": "Values specific to",
    "title_accent": "project controls.",
    "description": (
        "IPC values guide recognition, publications, events, partnerships, "
        "professional conduct and the Institute's relationship with employers and society."
    ),
    "closing": (
        "Recognition grounded in evidence, conduct, professional judgement "
        "and accountable use of information."
    ),
}

CORE_VALUES = [
    {
        "icon": "ri-search-eye-line",
        "title": "Evidence before assertion",
        "description": (
            "Project controls must be grounded in credible data, transparent "
            "assumptions, auditable analysis and professional judgement."
        ),
    },
    {
        "icon": "ri-bar-chart-grouped-line",
        "title": "Statistical discipline",
        "description": (
            "Forecasts should recognise uncertainty, confidence, probability "
            "and variation rather than presenting false certainty."
        ),
    },
    {
        "icon": "ri-database-2-line",
        "title": "Data validity",
        "description": (
            "Controls outputs are only as strong as the coding, baselines, "
            "progress data, cost data and governance behind them."
        ),
    },
    {
        "icon": "ri-brain-line",
        "title": "Professional judgement",
        "description": (
            "Tools and dashboards support decisions, but accountable professional "
            "judgement remains essential."
        ),
    },
    {
        "icon": "ri-cpu-line",
        "title": "Responsible AI",
        "description": (
            "AI should improve productivity, anomaly detection and scenario analysis "
            "while protecting transparency and human accountability."
        ),
    },
    {
        "icon": "ri-leaf-line",
        "title": "Sustainable outcomes",
        "description": (
            "Project controls should help organisations manage carbon, resources, "
            "lifecycle value and responsible delivery."
        ),
    },
    {
        "icon": "ri-shield-check-line",
        "title": "Assurance and integrity",
        "description": (
            "Professionals should report reality clearly, challenge weak evidence "
            "and support ethical decision-making."
        ),
    },
    {
        "icon": "ri-building-4-line",
        "title": "Employer relevance",
        "description": (
            "IPC should help organisations build capability, improve delivery "
            "confidence and recognise specialist talent."
        ),
    },
    {
        "icon": "ri-medal-line",
        "title": "Professional recognition",
        "description": (
            "Project controls practitioners deserve a visible identity, "
            "progression pathway and respected professional standing."
        ),
    },
]

IDENTITY_INTRO = {
    "eyebrow": "How IPC creates value",
    "title": "Six connected pillars support",
    "title_accent": "the professional community.",
    "description": (
        "Recognition creates identity, learning builds competence, community creates "
        "opportunity and evidence protects credibility."
    ),
}

IDENTITY_SYMBOLS = [
    {
        "icon": "ri-award-line",
        "title": "Membership & Recognition",
        "description": (
            "A pathway from Affiliate and Professional Membership through "
            "Associate Fellowship to Fellow Level 6."
        ),
    },
    {
        "icon": "ri-presentation-line",
        "title": "Learning & Master Classes",
        "description": (
            "Professional events focused on planning, cost, risk, change, AI, "
            "data, sustainability and leadership."
        ),
    },
    {
        "icon": "ri-book-open-line",
        "title": "Research & Publications",
        "description": (
            "Applied research, academic papers, case studies and evidence-based "
            "discussion connecting theory with practice."
        ),
    },
    {
        "icon": "ri-trophy-line",
        "title": "Awards & Prizes",
        "description": (
            "Recognition that makes excellent work, leadership, research and "
            "professional service visible."
        ),
    },
    {
        "icon": "ri-community-line",
        "title": "Regional Clubs & Community",
        "description": (
            "Local talks, networking, mentoring and employer engagement in "
            "London, Nottingham, Manchester and Kent."
        ),
    },
    {
        "icon": "ri-hand-heart-line",
        "title": "Scholarships & Partnerships",
        "description": (
            "Bursaries, sponsorship and partnerships that widen opportunity "
            "and strengthen the talent pipeline."
        ),
    },
]

DISCIPLINE = {
    "eyebrow": "The discipline",
    "title": "Project controls turns project information into decision confidence.",
    "description": (
        "Effective project controls connects the approved baseline with actual "
        "performance, risk, change, commercial information and future forecasts."
    ),
    "callout": (
        "It is an integrated professional discipline, not a single report, "
        "software product or planning task."
    ),
    "domains": [
        {"title": "Scope and baselines", "detail": "approved scope and plan"},
        {"title": "Planning and scheduling", "detail": "sequence, measure, recover"},
        {"title": "Cost and forecasting", "detail": "spend, commit, forecast"},
        {"title": "Risk and change", "detail": "uncertainty and control"},
        {"title": "Data and assurance", "detail": "trust, trace, challenge"},
        {"title": "Insight and action", "detail": "evidence and decisions"},
    ],
    "levels": [
        {
            "title": "Foundation",
            "description": (
                "Understand terminology, follow procedures, collect reliable "
                "information and support project-controls tasks under direction."
            ),
        },
        {
            "title": "Applied",
            "description": (
                "Work independently, select techniques, interpret variance, "
                "integrate data and advise project teams."
            ),
        },
        {
            "title": "Strategic",
            "description": (
                "Design frameworks, assure information, lead teams, challenge "
                "assumptions and influence senior decisions."
            ),
        },
    ],
}

STANDARDS = {
    "eyebrow": "Professional standards",
    "title": "Recognition should be credible, proportionate and protected.",
    "description": (
        "IPC recognition is designed around competence, evidence, conduct, "
        "continuing development and responsible use of professional titles."
    ),
    "principles": [
        {
            "title": "Evidence-based assessment",
            "description": (
                "Applicants should be judged on what they know, what they can do, "
                "how they behave and the responsibility they carry."
            ),
        },
        {
            "title": "Proportionate recognition",
            "description": (
                "Foundation, applied and senior recognition should require "
                "different depth of evidence and accountability."
            ),
        },
        {
            "title": "Continuing professional development",
            "description": (
                "Members should continue developing technical, digital, statistical, "
                "leadership, sustainability and ethical capability."
            ),
        },
        {
            "title": "Accurate title use",
            "description": (
                "Post-nominals and recognition titles should be used only by "
                "approved members in the correct grade and in good standing."
            ),
        },
        {
            "title": "Employer and public relevance",
            "description": (
                "Standards should help employers understand capability and protect "
                "the quality of information used for decisions."
            ),
        },
    ],
    "conduct": [
        {
            "title": "Honest evidence",
            "description": (
                "Report evidence honestly, explain uncertainty and challenge "
                "misleading data or weak assumptions."
            ),
        },
        {
            "title": "Responsible practice",
            "description": (
                "Protect confidential information and use AI, automation and "
                "professional titles responsibly."
            ),
        },
        {
            "title": "Professional trust",
            "description": (
                "Declare conflicts, respect safety and sustainability, and support "
                "an inclusive professional community."
            ),
        },
    ],
}

AUDIENCES_INTRO = {
    "eyebrow": "Who we serve",
    "title": "A professional framework with value across the project-controls ecosystem.",
    "description": (
        "Each audience should understand why project controls matters and why "
        "IPC is the right institution to engage with."
    ),
}

AUDIENCES = [
    {
        "title": "Professionals",
        "description": (
            "Recognition, post-nominals, career differentiation, competence "
            "development, events, publications, awards, clubs and professional identity."
        ),
        "cta_label": "Explore membership",
        "cta_url": "/membership",
    },
    {
        "title": "Employers",
        "description": (
            "Capability mapping, workforce recognition, talent development, "
            "recruitment signalling and stronger delivery confidence."
        ),
        "cta_label": "Explore employer pathways",
        "cta_url": "/employers",
    },
    {
        "title": "Universities and colleges",
        "description": (
            "Student membership, research links, journal papers, prizes, guest "
            "lectures, employability and links to employers."
        ),
        "cta_label": "Explore academic partnership",
        "cta_url": "/partnerships",
    },
    {
        "title": "Sponsors and partners",
        "description": (
            "Visibility, thought leadership, awards, scholarships, club support, "
            "events and association with a specialist profession."
        ),
        "cta_label": "Explore sponsorship",
        "cta_url": "/sponsorship",
    },
    {
        "title": "Public sector and NGOs",
        "description": (
            "Better project governance, transparency, public value, sustainability, "
            "data integrity and capability development."
        ),
        "cta_label": "Contact the Institute",
        "cta_url": "/contact",
    },
]

PROFESSIONAL_PROMISE = {
    "eyebrow": "Governance and independence",
    "title": "The Institute's credibility depends on how decisions are made.",
    "description": (
        "Membership, awards, scholarships, publications and partnerships should "
        "operate through transparent criteria and appropriate management of conflicts."
    ),
    "cta_label": "Contact the Institute",
    "cta_url": "/contact",
    "items": [
        {
            "title": "Independent recognition",
            "description": (
                "Sponsorship or partnership should not guarantee recognition, "
                "awards or scholarships."
            ),
        },
        {
            "title": "Clear criteria",
            "description": (
                "Applicants should understand what evidence is required and how "
                "professional judgement is applied."
            ),
        },
        {
            "title": "Conflict management",
            "description": (
                "Reviewers should disclose relevant interests and withdraw where "
                "impartiality is affected."
            ),
        },
        {
            "title": "Confidentiality",
            "description": (
                "Commercial, personal and academic evidence should be protected appropriately."
            ),
        },
        {
            "title": "Public accountability",
            "description": (
                "IPC should explain what recognition means and avoid overstating statutory status."
            ),
        },
    ],
}

FAQ = {
    "eyebrow": "Frequently asked questions",
    "title": "About IPC, recognition and professional engagement.",
    "description": (
        "Understand the Institute's scope, recognition framework and routes for engagement."
    ),
    "items": [
        {
            "question": "Is IPC only for planners and schedulers?",
            "answer": (
                "No. IPC serves the wider project controls profession, including "
                "planning, scheduling, cost engineering, estimating, risk, change, "
                "PMO, reporting, data, commercial, claims and assurance roles."
            ),
        },
        {
            "question": "Does IPC provide professional recognition?",
            "answer": (
                "Yes. The pathway includes Affiliate Member, Professional Member, "
                "Associate Fellow Level 3, Associate Fellow Level 4 and Fellow Level 6, "
                "subject to evidence and Institute rules."
            ),
        },
        {
            "question": "Is IPC recognition a regulated qualification?",
            "answer": (
                "IPC recognition is a professional membership and recognition framework. "
                "It should not be described as a regulated qualification, apprenticeship "
                "completion, chartered title or licence unless separately authorised."
            ),
        },
        {
            "question": "Can employers and consultancies become partners?",
            "answer": (
                "Yes. Corporate partners can support workforce development, events, "
                "awards, scholarships, clubs, publications and professional capability."
            ),
        },
        {
            "question": "Can universities and colleges engage with IPC?",
            "answer": (
                "Yes. Academic engagement can include student membership, guest lectures, "
                "research, journal papers, dissertation prizes, scholarships and employer links."
            ),
        },
        {
            "question": "How does IPC approach AI?",
            "answer": (
                "IPC supports responsible AI that improves productivity, analytics, anomaly "
                "detection and scenario exploration while protecting data security, "
                "transparency, verification and human accountability."
            ),
        },
        {
            "question": "How can I become involved?",
            "answer": (
                "Apply for membership, attend events, join a club, contribute an article "
                "or paper, nominate an award, support scholarships, become a partner or "
                "contact the Institute."
            ),
        },
    ],
}

FINAL_CTA = {
    "eyebrow": "Join the professional community",
    "title": "Help build a stronger identity and higher standard for",
    "title_accent": "project controls.",
    "description": (
        "Join as a professional, develop your recognition, engage as an employer, "
        "connect academic knowledge with practice or contribute to events, awards, "
        "publications and clubs."
    ),
    "supporting_description": (
        "39 Maidstone Innovation Centre, Maidstone, Kent, ME14 5FY · "
        "office@instituteofprojectcontrols.org"
    ),
    "primary_cta_label": "Explore Membership",
    "primary_cta_url": "/membership",
    "secondary_cta_label": "Contact IPC",
    "secondary_cta_url": "/contact",
}

SEO = {
    "title": (
        "About the Institute of Project Controls | Professional Recognition, "
        "Standards, Research & Community"
    ),
    "description": (
        "Discover the Institute of Project Controls: our purpose, mission, vision, "
        "values, professional recognition framework, employer value, academic "
        "engagement, responsible AI, events, clubs, awards and scholarships."
    ),
    "canonical_path": "/about",
    "noindex": False,
}


def sync_content(apps, schema_editor):
    AboutPageContent = apps.get_model("about", "AboutPageContent")
    content = AboutPageContent.objects.filter(key="main").first()
    if content is None:
        return

    content.hero = HERO
    content.purpose = PURPOSE
    content.statistics = STATISTICS
    content.why_intro = WHY_INTRO
    content.why_exists = WHY_EXISTS
    content.vision = VISION
    content.vision_pillars = VISION_PILLARS
    content.mission_intro = MISSION_INTRO
    content.missions = MISSIONS
    content.values_intro = VALUES_INTRO
    content.core_values = CORE_VALUES
    content.identity_intro = IDENTITY_INTRO
    content.identity_symbols = IDENTITY_SYMBOLS
    content.discipline = DISCIPLINE
    content.standards = STANDARDS
    content.audiences_intro = AUDIENCES_INTRO
    content.audiences = AUDIENCES
    content.professional_promise = PROFESSIONAL_PROMISE
    content.faq = FAQ
    content.final_cta = FINAL_CTA
    content.seo = SEO
    content.save()


class Migration(migrations.Migration):
    dependencies = [("about", "0002_sync_reference_about_content")]

    operations = [
        migrations.AddField(
            model_name="aboutpagecontent",
            name="hero",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="purpose",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="why_intro",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="vision",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="mission_intro",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="values_intro",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="identity_intro",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="discipline",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="standards",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="audiences_intro",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="audiences",
            field=models.JSONField(
                default=list,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="professional_promise",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="faq",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="final_cta",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="aboutpagecontent",
            name="seo",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.RunPython(sync_content, migrations.RunPython.noop),
    ]
