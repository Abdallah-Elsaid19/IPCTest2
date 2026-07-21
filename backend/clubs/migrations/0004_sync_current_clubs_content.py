from django.db import migrations
from django.utils import timezone


def sync_content(apps, schema_editor):
    ClubPageContent = apps.get_model("clubs", "ClubPageContent")
    content = ClubPageContent.objects.filter(key="main").first()
    if content is None:
        content = ClubPageContent(key="main", regional_clubs=[], activities=[], audience_values=[])
    if not content.legacy_content:
        content.legacy_content = {
            "regional_clubs": content.regional_clubs,
            "activities": content.activities,
            "audience_values": content.audience_values,
        }
    content.hero = {"eyebrow": "IPC Regional Clubs", "title": "Where professional knowledge becomes community.", "description": "Join local project-controls professionals, employers, consultants, academics and learners for talks, networking, site visits, mentoring and practical exchange.", "primary_cta_label": "Find your regional club", "primary_cta_url": "#locations", "secondary_cta_label": "Volunteer or speak", "secondary_cta_url": "#contribute"}
    content.principles = {"items": [
        {"id": "practice-led", "title": "Practice-led", "description": "Learn from methods, projects, evidence and lessons across sectors."},
        {"id": "locally-connected", "title": "Locally connected", "description": "Build relationships in London, Nottingham, Manchester or Kent–Maidstone."},
        {"id": "professionally-useful", "title": "Professionally useful", "description": "Support CPD, confidence, mentoring and visible contribution."},
        {"id": "technical-exchange", "title": "Technical exchange", "description": "Talks and discussions grounded in project-controls practice."},
    ]}
    content.purpose = {"eyebrow": "Why regional clubs matter", "title": "Networking should create professional value—not just exchange business cards.", "description": "IPC clubs create spaces where professionals compare methods, hear lessons learned, understand different sectors, meet employers and identify mentors. They also help new entrants reduce isolation and understand the project-controls profession more quickly.", "items": [
        {"id": "01", "label": "Knowledge", "title": "Learn from practice", "description": "Discuss planning, cost, risk, change, data, AI, sustainability, governance and commercial issues."},
        {"id": "02", "label": "Connection", "title": "Build a cross-sector network", "description": "Meet practitioners, employers, consultants, academics, recruiters and emerging professionals."},
        {"id": "03", "label": "Development", "title": "Strengthen CPD and confidence", "description": "Turn talks, mentoring, reflection and applied learning into meaningful professional development."},
        {"id": "04", "label": "Contribution", "title": "Lead and give back", "description": "Speak, mentor, host, support learners, judge awards and help shape regional activity."},
    ]}
    content.locations_intro = {"eyebrow": "Regional network", "title": "Find the community closest to where you work or study.", "description": "Select a region to see its professional purpose, likely audience and suitable activity. Confirmed dates and venues should be managed through the website CMS.", "notice": "Regional clubs are professional communities, not separate awarding or recognition bodies. Membership and recognition decisions remain governed by the applicable IPC process."}
    content.regional_clubs = [
        {"id": "london", "icon": "ri-building-line", "name": "London", "label": "Master classes and senior network", "description": "A central professional hub for project-controls practice.", "detail": "London activity can connect Master Classes with senior roundtables, speakers, consultancies, employers, academics and professionals working across major projects.", "focus": "Technical depth, leadership and cross-sector professional exchange.", "audience": "Practitioners, senior professionals, employers, consultants and academics.", "activity": "Master classes, roundtables, networking and employer engagement.", "cta_label": "Register interest in London"},
        {"id": "nottingham", "icon": "ri-government-line", "name": "Nottingham", "label": "Regional practice and education", "description": "Connect regional practice, education and professional development.", "detail": "Nottingham activity can support local practitioners, academic partners, learners and employers through talks, networking, mentoring and professional-development sessions.", "focus": "Regional practice exchange, education and employability.", "audience": "Practitioners, students, academic partners, employers and training providers.", "activity": "Technical talks, student engagement, mentoring and employer connection.", "cta_label": "Register interest in Nottingham"},
        {"id": "manchester", "icon": "ri-community-line", "name": "Manchester", "label": "Cross-sector professional community", "description": "Share project-controls practice across sectors and career stages.", "detail": "Manchester activity can bring together professionals from major projects, consultancies, infrastructure, technology, education and regional employers.", "focus": "Cross-sector exchange, employer connection and emerging talent.", "audience": "Practitioners, employers, consultants, students and early-career professionals.", "activity": "Technical sessions, professional networking, emerging-talent activity and site visits where available.", "cta_label": "Register interest in Manchester"},
        {"id": "kent-maidstone", "icon": "ri-map-pin-line", "name": "Kent–Maidstone", "label": "Employer and learner connections", "description": "Build a connected project-controls community in Kent.", "detail": "Kent–Maidstone activity can link the Institute’s Maidstone base with local employers, consultants, academic partners, learners and practitioners.", "focus": "Local capability, learner development and employer engagement.", "audience": "Local practitioners, employers, learners, academics and career changers.", "activity": "Professional talks, mentoring, learner engagement and local networking.", "cta_label": "Register interest in Kent–Maidstone"},
    ]
    content.programme_intro = {"eyebrow": "Club programme", "title": "Learn, connect, contribute and progress.", "description": "Regional activity should combine technical learning with professional connection and visible routes to contribution."}
    content.activities = [
        {"id": "01", "icon": "ri-presentation-line", "title": "Technical talks", "description": "Planning, scheduling, cost, forecasting, risk, change, performance, commercial practice, data and assurance."},
        {"id": "02", "icon": "ri-discuss-line", "title": "Professional roundtables", "description": "Senior conversations on controls maturity, AI, data, governance, capability and complex project delivery."},
        {"id": "03", "icon": "ri-user-heart-line", "title": "Mentoring circles", "description": "Structured peer and senior mentoring for early-career members and Associate Fellows."},
        {"id": "04", "icon": "ri-building-2-line", "title": "Site visits and demonstrations", "description": "Project showcases, systems demonstrations and practical learning where access and confidentiality allow."},
        {"id": "05", "icon": "ri-briefcase-line", "title": "Employer engagement", "description": "Events where employers, recruiters, consultants and academic partners can meet talent and share industry needs."},
        {"id": "06", "icon": "ri-graduation-cap-line", "title": "Student and emerging-talent activity", "description": "Career talks, learner engagement, scholarship links and entry routes into project controls."},
    ]
    content.audiences_intro = {"eyebrow": "Value at every career stage", "title": "Different professionals gain different value from the same community.", "description": "A strong club programme supports confidence, practice, leadership and organisational capability."}
    content.audience_values = [
        {"id": "early-career", "icon": "ri-seedling-line", "title": "Early-career members", "description": "Reduce isolation, understand the profession quickly, meet employers and identify mentors.", "cta_label": "Find a regional club"},
        {"id": "practitioners", "icon": "ri-tools-line", "title": "Practitioners", "description": "Exchange practical knowledge across sectors and specialist project-controls disciplines.", "cta_label": "Explore technical activity"},
        {"id": "senior", "icon": "ri-user-star-line", "title": "Senior professionals", "description": "Speak, mentor, lead roundtables, judge awards and contribute to standards and guidance.", "cta_label": "Contribute to a club"},
        {"id": "employers", "icon": "ri-building-line", "title": "Employers", "description": "Support CPD, strengthen employer brand and connect with project-controls talent.", "cta_label": "Partner with a club"},
    ]
    content.upcoming = {"eyebrow": "Upcoming activity", "title": "Keep club information current, credible and easy to manage.", "description": "These are CMS-ready placeholders. Replace them only with confirmed event titles, dates, venues, speakers and registration information.", "featured": {"type": "Featured regional activity", "title": "[Confirmed club event title managed in CMS]", "description": "[Short event description, professional learning outcome, intended audience and confirmed registration information.]", "meta": ["[Regional club]", "[Confirmed date]", "[Venue or online]", "[Registration status]"], "cta_label": "View confirmed activity"}, "items": [
        {"type": "Technical talk", "title": "[Technical session managed in CMS]", "description": "[Topic, speaker, learning outcome and regional club.]"},
        {"type": "Roundtable", "title": "[Professional roundtable managed in CMS]", "description": "[Discussion theme, participant profile and registration status.]"},
        {"type": "Mentoring", "title": "[Mentoring circle managed in CMS]", "description": "[Cohort, purpose, mentor profile and capacity.]"},
        {"type": "Employer", "title": "[Employer engagement activity managed in CMS]", "description": "[Organisation type, audience and professional purpose.]"},
    ]}
    content.contribution = {"eyebrow": "Volunteer and contribute", "title": "Help build a respected regional professional community.", "description": "Clubs depend on members and partners who share useful knowledge, create connections and protect professional standards.", "builder_title": "How would you like to support your regional club?", "builder_description": "Select the closest route to generate an indicative enquiry.", "button_label": "Create enquiry route", "items": [
        {"id": "lead", "title": "Club lead or coordinator", "description": "Help shape the regional programme, communication and member experience."},
        {"id": "speak", "title": "Technical speaker", "description": "Share a method, lesson or applied case study subject to review and confidentiality safeguards."},
        {"id": "mentor", "title": "Mentor", "description": "Support early-career members, career changers and developing practitioners."},
        {"id": "host", "title": "Host organisation", "description": "Provide a venue, site visit, platform or practical demonstration where appropriate."},
        {"id": "sponsor", "title": "Sponsor access", "description": "Support learner places, venues or regional activity."},
        {"id": "academic", "title": "Academic engagement", "description": "Connect students, research and employability."},
    ]}
    content.partners = {"eyebrow": "Employers, hosts and partners", "title": "Support local capability and connect with the profession.", "description": "Organisations can support club activity through venues, speakers, mentoring, learner places, site visits and ethical sponsorship.", "notice": "Partnership should remain transparent and consent-based. It must not provide automatic access to private member data or influence professional-recognition decisions.", "items": [
        {"id": "employers", "title": "Employers & consultancies", "benefits": ["Host professional sessions", "Provide technical speakers", "Support mentoring", "Offer site visits", "Connect with talent ethically"], "cta_label": "Discuss employer partnership"},
        {"id": "academic", "title": "Academic partners", "benefits": ["Connect students with professionals", "Support careers and employability", "Host lectures or talks", "Contribute research", "Develop employer links"], "cta_label": "Discuss academic engagement"},
        {"id": "sponsors", "title": "Sponsors & service providers", "benefits": ["Support venues or learner places", "Enable regional activity", "Contribute credible demonstrations", "Receive ethical visibility", "Protect member privacy"], "cta_label": "Discuss club sponsorship"},
    ]}
    content.faq = {"eyebrow": "Regional club questions", "title": "Clear guidance before registering or contributing.", "description": "Understand locations, access, activity, volunteering, hosting and privacy.", "items": [
        {"id": "locations", "question": "Where are IPC regional clubs located?", "answer": "The catalogue identifies local communities in London, Nottingham, Manchester and Kent–Maidstone."},
        {"id": "membership", "question": "Do I need to be an IPC member to register interest?", "answer": "You can submit an enquiry or register interest. Access to individual activities may depend on membership category, registration, capacity or the nature of the event."},
        {"id": "activities", "question": "What activities can regional clubs provide?", "answer": "Activities may include technical talks, networking, site visits, mentoring circles, employer engagement, student activity and professional roundtables."},
        {"id": "speak", "question": "Can I speak or present a case study?", "answer": "Yes. Proposals should explain the topic, professional relevance, learning outcomes, speaker experience and any confidentiality or commercial considerations."},
        {"id": "host", "question": "Can an organisation host or sponsor club activity?", "answer": "Yes. Employers and partners may support venues, speakers, learner places, site visits or regional activity through transparent arrangements aligned with IPC values."},
        {"id": "privacy", "question": "Will attendee information be shared with employers or sponsors?", "answer": "Not automatically. Member and attendee information should be handled transparently, proportionately and on a consent basis."},
    ]}
    content.final_cta = {"title": "Join your regional community", "description": "Learn locally and contribute to a stronger project-controls profession. Share your region, current role, professional interests and preferred way to participate.", "primary_cta_label": "Register club interest", "secondary_cta_label": "Volunteer or speak"}
    content.seo = {"title": "Regional Clubs | Institute of Project Controls", "description": "IPC Regional Clubs connect project-controls professionals through talks, networking, site visits, mentoring, employer engagement and local professional communities.", "canonical_path": "/clubs", "noindex": False, "nofollow": False}
    content.status = "published"
    content.is_active = True
    if content.published_at is None:
        content.published_at = timezone.now()
    content.save()


def restore_legacy(apps, schema_editor):
    ClubPageContent = apps.get_model("clubs", "ClubPageContent")
    content = ClubPageContent.objects.filter(key="main").first()
    if not content or not content.legacy_content:
        return
    for field in ("regional_clubs", "activities", "audience_values"):
        if field in content.legacy_content:
            setattr(content, field, content.legacy_content[field])
    content.save(update_fields=["regional_clubs", "activities", "audience_values", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("clubs", "0003_clubpagecontent_audiences_intro_and_more")]
    operations = [migrations.RunPython(sync_content, restore_legacy)]
