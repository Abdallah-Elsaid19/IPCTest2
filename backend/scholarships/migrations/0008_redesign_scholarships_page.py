from django.db import migrations, models

import ipc_backend.validators


HERO = {
    "eyebrow": "Scholarships & Bursaries",
    "title": "Opening access to project controls education.",
    "description": "The Institute of Project Controls supports selected learners, professionals and career changers who want to build recognised capability in project controls and project delivery.",
    "supporting_copy": "Scholarships and bursaries are intended to reduce barriers to professional development and connect recipients with learning, mentoring, events and the wider Institute community.",
    "primary_cta_label": "Apply for Support",
    "primary_cta_url": "mailto:office@instituteofprojectcontrols.org?subject=Scholarship%20or%20Bursary%20Application&body=Full%20name%3A%0D%0ACurrent%20role%20or%20status%3A%0D%0APreferred%20scholarship%20or%20bursary%20category%3A%0D%0AProfessional%20or%20learning%20goal%3A%0D%0AReason%20for%20applying%3A%0D%0ADocuments%20attached%3A",
    "secondary_cta_label": "Sponsor a Learner",
    "secondary_cta_url": "/sponsorship",
    "tertiary_cta_label": "View Eligibility",
    "tertiary_cta_url": "#eligibility",
}

COMMITMENT = {
    "eyebrow": "Our Purpose",
    "title": "Opportunity should not be limited by circumstance.",
    "description": "Project controls talent can come from many backgrounds. Financial, career, social or personal barriers can prevent capable people from accessing professional development, professional networks and credible routes into the discipline.",
    "secondary_description": "The Institute’s support aims to widen access, support professional mobility, develop future capability, connect education with employers and professional recognition, and encourage responsible use of opportunity.",
    "callout": "Support is designed to help capable people access opportunity, develop professionally and contribute positively to the project controls community.",
}

PRINCIPLES = {
    "items": [
        {"title": "Selected support opportunities", "description": "Eligibility, funding and capacity apply."},
        {"title": "Professional development pathways", "description": "Learning connected to credible next steps."},
        {"title": "Mentoring and community access", "description": "Professional connection beyond financial support."},
        {"title": "Employer and academic collaboration", "description": "Partnership routes that widen responsible access."},
    ]
}

AUDIENCES_INTRO = {
    "eyebrow": "Support Routes",
    "title": "Support designed around different professional journeys.",
    "description": "Each route responds to a different access, transition or development context. Availability is subject to funding, eligibility, programme capacity and final approval.",
}

AUDIENCES = [
    {"id": "access-hardship", "icon": "ri-door-open-line", "title": "Access & Hardship Bursary", "description": "May reduce financial, geographic or personal barriers to an agreed professional-development opportunity.", "suitable_for": "People facing a genuine barrier to access."},
    {"id": "emerging-talent", "icon": "ri-seedling-line", "title": "Emerging Talent Scholarship", "description": "Supports learners and early-career professionals building an informed route into project controls.", "suitable_for": "Students, graduates, apprentices and junior practitioners."},
    {"id": "career-change", "icon": "ri-route-line", "title": "Career Change & Repositioning Bursary", "description": "Supports people translating existing experience into a credible project controls direction.", "suitable_for": "Career changers and professionals repositioning their work."},
    {"id": "career-returner", "icon": "ri-restart-line", "title": "Career Returner Bursary", "description": "Helps rebuild professional confidence, networks and current development after time away from work.", "suitable_for": "Returners following caring, health or other career breaks."},
    {"id": "public-service", "icon": "ri-shield-star-line", "title": "Armed Forces, Veterans & Public Service Scholarship", "description": "Supports the transition of service, operational and public-sector experience into project delivery careers.", "suitable_for": "Service leavers, veterans and public-service professionals."},
    {"id": "community-impact", "icon": "ri-hand-heart-line", "title": "Community Impact Scholarship", "description": "Supports people whose development may strengthen communities or create wider professional value.", "suitable_for": "Community contributors and social-impact practitioners."},
    {"id": "charity-ngo", "icon": "ri-community-line", "title": "Charity & NGO Leadership Scholarship", "description": "Connects responsible project controls practice with programmes delivering charitable or public benefit.", "suitable_for": "Charity, NGO and voluntary-sector professionals."},
    {"id": "independent", "icon": "ri-briefcase-4-line", "title": "Self-Employed Professionals & Consultants Bursary", "description": "Supports relevant development where employer-funded learning is not available.", "suitable_for": "Independent professionals, consultants and sole practitioners."},
]

