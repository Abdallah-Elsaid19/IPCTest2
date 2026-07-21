from django.db import migrations
from django.utils import timezone


def sync_content(apps, schema_editor):
    Content = apps.get_model("scholarships", "ScholarshipContent")
    content = Content.objects.filter(key="main").first()
    if content is None: content = Content(key="main", audiences=[], values=[])
    if not content.legacy_content: content.legacy_content = {"audiences": content.audiences, "values": content.values}
    content.hero = {"eyebrow": "Scholarships & bursaries", "title": "Talent should not be limited by access.", "description": "IPC scholarship pathways help eligible learners, career changers and emerging professionals connect with project-controls learning, mentoring, community and career-development opportunities.", "cta_label": "Start a scholarship enquiry", "cta_url": "/information-session"}
    content.commitment = {"eyebrow": "Why scholarships matter", "title": "Build a stronger and more inclusive project-controls talent pipeline.", "description": "Scholarships and bursaries can reduce barriers to participation while connecting learners with professional identity, learning, mentoring and career opportunity."}
    content.principles = {"eyebrow": "Selection principles", "title": "Purposeful, fair and professionally relevant support", "description": "Scholarship pathways should widen access while protecting clear criteria, professional relevance and independent decisions.", "items": [
        {"icon": "ri-scales-3-line", "title": "Fair access", "description": "Clear criteria, explainable decisions and no guaranteed awards."},
        {"icon": "ri-focus-3-line", "title": "Professional relevance", "description": "Support connects directly to project controls and employability."},
        {"icon": "ri-shield-check-line", "title": "Ethical sponsorship", "description": "Funding must not influence membership or recognition decisions."},
        {"icon": "ri-arrow-up-circle-line", "title": "Visible progression", "description": "Each pathway should create a realistic professional next step."},
    ]}
    content.audiences = [
        {"icon": "ri-user-line", "title": "Individual learner", "description": "For students, apprentices and emerging professionals seeking access to IPC learning, events, mentoring or community activity."},
        {"icon": "ri-compass-3-line", "title": "Career access", "description": "For career changers and people from adjacent disciplines who want structured access to project-controls learning and professional community."},
        {"icon": "ri-graduation-cap-line", "title": "Academic partner", "description": "For universities, colleges and training providers supporting selected learners through an agreed scholarship or bursary pathway."},
        {"icon": "ri-building-line", "title": "Sponsored cohort", "description": "For employers, consultancies, foundations, recruitment organisations and sponsors supporting a defined learner or emerging-talent group."},
    ]
    content.audiences_intro = {"eyebrow": "Scholarship pathways", "title": "Different routes for learners, education partners and sponsors.", "description": "Programme availability may vary by intake. Each route connects a defined audience with relevant learning, professional community and a credible next step."}
    content.values = [
        {"icon": "ri-user-star-line", "title": "Affiliate or student connection", "description": "A visible first relationship with the Institute and the project-controls profession."},
        {"icon": "ri-presentation-line", "title": "Master classes and events", "description": "Access to selected technical, career and professional-development activity where included."},
        {"icon": "ri-team-line", "title": "Mentoring and guidance", "description": "Support from practitioners, employers, academics or recognised professionals where available."},
        {"icon": "ri-article-line", "title": "Research and publication routes", "description": "Opportunities to connect student work, projects or applied research to professional audiences."},
        {"icon": "ri-community-line", "title": "Employer and community engagement", "description": "Structured contact with corporate partners, consultants, regional clubs and professional speakers."},
        {"icon": "ri-route-line", "title": "Career progression support", "description": "Help participants understand membership grades, evidence-building and future professional routes."},
    ]
    content.values_intro = {"eyebrow": "What support may include", "title": "More than funding: a connection to professional development.", "description": "The exact package should be defined for each programme. Support may combine access, learning, mentoring and professional community."}
    content.eligibility = {"eyebrow": "Eligibility and selection", "title": "Support should be purposeful, fair and explainable", "description": "Each scholarship programme should publish its own criteria. Selection should reflect the purpose of the intake, available funding and the likely professional benefit.", "items": [
        {"icon": "ri-checkbox-circle-line", "title": "Eligibility", "description": "The applicant or learner group fits the published route and programme purpose."},
        {"icon": "ri-door-open-line", "title": "Access need", "description": "The support addresses a genuine barrier, opportunity gap or development need."},
        {"icon": "ri-fire-line", "title": "Motivation", "description": "The applicant can explain their project-controls interest and intended next step."},
        {"icon": "ri-links-line", "title": "Relevance", "description": "The opportunity connects to project controls, employability, learning or applied research."},
        {"icon": "ri-hand-heart-line", "title": "Professional conduct", "description": "Participants agree to responsible, respectful and ethical behaviour."},
        {"icon": "ri-line-chart-line", "title": "Impact", "description": "The route offers a credible development outcome rather than a vague or unsupported claim."},
    ], "checker_title": "Which route is most likely to fit?", "checker_description": "Answer three questions. This guidance does not confirm eligibility, funding or an open intake."}
    content.application_process = {"eyebrow": "How to enquire", "title": "A clear first step without an unnecessary application portal", "description": "Scholarship enquiries can begin by email so IPC can understand the proposed route, learner group, intended outcome and current programme availability.", "steps": [
        {"id": "01", "title": "Choose the route", "description": "Identify whether the enquiry is individual, career access, academic partner or sponsored cohort."},
        {"id": "02", "title": "Describe the opportunity", "description": "Explain the learner group, programme interest and intended development or social-impact outcome."},
        {"id": "03", "title": "Provide context", "description": "Include study, role, organisation, number of places and the reason support is requested."},
        {"id": "04", "title": "IPC reviews the enquiry", "description": "The Institute considers the programme, eligibility, available funding and the appropriate route."},
        {"id": "05", "title": "Receive next steps", "description": "IPC confirms whether more information is needed or whether a current or future pathway may be suitable."},
    ], "cta_label": "Start scholarship enquiry", "cta_url": "/information-session"}
    content.partners = {"eyebrow": "For sponsors and partners", "title": "Turn support into visible, ethical professional impact", "description": "Employers, consultancies, academic partners and sponsors can help widen access to project-controls learning, community and career opportunity.", "items": [
        {"icon": "ri-building-4-line", "title": "Employers & consultancies", "benefits": ["Support selected learners", "Develop future talent", "Offer mentoring or speakers", "Create career-access opportunities", "Strengthen social value"], "cta": "Discuss employer support"},
        {"icon": "ri-graduation-cap-line", "title": "Academic partners", "benefits": ["Nominate or support learner groups", "Connect study with professional practice", "Support research and employability", "Develop employer links", "Create progression routes"], "cta": "Discuss academic partnership"},
        {"icon": "ri-hand-heart-line", "title": "Sponsors & foundations", "benefits": ["Fund learner or cohort access", "Support events and mentoring", "Enable research or publication", "Receive ethical visibility", "Protect selection independence"], "cta": "Discuss sponsorship"},
    ]}
    content.impact = {"eyebrow": "Impact and accountability", "title": "Measure what the support made possible", "description": "Scholarship impact should be reported carefully, with consent and without overstating outcomes.", "items": [
        {"icon": "ri-door-open-line", "title": "Access", "description": "What opportunity became available because of the scholarship or bursary?"},
        {"icon": "ri-calendar-check-line", "title": "Participation", "description": "Which learning, mentoring, event or community activities were completed?"},
        {"icon": "ri-seedling-line", "title": "Development", "description": "What knowledge, confidence, professional connection or evidence was developed?"},
        {"icon": "ri-arrow-up-line", "title": "Progression", "description": "What realistic next step followed—study, employment, membership, mentoring or further development?"},
        {"icon": "ri-shield-user-line", "title": "Consent", "description": "Any learner story, image or testimonial must be used transparently and with permission."},
    ]}
    content.faq = {"eyebrow": "Scholarship questions", "title": "Clear guidance before making an enquiry", "description": "Understand availability, eligibility, support, recognition and sponsorship safeguards.", "items": [
        {"question": "Are scholarships currently open?", "answer": "Availability is intake-specific and depends on confirmed funding and eligibility. This page invites enquiries but does not guarantee that a current programme is open."},
        {"question": "Does a scholarship guarantee membership or professional recognition?", "answer": "No. Scholarship support and professional recognition are separate. Any membership or recognition decision remains subject to the applicable requirements, evidence and review."},
        {"question": "Can an academic partner nominate a learner group?", "answer": "Yes. Academic partners can enquire about learner cohorts, programme interests, employability, research and progression pathways. IPC will confirm whether a suitable route is available."},
        {"question": "Can an employer or sponsor support a defined cohort?", "answer": "Yes. The enquiry should explain the target learner group, number of places, sponsorship objective and intended professional or social impact."},
        {"question": "What should an individual learner include?", "answer": "Include your current study or role, project-controls interest, preferred activity or programme, development objective and a short explanation of why support would make a meaningful difference."},
        {"question": "Can a sponsor influence selection or recognition decisions?", "answer": "No. Sponsorship should remain transparent and separate from membership, professional-recognition, judging and editorial decisions."},
    ]}
    content.final_cta = {"title": "A clear first step without an unnecessary application portal.", "description": "Scholarship enquiries can begin by email so IPC can understand the proposed route, learner group, intended outcome and current programme availability.", "cta_label": "Start scholarship enquiry", "cta_url": "/information-session"}
    content.seo = {"title": "Scholarships & Bursaries", "description": "IPC scholarships and bursaries widen access to project-controls learning, mentoring, community and career-development opportunities.", "canonical_path": "/scholarships", "noindex": False, "nofollow": False}
    content.status = "published"; content.is_active = True
    if content.published_at is None: content.published_at = timezone.now()
    content.save()


def restore_legacy_content(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")
    content = ScholarshipContent.objects.filter(key="main").first()
    if not content or not content.legacy_content:
        return
    for field in ("audiences", "values"):
        if field in content.legacy_content:
            setattr(content, field, content.legacy_content[field])
    content.save(update_fields=["audiences", "values", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("scholarships", "0005_scholarshipcontent_audiences_intro_and_more")]
    operations = [migrations.RunPython(sync_content, restore_legacy_content)]
