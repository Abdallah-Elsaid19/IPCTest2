from django.db import migrations
from django.utils import timezone


def seed_membership_content(apps, schema_editor):
    MembershipContent = apps.get_model("memberships", "MembershipContent")
    columns = [
        {"key": "affipc", "label": "AffIPC"}, {"key": "mipc", "label": "MIPC"},
        {"key": "afipcL3", "label": "AFIPC L3"}, {"key": "afipcL4", "label": "AFIPC L4"},
        {"key": "fipc", "label": "FIPC"},
    ]
    defaults = {
        "hero": {"eyebrow": "Professional Recognition", "title": "Membership & Recognition", "description": "Join a professional institute for project controls excellence, recognition and career progression. Five progressive grades from Affiliate to Fellow — each with detailed benefits, requirements and a clear pathway forward.", "cta_label": "Explore Membership Grades", "cta_url": "#grades", "image_url": "/images/membership/hero.svg", "image_alt": "Membership background"},
        "grades_intro": {"eyebrow": "Choose Your Grade", "title": "Explore Membership Grades", "description": "Click any grade to view full details, benefits, pricing and how to apply.", "card_cta_label": "View Details"},
        "comparison": {
            "eyebrow": "Membership Pathway", "title": "Compare IPC Membership Grades", "description": "Explore the professional position, evidence expectations and recognition associated with each IPC membership grade.", "columns": columns,
            "rows": [
                {"label": "Typical position", "values": {"affipc": "Exploring or entering", "mipc": "Active practitioner", "afipcL3": "Foundation capability", "afipcL4": "Independent applied practice", "fipc": "Strategic leadership"}},
                {"label": "Evidence depth", "values": {"affipc": "Simple statement", "mipc": "Professional profile", "afipcL3": "Work examples", "afipcL4": "Portfolio and case study", "fipc": "Senior portfolio and review"}},
                {"label": "Primary signal", "values": {"affipc": "Affiliation", "mipc": "Professional identity", "afipcL3": "Foundation competence", "afipcL4": "Applied judgement", "fipc": "Leadership and contribution"}},
                {"label": "Post-nominal", "values": {"affipc": "AffIPC", "mipc": "MIPC", "afipcL3": "AFIPC L3", "afipcL4": "AFIPC L4", "fipc": "FIPC"}},
            ],
        },
        "member_value": {
            "eyebrow": "Member Value", "title": "Recognition is the foundation. Professional opportunity is the wider value.", "description": "Membership connects visible professional standing with learning, community, events, mentoring and contribution.", "cta_label": "Start your journey", "cta_url": "#grades",
            "items": [
                {"id": "01", "title": "Professional identity", "description": "Use your approved grade and post-nominal on professional profiles, CVs and biographies."},
                {"id": "02", "title": "Career credibility", "description": "Communicate project-controls involvement and capability where job titles vary across organisations."},
                {"id": "03", "title": "CPD and development", "description": "Build a record through learning, practice, mentoring, contribution and reflection."},
                {"id": "04", "title": "Master classes and events", "description": "Access specialist technical and leadership activity through IPC programmes and regional communities."},
                {"id": "05", "title": "Mentoring and community", "description": "Connect with practitioners, employers, consultants, academics and developing professionals."},
                {"id": "06", "title": "Publication and contribution", "description": "Share articles, case studies, research, talks, mentoring and professional lessons subject to review."},
                {"id": "07", "title": "Awards and recognition", "description": "Take part in academic, commercial and professional awards and contribution pathways."},
            ],
        },
        "professional_visibility": {
            "eyebrow": "Professional Visibility", "title": "A concise title can communicate a much larger professional story.", "description": "IPC grades give varied project-controls roles a shared specialist identity across professional profiles, tender biographies and employer capability frameworks.",
            "profile": {"initials": "AM", "name": "Aisha Malik AFIPC L4", "role": "Project Controls Engineer · Planning, Cost, Risk & Performance", "connections": "500+ connections", "organisation": "Institute of Project Controls (IPC)", "badge": "Associate Fellow Level 4", "logo_url": "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/e6e47869fdd1459f891ad4c5852798c5.png"},
            "benefits": [
                {"title": "Clear market signal", "description": "Show a defined level of professional recognition supported by evidence and conduct."},
                {"title": "Employer confidence", "description": "Help recruiters, clients and leaders understand capability where role titles differ."},
                {"title": "Visible progression", "description": "Plan development from affiliation through foundation, applied and senior standing."},
            ],
        },
        "application_journey": {
            "eyebrow": "Application Journey", "title": "Professional, transparent and designed to create a useful next step.", "description": "Recognition should test evidence and judgement without rewarding confidence over competence or job title over proof.", "cta_label": "Check your grade first",
            "steps": [
                {"id": "01", "title": "Explore", "description": "Review the grades, member value and professional scope of IPC recognition."},
                {"id": "02", "title": "Select", "description": "Use the grade finder and comparison to identify the most suitable starting route."},
                {"id": "03", "title": "Prepare", "description": "Collect the CV, statement, CPD, examples, portfolio, case study or references required."},
                {"id": "04", "title": "Review", "description": "IPC reviews the submitted evidence and may request clarification or a professional discussion."},
                {"id": "05", "title": "Recognition", "description": "Receive a decision, grade recommendation, evidence request or professional-development guidance."},
            ],
        },
        "organisational_membership": {
            "eyebrow": "For Organisations", "title": "A specialist capability language for project-controls teams.", "description": "IPC membership can support workforce development, recruitment clarity, succession planning, professional culture and external confidence.",
            "items": [
                {"id": "corporate-employers", "title": "Corporate employers", "benefits": ["Capability mapping", "Recruitment clarity", "Staff recognition", "Succession planning", "Tender and client confidence"], "cta": "Discuss corporate membership", "cta_url": "/information-session"},
                {"id": "consultancies", "title": "Consultancies", "benefits": ["Consultant development", "Professional profiles", "Thought leadership", "Fellow pathways", "Client credibility"], "cta": "Discuss consultancy membership", "cta_url": "/information-session"},
                {"id": "academic-partners", "title": "Academic partners", "benefits": ["Student affiliation", "Professional progression", "Research and publication", "Employer engagement", "Scholarships and awards"], "cta": "Discuss academic partnership", "cta_url": "/information-session"},
            ],
        },
        "questions": {
            "eyebrow": "Membership Questions", "title": "Clear answers before you apply.", "description": "Understand eligibility, evidence, confidentiality, progression and professional scope.",
            "items": [
                {"id": "job-title", "question": "Do I need a job title containing ‘Project Controls’?", "answer": "No. IPC can recognise planners, schedulers, cost professionals, estimators, PMO analysts, risk professionals, commercial specialists, project managers and other related roles where relevant evidence is available."},
                {"id": "confidential-evidence", "question": "Can confidential evidence be anonymised?", "answer": "Yes. Applicants should remove confidential client names, project identifiers, personal information and sensitive commercial records where necessary."},
                {"id": "wrong-grade", "question": "What happens if I choose the wrong grade?", "answer": "The review may recommend another grade or explain what evidence is needed to progress. The aim is a useful professional outcome rather than a simple rejection."},
                {"id": "recognition-status", "question": "Is IPC recognition a qualification or chartered status?", "answer": "No. IPC is a standards-informed, evidence-based professional membership and recognition pathway. It should not be presented as a regulated qualification, apprenticeship award, chartered status or statutory licence."},
                {"id": "responsible-practice", "question": "Are AI, digital tools and sustainability included?", "answer": "Yes. Modern recognition can consider responsible use of AI and digital systems, data assurance, sustainability and carbon alongside core project-controls practice."},
            ],
            "cta_eyebrow": "Your Next Professional Step", "cta_title": "Choose a grade. Prepare your evidence. Make your contribution visible.", "cta_description": "Explore individual membership or speak with IPC about a corporate, consultancy or academic pathway.", "primary_cta_label": "Find your grade", "secondary_cta_label": "Contact membership team", "secondary_cta_url": "/information-session",
        },
        "grade_finder": {"eyebrow": "Indicative Grade Finder", "title": "Find your likely IPC starting grade", "is_active": True},
        "final_cta": {"title": "Choose your grade and apply online", "description": "Each grade has a dedicated application matched to its evidence and competence requirements. Select the grade that best reflects your current career stage."},
        "seo": {"title": "Membership & Recognition", "description": "Explore IPC membership grades, recognition pathways and professional value.", "canonical_path": "/membership", "noindex": False, "nofollow": False},
        "status": "published", "is_active": True, "published_at": timezone.now(),
    }
    MembershipContent.objects.update_or_create(key="main", defaults=defaults)


class Migration(migrations.Migration):
    dependencies = [("memberships", "0005_membershipcontent")]
    operations = [migrations.RunPython(seed_membership_content, migrations.RunPython.noop)]