VALUES_INTRO = {
    "eyebrow": "Possible Support",
    "title": "More than financial assistance.",
    "description": "Support is confirmed individually and may combine learning, membership, mentoring, professional community and progression guidance.",
    "disclaimer": "Each award is confirmed individually in writing. The form and level of support depend on eligibility, programme requirements, available funding, capacity and final approval.",
}

VALUES = [
    {"id": "learning", "icon": "ri-book-open-line", "title": "Full or partial learning support", "description": "Agreed support towards an eligible learning route."},
    {"id": "membership", "icon": "ri-user-star-line", "title": "Professional membership support", "description": "Support for an appropriate Institute relationship where confirmed."},
    {"id": "masterclass", "icon": "ri-presentation-line", "title": "London Master Class Events", "description": "Access to selected events where relevant and available."},
    {"id": "clubs", "icon": "ri-community-line", "title": "Regional club participation", "description": "Connection with local professional learning and community activity."},
    {"id": "mentoring", "icon": "ri-team-line", "title": "Mentoring and guidance", "description": "Professional guidance from suitable contributors where available."},
    {"id": "career", "icon": "ri-compass-3-line", "title": "Career and progression support", "description": "Help identifying realistic professional-development next steps."},
    {"id": "recognition", "icon": "ri-award-line", "title": "Recognition pathway guidance", "description": "Information about evidence-led professional recognition routes."},
    {"id": "publication", "icon": "ri-file-paper-2-line", "title": "Publication opportunities", "description": "Potential magazine or knowledge-contribution routes subject to review."},
    {"id": "network", "icon": "ri-links-line", "title": "Professional networking", "description": "Connection with employers, consultants and academic partners."},
    {"id": "awards", "icon": "ri-medal-line", "title": "Awards and development opportunities", "description": "Awareness of relevant recognition and development activities."},
]

ELIGIBILITY = {
    "eyebrow": "Eligibility",
    "title": "Who may be considered?",
    "description": "The Institute welcomes responsible enquiries from people at different career stages and from varied professional backgrounds. Each application is considered against the relevant route and available opportunity.",
    "items": [
        {"title": "Students and graduates", "description": "People beginning to connect education with project controls practice."},
        {"title": "Apprentices and early-career professionals", "description": "Developing professionals seeking structured learning and community."},
        {"title": "Career changers", "description": "People transferring relevant experience into a new specialist direction."},
        {"title": "Career returners", "description": "Professionals rebuilding confidence, currency and connection after time away."},
        {"title": "Professionals repositioning into project controls", "description": "Existing practitioners seeking a clearer project controls pathway."},
        {"title": "Self-employed professionals and consultants", "description": "Independent people without routine employer-funded development."},
        {"title": "Veterans and public-service professionals", "description": "People translating service and operational experience into civilian roles."},
        {"title": "Charity, NGO and community practitioners", "description": "People applying delivery capability to public or community benefit."},
        {"title": "Applicants facing access barriers", "description": "People affected by financial, professional, geographic or personal barriers."},
    ],
}

RECIPIENT_COMMITMENT = {
    "eyebrow": "Recipient Commitment",
    "title": "Opportunity comes with professional responsibility.",
    "description": "Successful recipients may be asked to meet reasonable conditions that protect the learner, the programme and the purpose of the support.",
    "items": [
        "Provide accurate and truthful information.",
        "Meet any programme eligibility requirements.",
        "Participate actively in agreed learning or development.",
        "Maintain professional conduct.",
        "Respect attendance and submission requirements.",
        "Communicate if circumstances change.",
        "Use Institute membership or recognition titles accurately.",
        "Provide reasonable progress updates where required.",
        "Respect privacy, confidentiality and safeguarding requirements.",
        "Represent the opportunity responsibly.",
    ],
}

