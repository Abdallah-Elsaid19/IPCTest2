from django.db import migrations, models
import ipc_backend.validators


def card(icon, title, description, **extra):
    return {"icon": icon, "title": title, "description": description, **extra}


def sync_preview_17_content(apps, schema_editor):
    Content = apps.get_model("home", "HomeContent")
    content = Content.objects.filter(key="main").first()
    if content is None:
        return

    content.hero = {
        "announcement": "Membership and professional recognition applications are open. Join the specialist professional community for project controls.",
        "eyebrow": "The Specialist Professional Home for Project Controls",
        "title": "Professional recognition for the people behind credible project decisions.",
        "title_lines": [
            "Professional recognition for",
            "the people behind credible",
            "project decisions.",
        ],
        "description": "The Institute of Project Controls recognises, develops and connects the professionals who plan, measure, forecast, assure and improve project delivery.",
        "details": [
            "Build a visible professional identity through membership, Associate Fellowship and Fellowship. Develop through London Master Class Events, regional clubs, awards, scholarships, publications, research and an employer-connected professional community.",
            "Project controls is more than reporting progress. It is the integrated discipline that connects scope, schedule, cost, risk, change, data and professional judgement so that leaders can act with greater confidence.",
        ],
        "cta_label": "Explore Membership & Recognition",
        "cta_url": "/membership",
        "secondary_cta_label": "View London Master Classes",
        "secondary_cta_url": "/events",
        "tertiary_cta_label": "Contact the Institute",
        "tertiary_cta_url": "/information-session",
        "image_url": "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/4f05a0f54f8c4bbbab2916e0126a28b9.webp",
        "image_alt": "IPC symbol of wisdom, foresight and professional judgement",
        "annotations": ["Scope", "Schedule", "Cost", "Risk & Change", "Data", "Leadership"],
    }
    content.decision_confidence = {
        "eyebrow": "Decision confidence",
        "title": "What credible project controls protects.",
        "items": [
            card("ri-focus-3-line", "Scope", "Clear definition, coding and approved baselines."),
            card("ri-calendar-check-line", "Schedule", "Logic, progress, critical path and recovery."),
            card("ri-money-pound-circle-line", "Cost", "Budgets, commitments, forecasts and value."),
            card("ri-scales-3-line", "Risk & Change", "Uncertainty, impact, contingency and control."),
            card("ri-database-2-line", "Data", "Validity, traceability, assurance and insight."),
            card("ri-user-star-line", "Leadership", "Professional challenge, ethics and action."),
        ],
    }
    content.principles = {
        "items": [
            {"title": "5-step pathway", "description": "Progress from affiliation and membership to Associate Fellowship and senior Fellowship."},
            {"title": "London Master Classes", "description": "Evidence-led professional events on the decisions behind project controls."},
            {"title": "Up to 40 places", "description": "Scholarship or bursary support may be available per intake, subject to conditions."},
            {"title": "4 regional clubs", "description": "London, Nottingham, Manchester and Kent – Maidstone professional communities."},
        ]
    }
    content.why_ipc = {
        "eyebrow": "Why IPC exists",
        "title": "Project controls deserves its own visible professional identity.",
        "description": "The professionals who create baselines, test progress, challenge forecasts and protect data integrity carry significant responsibility, but their professional contribution is often underestimated.",
        "body": [
            "Projects depend on people who can convert complex information into evidence that leaders can trust. They connect what was approved with what has happened, what is changing, what remains uncertain and what action should be considered.",
            "Yet project controls is sometimes described as software operation, report production or administrative support. That does not reflect the judgement, statistical discipline, commercial awareness, ethical challenge and technical integration required to produce reliable controls information.",
            "IPC provides a specialist professional home. It creates recognition levels that professionals can use after their name, develops competence through events and publications, connects employers with talent, supports research, widens access through scholarships and recognises achievement through awards.",
            "The Institute complements the wider project, engineering, commercial and academic communities. Its focus is specific: strengthening the people and practices that make project information credible and decisions better informed.",
        ],
        "callout_title": "The IPC proposition",
        "callout": "You do more than report progress. You create the evidence from which better project decisions can be made. IPC helps make that professional value visible through recognition, competence, learning, community and contribution.",
    }
    content.recognition_pathway = {
        "eyebrow": "Membership & professional recognition",
        "title": "A visible pathway from entering the profession to senior Fellowship.",
        "description": "Apply at the level that reflects your current evidence. Progress as your competence, responsibility, judgement and contribution grow.",
        "cta_label": "View the Full Recognition Framework",
        "cta_url": "/membership",
        "secondary_cta_label": "Ask Which Grade Fits",
        "secondary_cta_url": "/information-session",
        "items": [
            {"id": "affiliate", "label": "Affiliate Member", "level": "AffIPC", "path": "/membership/affiliate", "description": "For students, graduates, apprentices, career changers and people beginning a project controls journey."},
            {"id": "professional", "label": "Professional Member", "level": "MIPC", "path": "/membership/professional", "description": "For practising professionals in project controls, PMO, planning, cost, risk, commercial or related delivery roles."},
            {"id": "af-l3", "label": "Associate Fellow Level 3", "level": "AFIPC L3", "path": "/membership/associate-fellow-l3", "description": "Foundation recognition for technician-level project controls knowledge, application and professional conduct."},
            {"id": "af-l4", "label": "Associate Fellow Level 4", "level": "AFIPC L4", "path": "/membership/associate-fellow-l4", "description": "Applied practitioner recognition for professionals using project controls methods on live projects."},
            {"id": "fellow", "label": "Fellow Level 6", "level": "FIPC", "path": "/membership/fellow", "description": "Senior recognition for leaders, managers, consultants, assurance specialists and recognised experts."},
        ],
    }
    content.discipline_system = {
        "eyebrow": "Competence framework",
        "title": "Recognition built around the real work of project controls.",
        "description": "The framework considers knowledge, skills, behaviour, evidence, responsibility and professional impact — not job title alone.",
        "progression_title": "Progressive depth",
        "progression": "The same core domains appear across recognition levels, but the expected depth increases from awareness and supervised contribution to independent application, assurance, leadership and strategic influence.",
        "levels": ["Level 3 foundation competence", "Level 4 applied practitioner judgement", "Level 6 leadership and assurance", "Evidence and professional conduct at every level"],
        "items": [
            {"id": "d1", "label": "Governance & Baselines", "icon": "01", "description": "Project lifecycle, controls plans, coding, responsibilities, approved baselines and decision routes."},
            {"id": "d2", "label": "Planning & Scheduling", "icon": "02", "description": "Activities, logic, milestones, critical path, resources, progress, uncertainty and recovery."},
            {"id": "d3", "label": "Cost & Estimating", "icon": "03", "description": "Estimates, budgets, commitments, actuals, accruals, cash flow, forecasts and out-turn confidence."},
            {"id": "d4", "label": "Risk, Opportunity & Change", "icon": "04", "description": "Uncertainty, risk analysis, contingency, controlled change, impact assessment and commercial awareness."},
            {"id": "d5", "label": "Data, Reporting & Assurance", "icon": "05", "description": "Data validity, traceability, variance, trends, earned value, dashboards and independent challenge."},
            {"id": "d6", "label": "AI & Digital Controls", "icon": "06", "description": "Responsible AI, automation, analytics, BIM-related information, verification and human oversight."},
            {"id": "d7", "label": "Sustainability & Net Zero", "icon": "07", "description": "Carbon, resources, environmental impact, sustainable sequencing and whole-life value."},
            {"id": "d8", "label": "Leadership & Professional Conduct", "icon": "08", "description": "Ethics, communication, accountability, mentoring, stakeholder influence and continuous improvement."},
        ],
    }
    content.values = {
        "eyebrow": "Our values",
        "title": "Values specific to project controls.",
        "description": "These principles guide professional recognition, events, publications, partnerships, awards, scholarships and conduct.",
        "items": [
            card("ri-file-search-line", "Evidence before assertion", "Project controls must be grounded in credible data, transparent assumptions, auditable analysis and professional judgement."),
            card("ri-bar-chart-grouped-line", "Statistical discipline", "Forecasts should recognise uncertainty, confidence, probability and variation rather than presenting false certainty."),
            card("ri-database-2-line", "Data validity", "Controls outputs are only as strong as the coding, baselines, progress data, cost data and governance behind them."),
            card("ri-user-star-line", "Professional judgement", "Tools and dashboards support decisions, but accountable professional judgement remains essential."),
            card("ri-robot-2-line", "Responsible AI", "AI should improve productivity, anomaly detection and scenario analysis while protecting ethics, transparency and human accountability."),
            card("ri-leaf-line", "Sustainable outcomes", "Project controls should help organisations manage carbon, resources, lifecycle value and responsible delivery."),
            card("ri-shield-check-line", "Assurance and integrity", "Professionals should report reality clearly, challenge weak evidence and support ethical decision-making."),
            card("ri-building-line", "Employer relevance", "IPC should help organisations build capability, improve delivery confidence and recognise specialist talent."),
            card("ri-award-line", "Professional recognition", "Project controls practitioners deserve a visible identity, progression pathway and respected professional standing."),
        ],
    }
    content.audiences = {
        "eyebrow": "Who we serve",
        "title": "Audience Value Proposition",
        "description": "Every audience should understand why project controls matters and why IPC is the right institution to engage with.",
        "items": [
            {"title": "Professionals", "value": "Recognition, post-nominals, career differentiation, competence development, events, journals, magazine content, awards, clubs and professional identity.", "message": "You do more than report progress. IPC helps you evidence the decision value you create."},
            {"title": "Employers", "value": "Capability mapping, workforce recognition, stronger controls culture, talent development, recruitment signalling and delivery confidence.", "message": "Your projects depend on credible data, forecasts and decisions. IPC helps strengthen that capability."},
            {"title": "Universities and colleges", "value": "Student membership, research links, journal papers, prizes, guest lectures, employability and employer connections.", "message": "Connect project controls education with professional identity and employer demand."},
            {"title": "Sponsors and partners", "value": "Visibility, thought leadership, awards, scholarships, club support, events and association with a specialist profession.", "message": "Support the profession that improves delivery confidence, sustainability and value for money."},
            {"title": "Public sector and NGOs", "value": "Better governance, transparency, public value, sustainability, data integrity and capability development.", "message": "Project controls protects public value through visibility, assurance and evidence-based decisions."},
        ],
    }
    content.ecosystem = {
        "eyebrow": "The IPC professional ecosystem",
        "title": "More than a membership certificate.",
        "description": "IPC connects recognition, learning, community, opportunity, research and professional contribution in one specialist institution.",
        "items": [
            card("ri-medal-line", "Membership & Fellowship", "Professional identity and post-nominals from AffIPC and MIPC to Associate Fellowship and FIPC.", label="Recognition", cta="Explore Membership", url="/membership"),
            card("ri-calendar-event-line", "London Master Classes", "Evidence-led events on planning, cost, risk, change, data, AI, sustainability and leadership.", label="Learning", cta="Explore Events", url="/events"),
            card("ri-graduation-cap-line", "Scholarships & Bursaries", "Support for eligible learners, professionals, veterans, returners, consultants and community contributors.", label="Access", cta="Explore Scholarships", url="/scholarships"),
            card("ri-award-line", "Awards & Prizes", "Academic, commercial, professional and special recognition for work that advances the discipline.", label="Achievement", cta="Explore Awards", url="/awards"),
            card("ri-community-line", "Regional Clubs", "Local professional talks, networking, mentoring and employer engagement in four regional communities.", label="Community", cta="Explore Clubs", url="/clubs"),
            card("ri-book-open-line", "Magazine & Research", "Professional articles, academic papers, case studies, interviews, research notes and practitioner insight.", label="Knowledge", cta="Contribute Knowledge", url="/publications"),
            card("ri-hand-heart-line", "Sponsorship", "Support learners, events, awards, clubs, publications, research and social-impact activity.", label="Impact", cta="Explore Sponsorship", url="/sponsorship"),
        ],
    }
    content.events = {
        "eyebrow": "London Master Class Events",
        "title": "Learn what changed the decision — not only what appeared on the dashboard.",
        "description": "IPC events combine technical depth, applied evidence, professional challenge and relevant networking. Confirmed dates, venues and speakers are published separately. Register interest to receive programme announcements.",
        "primary_cta_label": "Explore the Events Programme",
        "primary_cta_url": "/events",
        "secondary_cta_label": "Register Interest",
        "secondary_cta_url": "/information-session",
        "items": [
            card("ri-calendar-check-line", "Schedule Assurance & Recovery", "Logic quality, critical path, progress, constraints, baseline integrity and recovery decisions.", label="Planning & Schedule"),
            card("ri-money-pound-circle-line", "Cost Engineering & Forecast Confidence", "Estimates, budgets, commitments, earned value, productivity and credible out-turn forecasts.", label="Cost & Forecast"),
            card("ri-scales-3-line", "Risk, Change, Delay & Claims Readiness", "Uncertainty, impact analysis, records, delay evidence, governance and dispute avoidance.", label="Risk & Change"),
            card("ri-robot-2-line", "Responsible AI & Predictive Controls", "Data readiness, anomaly detection, scenario analysis, automation, verification and human oversight.", label="AI & Data"),
            card("ri-leaf-line", "Carbon, Resources & Whole-Life Value", "Integrating carbon, schedule, cost, risk, resources and responsible delivery choices.", label="Sustainability"),
            card("ri-shield-star-line", "Governance, Assurance & Executive Insight", "Controls plans, data assurance, independent challenge, executive reporting and leadership.", label="Leadership"),
        ],
    }
    content.scholarships = {
        "eyebrow": "Scholarships & bursaries",
        "title": "Opportunity should not depend on already knowing the profession.",
        "description": "IPC aims to support up to 40 scholarship or bursary places per intake, subject to funding, eligibility, capacity and written approval.",
        "body": "Selection gives significant weight to character, need, service, social impact, resilience, leadership, motivation and future potential. Existing project controls knowledge should carry only a small part of the scholarship judgement.",
        "primary_cta_label": "Explore Scholarships",
        "primary_cta_url": "/scholarships",
        "secondary_cta_label": "Sponsor a Learner",
        "secondary_cta_url": "/information-session",
        "items": [
            card("ri-door-open-line", "Access and hardship", "Remove financial, employment and educational barriers."),
            card("ri-medal-line", "Veterans and transition", "Translate service and public-sector experience into new careers."),
            card("ri-briefcase-4-line", "Self-employed professionals", "Support consultants and freelancers without employer-funded development."),
            card("ri-hand-heart-line", "Community and social impact", "Recognise service, charity leadership and positive influence."),
            card("ri-refresh-line", "Career returners", "Rebuild confidence and professional direction after a career break."),
            card("ri-seedling-line", "Emerging talent", "Support learners and early-career professionals with strong potential."),
        ],
    }
    content.awards = {
        "eyebrow": "Awards & prizes",
        "title": "Make excellent work, research, leadership and contribution visible.",
        "description": "IPC awards recognise evidence-based achievement across the full project controls ecosystem.",
        "primary_cta_label": "View All Awards & Prizes",
        "primary_cta_url": "/awards",
        "secondary_cta_label": "Submit a Nomination",
        "secondary_cta_url": "/awards#nomination-form",
        "items": [
            card("ri-graduation-cap-line", "Academic Awards", "Dissertations, student research, emerging researchers, academic contribution, programmes and academic-industry collaboration."),
            card("ri-building-line", "Commercial Awards", "Teams, innovation, digital transformation, cost and schedule performance, risk, change, sustainability and employer capability."),
            card("ri-user-star-line", "Professional Awards", "Professionals, emerging talent, planners, cost engineers, risk specialists, consultants, mentors, leaders and Fellows."),
            card("ri-award-line", "Special Recognition", "Integrity, community impact, transition, inclusion, international contribution, clubs, publications and Institute service."),
        ],
    }
    content.clubs = {
        "eyebrow": "Regional clubs",
        "title": "A national professional community with local places to belong.",
        "description": "Regional clubs create accessible opportunities for technical talks, networking, employer engagement, mentoring and student participation.",
        "primary_cta_label": "Explore Regional Clubs",
        "primary_cta_url": "/clubs",
        "secondary_cta_label": "Join or Support a Club",
        "secondary_cta_url": "/information-session",
        "items": [
            card("ri-map-pin-line", "London", "Flagship master classes, senior roundtables, major-project discussion and professional networking."),
            card("ri-map-pin-line", "Nottingham", "Midlands professional community, university engagement and emerging talent development."),
            card("ri-map-pin-line", "Manchester", "Northern infrastructure, employer collaboration, technical talks and professional connection."),
            card("ri-map-pin-line", "Kent – Maidstone", "South East professional activity close to the Institute office at Maidstone Innovation Centre."),
        ],
    }
    content.publications = {
        "eyebrow": "Research & publications",
        "title": "Connect academic knowledge with professional practice.",
        "description": "IPC publications should create useful, evidence-led knowledge for professionals, employers, students and researchers.",
        "primary_cta_label": "Propose an Article or Paper",
        "primary_cta_url": "/information-session",
        "secondary_cta_label": "Discuss Academic Partnership",
        "secondary_cta_url": "/information-session",
        "items": [
            card("ri-article-line", "Professional Magazine", "Interviews, case studies, technical articles, member profiles, employer features, event learning and regional club activity."),
            card("ri-book-open-line", "Academic Journal Papers", "Research connecting theory, project data, professional practice, education and employer questions."),
            card("ri-file-chart-line", "Technical Case Studies", "Anonymised examples covering baselines, recovery, forecasting, risk, change, assurance and digital transformation."),
            card("ri-flask-line", "Research & Guidance", "Applied work on AI, statistics, skills, sustainability, data integrity and the future of project controls."),
        ],
    }
    content.partners = {
        "eyebrow": "Corporate, consultancy and academic value",
        "title": "Partnership routes for the organisations that build, employ and educate the profession.",
        "description": "IPC helps organisations connect workforce capability, professional recognition, research, learning, social value and sector visibility.",
        "primary_cta_label": "Discuss Partnership",
        "primary_cta_url": "/information-session",
        "secondary_cta_label": "Explore Sponsorship",
        "secondary_cta_url": "/sponsorship",
        "items": [
            card("ri-building-line", "Build recognised capability.", "Employers", bullets=["Map staff progression against recognition levels", "Strengthen professional development and retention", "Develop controls culture and data integrity", "Engage staff in events, clubs and mentoring"]),
            card("ri-briefcase-4-line", "Demonstrate specialist value.", "Consultancies", bullets=["Strengthen consultant profiles and tender CVs", "Contribute thought leadership and case studies", "Develop staff through events and recognition", "Engage with awards, research and employers"]),
            card("ri-graduation-cap-line", "Connect education with the profession.", "Academic partners", bullets=["Student membership and professional progression", "Dissertation prizes and academic awards", "Guest lectures and employer connections", "Research, journal papers and applied collaboration"]),
            card("ri-government-line", "Protect public and social value.", "Public sector & NGOs", bullets=["Improve project governance and transparency", "Develop planning, risk and reporting capability", "Support sustainability and responsible delivery", "Access scholarships and community programmes"]),
        ],
    }
    content.sponsorship = {
        "eyebrow": "Sponsorship & strategic partnership",
        "title": "Support the people, ideas and communities that strengthen project delivery.",
        "description": "Organisations can sponsor learners, master classes, awards, regional clubs, publications, research and professional community activity.",
        "body": "Sponsorship benefits are agreed separately from professional decisions. Sponsors may support the mission, but they do not determine membership, scholarship, judging or publication outcomes.",
        "primary_cta_label": "Explore Sponsorship",
        "primary_cta_url": "/sponsorship",
        "secondary_cta_label": "Start a Conversation",
        "secondary_cta_url": "/information-session",
        "items": [
            card("ri-graduation-cap-line", "Sponsor learners", "Support one learner, a cohort or a named scholarship fund."),
            card("ri-calendar-event-line", "Sponsor events", "Support a master class, venue, speaker or delegate access."),
            card("ri-award-line", "Sponsor awards", "Support recognition without controlling judging outcomes."),
            card("ri-community-line", "Sponsor clubs", "Build sustainable local professional communities."),
            card("ri-book-open-line", "Sponsor publications", "Support magazine, journal, research and technical content."),
            card("ri-links-line", "Strategic partnership", "Combine several activities around a shared professional goal."),
        ],
    }
    content.governance = {
        "eyebrow": "Credibility and professional conduct",
        "title": "Trust is the value behind every IPC activity.",
        "description": "Recognition, awards, scholarships, publications and partnerships should be governed through evidence, fairness and professional independence.",
        "items": [
            card("ri-file-search-line", "Evidence-based decisions", "Recognition and awards should be supported by relevant, credible and proportionate evidence."),
            card("ri-shield-check-line", "Independent outcomes", "Sponsorship or partnership should not purchase membership, Fellowship, scholarships or awards."),
            card("ri-scales-3-line", "Conflicts managed", "Reviewers, judges and contributors should declare relevant interests and withdraw where necessary."),
            card("ri-lock-line", "Data protected", "Personal, academic, client and commercial information should be handled appropriately."),
            card("ri-medal-line", "Titles used accurately", "Members should use only the grade and post-nominal formally approved by the Institute."),
            card("ri-robot-2-line", "AI used responsibly", "Automated outputs should be verified, transparent and subject to human accountability."),
            card("ri-advertisement-line", "Sponsored content identified", "Commercial support should be visible and separate from editorial or professional judgement."),
            card("ri-megaphone-line", "Public claims proportionate", "IPC recognition should not be represented as a regulated qualification or statutory licence unless separately true."),
        ],
    }
    content.faq = {
        "eyebrow": "Frequently asked questions",
        "title": "About membership, events, scholarships and professional engagement.",
        "description": "Find clear answers about the Institute and its professional routes.",
        "items": [
            {"question": "Who is the Institute of Project Controls for?", "answer": "IPC is for project controls practitioners, planners, schedulers, cost engineers, estimators, risk and change professionals, PMO specialists, commercial professionals, consultants, employers, students, academics, public-sector organisations, NGOs and professional partners."},
            {"question": "What professional recognition does IPC offer?", "answer": "The pathway includes Affiliate Member, Professional Member, Associate Fellow Level 3, Associate Fellow Level 4 and Fellow Level 6 Project Control Professional, subject to the relevant evidence and Institute requirements."},
            {"question": "Can I apply directly for Associate Fellowship or Fellowship?", "answer": "Applicants may apply for the level that reflects their current evidence. They do not always need to begin at Affiliate level. The Institute may recommend a different grade after review."},
            {"question": "Are London Master Class Events included with membership?", "answer": "Selected events may be included or prioritised, subject to membership category, registration, availability, capacity and the conditions stated for the event. Membership does not guarantee a place at every event."},
            {"question": "Who can apply for scholarships or bursaries?", "answer": "Routes may support eligible learners, professionals, veterans, career changers, returners, charity leaders, self-employed consultants, community contributors and applicants facing financial or professional barriers."},
            {"question": "Can employers and consultancies become partners?", "answer": "Yes. Organisations can engage through workforce recognition, events, awards, research, publications, regional clubs, scholarships, mentoring and strategic sponsorship."},
            {"question": "Can universities and colleges work with IPC?", "answer": "Yes. Academic engagement may include student membership, guest lectures, research, journal papers, dissertation prizes, scholarships, employer links and professional progression."},
            {"question": "Is IPC recognition a regulated qualification?", "answer": "IPC recognition is a professional membership and recognition framework. It should not be described as a regulated qualification, apprenticeship completion, chartered title or statutory licence unless a separate authorised award applies."},
        ],
    }
    content.final_cta = {
        "eyebrow": "Build your professional identity",
        "title": "Join the institution focused on the evidence behind project decisions.",
        "description": "Apply for membership, progress towards Fellowship, attend a master class, join a regional club, contribute knowledge, nominate excellence or build a partnership with IPC.",
        "primary_cta_label": "Explore Membership",
        "primary_cta_url": "/membership",
        "secondary_cta_label": "Apply by Email",
        "secondary_cta_url": "/information-session",
        "tertiary_cta_label": "Discuss Partnership",
        "tertiary_cta_url": "/information-session",
        "address": "39 Maidstone Innovation Centre, Maidstone, Kent, ME14 5FY",
        "email": "office@instituteofprojectcontrols.org",
    }
    content.seo = {
        "title": "Institute of Project Controls | Professional Recognition, Membership & Fellowship",
        "description": "The professional home for project controls recognition, membership, Fellowship, master classes, scholarships, awards, regional clubs, research and partnerships.",
        "canonical_path": "/",
        "noindex": False,
        "nofollow": False,
    }
    content.save()


HOME_FIELDS = [
    "decision_confidence",
    "why_ipc",
    "values",
    "audiences",
    "ecosystem",
    "events",
    "scholarships",
    "awards",
    "clubs",
    "publications",
    "partners",
    "sponsorship",
    "governance",
    "faq",
    "final_cta",
]


class Migration(migrations.Migration):
    dependencies = [("home", "0003_align_institution_content")]

    operations = [
        *[
            migrations.AddField(
                model_name="homecontent",
                name=name,
                field=models.JSONField(
                    default=dict,
                    validators=[ipc_backend.validators.validate_content_section],
                ),
            )
            for name in HOME_FIELDS
        ],
        migrations.RunPython(sync_preview_17_content, migrations.RunPython.noop),
    ]
