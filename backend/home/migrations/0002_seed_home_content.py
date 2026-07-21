from django.db import migrations
from django.utils import timezone


def seed_home_content(apps, schema_editor):
    HomeContent = apps.get_model("home", "HomeContent")
    defaults = {
        "hero": {
            "eyebrow": "Institute of Project Controls",
            "title": "The professional home for Project Controls",
            "description": "A standards-informed, evidence-based pathway for professionals who plan, control, assure and improve project delivery.",
            "cta_label": "Explore recognition",
            "cta_url": "/membership",
            "image_url": "https://readdy.ai/api/search-image?query=Highly%20detailed%20realistic%20extreme%20close-up%20portrait%20of%20a%20majestic%20owl%20with%20one%20large%20piercing%20amber-gold%20eye%20clearly%20visible%20intricate%20layered%20feather%20textures%20in%20charcoal%20grey%20and%20warm%20brown%20tones%20the%20feathers%20gradually%20dissolve%20into%20abstract%20geometric%20dot%20patterns%20toward%20the%20edges%20deep%20black%20background%20with%20subtle%20radial%20rings%20dramatic%20side%20lighting%20casting%20architectural%20shadows%20the%20owl%20appears%20as%20an%20institutional%20symbol%20of%20wisdom%20intelligence%20and%20foresight%20editorial%20photography%20high%20contrast%20moody%20atmosphere&width=1400&height=900&seq=ipc-owl-hero-2026&orientation=landscape",
            "image_alt": "IPC - Institute of Project Controls symbol of wisdom, foresight and professional judgement",
            "annotations": ["Schedule Confidence 97%", "Risk Exposure — Tier 1", "Cost Baseline ±1.8%", "EAC Forecast £312m"],
        },
        "principles": {
            "items": [
                {"title": "Professional recognition", "description": "Structured grades and visible professional standing."},
                {"title": "Competence based", "description": "Evidence, judgement, responsibility and influence."},
                {"title": "Responsible technology", "description": "Digital insight with human accountability."},
                {"title": "Public value", "description": "Performance, safety, sustainability and carbon."},
            ]
        },
        "discipline_system": {
            "eyebrow": "The integrated discipline",
            "title": "Better information. Earlier insight. Stronger decisions.",
            "description": "Project controls turns project information into credible decisions by connecting governance, scope, planning, cost, risk, change, data, sustainability and leadership.",
            "items": [
                {"id": "d1", "label": "Governance & assurance", "icon": "", "description": "Support stage gates, approvals, escalation, reporting cycles and decision confidence."},
                {"id": "d2", "label": "Scope & structures", "icon": "", "description": "Align WBS, CBS and coding so schedule, cost, risk and reporting describe the same project."},
                {"id": "d3", "label": "Planning & scheduling", "icon": "P", "description": "Build credible logic, maintain baselines and explain constraints, variance and recovery."},
                {"id": "d4", "label": "Cost & forecasting", "icon": "£", "description": "Turn estimates, commitments, actuals and trends into realistic forecasts and choices."},
                {"id": "d5", "label": "Risk, change & commercial", "icon": "R", "description": "Connect uncertainty, contingency, change control and defensible project records."},
                {"id": "d6", "label": "Digital, AI & sustainability", "icon": "AI", "description": "Improve insight while protecting data quality, explainability, accountability and public value."},
            ],
        },
        "recognition_pathway": {
            "eyebrow": "Recognition",
            "title": "Find the level that reflects your current contribution.",
            "description": "Evidence, professional judgement, accountability and influence deepen as members progress.",
            "cta_label": "View all grades", "cta_url": "/membership",
            "items": [
                {"id": "affiliate", "label": "Affiliate", "level": "Entry", "path": "/membership/affiliate", "description": "For those building foundational knowledge in project controls."},
                {"id": "professional", "label": "Professional", "level": "Core", "path": "/membership/professional", "description": "Demonstrating competent application of project controls disciplines."},
                {"id": "af-l3", "label": "Associate Fellow L3", "level": "Advanced", "path": "/membership/associate-fellow-l3", "description": "Leading complex project controls with strategic oversight."},
                {"id": "af-l4", "label": "Associate Fellow L4", "level": "Senior", "path": "/membership/associate-fellow-l4", "description": "Defining standards and mentoring the next generation."},
                {"id": "fellow", "label": "Fellow", "level": "Pinnacle", "path": "/membership/fellow", "description": "Recognised authority shaping the future of project controls globally."},
            ],
        },
        "intelligence_layer": {
            "eyebrow": "Responsible Digital Practice",
            "title": "Technology improves insight. Judgement protects credibility.",
            "description": "IPC treats digital systems, dashboards, analytics and AI as core capabilities, supported by validation, explainability, confidentiality and human accountability.",
            "layers": [
                {"label": "Project controls fundamentals", "description": "Scope, baseline, cost, schedule, risk and change", "status": "01"},
                {"label": "Digital controls systems", "description": "Planning, cost, risk, EVM, BI and BIM", "status": "02"},
                {"label": "Data governance", "description": "Quality, provenance, security and audit trail", "status": "03"},
                {"label": "AI and analytics", "description": "Automation, anomaly detection and scenario testing", "status": "04"},
                {"label": "Professional judgement", "description": "Validation, challenge and accountability", "status": "05"},
            ],
            "principles": [
                {"title": "Data provenance", "description": "Understand where information came from, who approved it and whether it is fit for purpose."},
                {"title": "Model validation", "description": "Test outputs against known project facts, alternative methods and sensitivity analysis."},
                {"title": "Human accountability", "description": "AI supports professional judgement; it does not replace responsibility."},
                {"title": "Explainability", "description": "Communicate methods, assumptions, limitations and confidence in plain language."},
                {"title": "Confidentiality", "description": "Protect employer, client, personal and commercially sensitive information."},
                {"title": "Bias and optimism", "description": "Challenge misleading comparisons, weak assumptions and unjustified confidence."},
            ],
        },
        "member_value": {
            "eyebrow": "Member value", "title": "Recognition, opportunity and a community in which to progress.",
            "description": "Membership creates professional identity while opening routes into development, events, mentoring, awards, publications and contribution.",
            "items": [
                {"id": "recognition", "icon": "ri-award-line", "title": "Recognition", "description": "Membership grade, certificate, post-nominal and visible professional identity."},
                {"id": "cpd-development", "icon": "ri-book-open-line", "title": "CPD & development", "description": "Technical content, structured reflection and continuing professional development."},
                {"id": "master-classes", "icon": "ri-presentation-line", "title": "Master classes", "description": "Planning, cost, risk, delay, leadership, AI, sustainability and commercial practice."},
                {"id": "regional-clubs", "icon": "ri-community-line", "title": "Regional clubs", "description": "Professional talks, networking, site visits and local community engagement."},
                {"id": "mentoring", "icon": "ri-user-heart-line", "title": "Mentoring", "description": "Peer and senior mentoring for new entrants, practitioners and future leaders."},
                {"id": "awards-prizes", "icon": "ri-trophy-line", "title": "Awards & prizes", "description": "Academic, commercial, professional and special recognition opportunities."},
                {"id": "publications", "icon": "ri-article-line", "title": "Publications", "description": "Professional magazine content, case studies, lessons learned and thought leadership."},
                {"id": "research", "icon": "ri-flask-line", "title": "Research", "description": "Applied research and collaboration between education, employers and practice."},
            ],
        },
        "organisational_value": {
            "eyebrow": "Organisational value", "title": "Develop capability across people, projects and organisations.",
            "description": "IPC partnerships support talent pathways, professional recognition, research, industry engagement and organisational credibility.",
            "primary_cta_label": "Corporate partnership", "primary_cta_url": "/sponsorship", "secondary_cta_label": "Academic partnership", "secondary_cta_url": "/sponsorship",
            "items": [
                {"id": "corporate-partners", "audience": "Corporate partners", "icon": "ri-building-line", "title": "Build stronger professional pathways.", "description": "Map development against recognition levels, support workforce capability and strengthen tender narratives."},
                {"id": "consultancy-partners", "audience": "Consultancy partners", "icon": "ri-briefcase-4-line", "title": "Make expertise more visible.", "description": "Support consultant recognition, professional contribution, case studies and industry engagement."},
                {"id": "academic-partners", "audience": "Academic partners", "icon": "ri-graduation-cap-line", "title": "Connect learning with practice.", "description": "Link programmes, learners, research, employers and professional communities."},
            ],
        },
        "application_journey": {
            "eyebrow": "Evidence-based application", "title": "A clear route to professional recognition.",
            "description": "Every application should be assessed proportionately, consistently and with respect for the applicant’s current level of responsibility.",
            "cta_label": "Find your starting grade", "cta_url": "/membership",
            "steps": [
                {"id": "01", "title": "Choose your pathway", "description": "Identify the professional grade that best reflects your current experience and level of responsibility."},
                {"id": "02", "title": "Prepare your evidence", "description": "Provide relevant qualifications, experience and evidence of professional competence."},
                {"id": "03", "title": "Submit your application", "description": "Complete the application and submit the required supporting documents for review."},
                {"id": "04", "title": "Professional assessment", "description": "Your application is assessed proportionately against the relevant professional requirements."},
                {"id": "05", "title": "Recognition", "description": "Approved applicants receive their professional grade, digital credential and title-use guidance."},
            ],
        },
        "seo": {"title": "Institute of Project Controls", "description": "The professional home for project controls recognition, learning and community.", "canonical_path": "/home", "noindex": False, "nofollow": False},
        "status": "published", "is_active": True, "published_at": timezone.now(),
    }
    HomeContent.objects.update_or_create(key="main", defaults=defaults)


class Migration(migrations.Migration):
    dependencies = [("home", "0001_initial")]
    operations = [migrations.RunPython(seed_home_content, migrations.RunPython.noop)]