PARTNERS = {
    "eyebrow": "For Organisations",
    "title": "Help develop the next generation of project controls talent.",
    "description": "Employers, consultancies and sponsors can widen access while supporting workforce capability, professional education and responsible industry contribution.",
    "items": [
        {"id": "employers", "title": "Corporate and employer benefits", "benefits": ["Support workforce development.", "Build future project controls capability.", "Strengthen social value and talent pipelines.", "Support career mobility.", "Contribute to professional education.", "Connect with Institute events and communities."]},
        {"id": "consultancies", "title": "Consultancy benefits", "benefits": ["Support emerging practitioners.", "Contribute technical mentoring.", "Build thought leadership.", "Engage with professional events.", "Strengthen responsible industry contribution.", "Support talent entering specialist project controls roles."]},
        {"id": "sponsors", "title": "Sponsor benefits", "benefits": ["Support named or general scholarship funds.", "Sponsor learner development.", "Support events, mentoring or publications.", "Receive agreed and appropriate recognition.", "Engage with Institute impact reporting where available."]},
    ],
    "integrity_statement": "Sponsorship supports the Institute’s mission but does not guarantee membership approval, Fellowship recognition, scholarship selection, academic outcomes, award outcomes, procurement preference or access to private applicant data.",
    "cta_label": "Sponsor a Learner",
    "cta_url": "/sponsorship",
}

ACADEMIC_PARTNERS = {
    "eyebrow": "Academic Partners",
    "title": "Connect education, research and professional recognition.",
    "description": "Universities, colleges and training partners can help learners connect academic development with professional practice without overstating accreditation or regulated status.",
    "items": [
        "Promote student access to professional membership.",
        "Support dissertation and research prizes.",
        "Collaborate on applied project controls research.",
        "Contribute academic or practitioner papers.",
        "Invite industry speakers and Fellows.",
        "Build employer engagement.",
        "Support learner employability.",
        "Connect curriculum with project controls practice.",
        "Develop scholarship or bursary partnerships.",
        "Engage with professional magazine and academic journal opportunities.",
    ],
    "cta_label": "Become an Academic Partner",
    "cta_url": "/information-session",
}

APPLICATION_PROCESS = {
    "eyebrow": "How to Apply",
    "title": "A clear and personal application process.",
    "description": "Applications begin by email so you can provide relevant context without placing sensitive information into an insecure public form.",
    "cta_label": "Apply for Support",
    "cta_url": HERO["primary_cta_url"],
    "email": "office@instituteofprojectcontrols.org",
    "subject": "Scholarship or Bursary Application",
    "steps": [
        {"title": "Select the relevant category", "description": "Choose the scholarship or bursary category most relevant to your situation."},
        {"title": "Prepare a background profile", "description": "Prepare a CV or a concise summary of your current role, study or professional position."},
        {"title": "Write a personal statement", "description": "Explain your circumstances, motivation, goals and how the opportunity would support your development."},
        {"title": "Add supporting information", "description": "Include relevant supporting evidence or a reference where available."},
        {"title": "Email the Institute", "description": "Send the application using the subject Scholarship or Bursary Application."},
        {"title": "Respond to clarification", "description": "The Institute may request clarification or further information."},
        {"title": "Receive the outcome", "description": "The outcome and any conditions of support will be confirmed in writing."},
    ],
}

CONDITIONS = {
    "eyebrow": "Important Information",
    "title": "Clear conditions protect applicants and the purpose of support.",
    "description": "The Institute confirms the scope and conditions of each award individually and aims to communicate decisions responsibly.",
    "items": [
        "Support is subject to eligibility and availability.",
        "Applications do not guarantee an award.",
        "Support may be full, partial or activity-specific.",
        "Programme admission and scholarship decisions may be separate.",
        "False or misleading information may lead to withdrawal.",
        "Awards may include reasonable participation or progress conditions.",
        "Private or sensitive documents should not be sent through an insecure public form.",
        "Final conditions are confirmed individually in writing.",
    ],
}

FAQ = {
    "eyebrow": "Scholarship Questions",
    "title": "Clear answers before you apply.",
    "description": "Understand eligibility, possible support, applications, partnerships and confidentiality.",
    "items": [
        {"question": "Who can apply for a scholarship or bursary?", "answer": "Learners, professionals, career changers, returners and others facing a relevant access or development barrier may enquire. Each route has its own eligibility and availability."},
        {"question": "Do I need previous project controls experience?", "answer": "Not for every route. The relevant background depends on the category and proposed opportunity, and should be explained honestly in the application."},
        {"question": "What kind of support may be available?", "answer": "Support may be full, partial or activity-specific and can include agreed learning, membership, mentoring, events or professional-development activity."},
        {"question": "Is support guaranteed?", "answer": "No. Applications do not guarantee an award. Support depends on eligibility, programme requirements, funding, capacity and final approval."},
        {"question": "Can employed professionals apply?", "answer": "Yes, where the selected route is relevant and employer-funded access is unavailable or insufficient. Applicants should explain their circumstances."},
        {"question": "Can self-employed professionals or consultants apply?", "answer": "Yes. A specific bursary route may support independent professionals without routine employer-funded development."},
        {"question": "Can employers sponsor learners?", "answer": "Yes. Employers can discuss named or general support, learner development, mentoring, events and responsible talent-pipeline activity."},
        {"question": "Can universities or colleges become academic partners?", "answer": "Yes. Academic partners can explore learner access, research, prizes, employability, professional membership and employer-engagement opportunities."},
        {"question": "How do I submit my application?", "answer": "Email office@instituteofprojectcontrols.org using the subject Scholarship or Bursary Application and include the requested background and supporting information."},
        {"question": "Will my personal circumstances remain confidential?", "answer": "The Institute should handle information responsibly and only request what is relevant. Do not send unnecessary sensitive documents through an insecure public form."},
    ],
}

FINAL_CTA = {
    "title": "Access opportunity. Develop capability. Build a professional future.",
    "description": "Whether you are beginning your career, repositioning professionally or supporting future project controls talent, the Institute welcomes responsible applications and partnership enquiries.",
    "primary_cta_label": "Apply for Support",
    "primary_cta_url": HERO["primary_cta_url"],
    "secondary_cta_label": "Sponsor a Learner",
    "secondary_cta_url": "/sponsorship",
    "tertiary_cta_label": "Become an Academic Partner",
    "tertiary_cta_url": "/information-session",
    "email": "office@instituteofprojectcontrols.org",
    "address": "39 Maidstone Innovation Centre, Maidstone, Kent, ME14 5FY",
}

SEO = {
    "title": "Project Controls Scholarships & Bursaries",
    "description": "Explore project controls scholarships and bursaries from the Institute of Project Controls, supporting eligible learners, professionals, career changers and future project controls talent.",
    "canonical_path": "/scholarships",
    "noindex": False,
    "nofollow": False,
}


def redesign_scholarships_page(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")
    ScholarshipContent.objects.filter(key="main").update(
        hero=HERO,
        commitment=COMMITMENT,
        principles=PRINCIPLES,
        audiences_intro=AUDIENCES_INTRO,
        audiences=AUDIENCES,
        values_intro=VALUES_INTRO,
        values=VALUES,
        eligibility=ELIGIBILITY,
        recipient_commitment=RECIPIENT_COMMITMENT,
        application_process=APPLICATION_PROCESS,
        partners=PARTNERS,
        academic_partners=ACADEMIC_PARTNERS,
        conditions=CONDITIONS,
        faq=FAQ,
        final_cta=FINAL_CTA,
        seo=SEO,
    )


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0007_expand_access_framework"),
    ]

    operations = [
        migrations.AddField(
            model_name="scholarshipcontent",
            name="recipient_commitment",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipcontent",
            name="academic_partners",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipcontent",
            name="conditions",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.RunPython(
            redesign_scholarships_page,
            migrations.RunPython.noop,
        ),
    ]
