from django.db import migrations
from django.utils import timezone


def item(item_id, **values):
    return {"id": item_id, "is_active": True, **values}


def seed_service_content(apps, schema_editor):
    ServiceContent = apps.get_model("services", "ServiceContent")
    routes = [
        item("recognition", tab="Professional Recognition", tab_description="Grades and progression", eyebrow="Professional recognition", title="Convert experience into a visible professional signal.", description="Structured routes help professionals explain their standing, prepare evidence and progress from AffIPC through MIPC, AFIPC L3, AFIPC L4 and FIPC.", audience="Learners, practitioners, applied professionals and senior leaders.", value="Professional identity, evidence-led standing and progression.", next_step="Identify a likely grade and prepare proportionate evidence.", enquiry_title="Discuss a recognition route", enquiry_description="Send your role, experience, preferred grade and a short professional statement.", note="Recognition organises competence, evidence and ethical conduct; it does not replace them.", cta="Start recognition enquiry", cta_url="/information-session"),
        item("workforce", tab="Workforce Capability", tab_description="Skills and succession", eyebrow="Workforce capability", title="Build a visible pathway from entry-level talent to senior controls leadership.", description="Employers can use IPC grades and competence domains for skills review, recruitment, development, succession planning and staff recognition.", audience="Corporate employers, HR, learning leaders and project-controls functions.", value="Capability mapping, retention, recruitment clarity and client confidence.", next_step="Define the workforce group, capability challenge and intended outcome.", enquiry_title="Discuss workforce development", enquiry_description="Share your organisation, target group and capability priorities.", note="The catalogue does not publish fixed corporate packages or prices.", cta="Start workforce enquiry", cta_url="/information-session"),
        item("learning", tab="Learning & CPD", tab_description="Events and mentoring", eyebrow="Learning and CPD", title="Turn professional learning into applied development evidence.", description="Master Classes, events, mentoring, practice, contribution and reflection support an active CPD journey.", audience="Members, practitioners, teams and emerging professionals.", value="Technical learning, career support and professional contribution.", next_step="Select the capability area, audience and learning format.", enquiry_title="Discuss learning and CPD", enquiry_description="Share the topic, audience, format and intended development outcome.", note="Learning activity should remain relevant, evidence-led and proportionate.", cta="Start learning enquiry", cta_url="/information-session"),
        item("academic", tab="Academic Partnership", tab_description="Students and research", eyebrow="Academic partnership", title="Connect education with professional identity and employability.", description="Partners can link students to affiliation, scholarships, curriculum relevance, awards, guest lectures, research and employer engagement.", audience="Universities, colleges, training providers, students and researchers.", value="Employability, research impact and industry engagement.", next_step="Define the learner group, course and intended professional outcome.", enquiry_title="Discuss academic partnership", enquiry_description="Share the institution, programme, learner group and collaboration interests.", note="Academic partnership does not automatically confer professional recognition.", cta="Start academic enquiry", cta_url="/information-session"),
        item("community", tab="Community & Events", tab_description="Clubs and networks", eyebrow="Community and events", title="Create spaces where professionals learn, connect and contribute.", description="Master Classes, regional clubs, roundtables, mentoring circles and employer activity support practical exchange.", audience="Professionals, employers, academics, learners, speakers and mentors.", value="Networking, technical exchange, mentoring and employer connection.", next_step="Choose the region, format, audience and professional purpose.", enquiry_title="Discuss an event or club route", enquiry_description="Share the proposed region, event type, audience and outcome.", note="Confirmed dates, venues and speakers should be managed through the CMS.", cta="Start community enquiry", cta_url="/information-session"),
        item("impact", tab="Awards & Impact", tab_description="Scholarships and sponsorship", eyebrow="Awards and impact", title="Recognise excellence and widen access to the profession.", description="Awards, scholarships, bursaries, sponsorship and publications support talent, research, contribution and social impact.", audience="Learners, professionals, teams, employers, academics and sponsors.", value="Access, recognition, visibility, research and social value.", next_step="Define the beneficiary group, route, support and intended impact.", enquiry_title="Discuss an impact pathway", enquiry_description="Share whether the priority is scholarships, awards, sponsorship or publication.", note="Sponsors must not influence recognition, judging or editorial decisions.", cta="Start impact enquiry", cta_url="/information-session"),
    ]
    defaults = {
        "hero": {
            "eyebrow": "Professional services & programmes",
            "title": "Turn competence into",
            "highlight": "visible capability.",
            "description": "IPC connects professional recognition, workforce development, learning, academic partnership and community into one specialist project-controls ecosystem.",
            "primary_cta_label": "Explore services",
            "primary_cta_url": "#services",
            "secondary_cta_label": "Find the right route",
            "secondary_cta_url": "#route-builder",
            "image": "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/64e5fe4de8a5414eb9307f7ebe36b446.jpg",
            "image_alt": "IPC professional services and learning environment",
            "proof_points": [
                item("professionals", title="For professionals", description="Recognition, CPD, mentoring, events and visible progression."),
                item("organisations", title="For organisations", description="Capability mapping, development, retention and client confidence."),
                item("partners", title="For partners", description="Academic, scholarship, research, awards and community pathways."),
            ],
            "capabilities": [
                item("recognition", icon="ri-award-line", title="Recognition", description="Membership and evidence-led professional standing."),
                item("workforce", icon="ri-team-line", title="Workforce Capability", description="Skills review, progression and succession."),
                item("learning", icon="ri-graduation-cap-line", title="Learning & CPD", description="Master Classes, mentoring and development."),
                item("academic", icon="ri-building-4-line", title="Academic Partnership", description="Employability, research and student routes."),
                item("community", icon="ri-global-line", title="Community & Impact", description="Clubs, awards, scholarships and publications."),
            ],
        },
        "principles": {
            "eyebrow": "A specialist service model",
            "title": "More than membership. A complete professional ecosystem.",
            "description": "Recognition is the anchor, but lasting value comes from connecting identity with learning, workforce capability, research and opportunity.",
            "items": [
                item("specific", title="Project-controls specific", description="Built around integrated controls rather than generic language."),
                item("evidence", title="Evidence-led", description="Professional claims should be credible and explainable."),
                item("progressive", title="Progressive", description="Clear routes from affiliation to senior standing."),
                item("connected", title="Connected", description="Professionals, employers, academics and partners."),
            ],
            "model": [
                item("recognise", label="01 / RECOGNISE", title="Make competence visible", description="Use structured grades, evidence expectations and post-nominals to communicate professional standing."),
                item("develop", label="02 / DEVELOP", title="Build workforce capability", description="Create progression routes from entry-level staff to applied practitioners and senior controls leaders."),
                item("connect", label="03 / CONNECT", title="Strengthen professional community", description="Bring together practitioners, employers, consultants, academics, sponsors and learners."),
                item("contribute", label="04 / CONTRIBUTE", title="Share knowledge and impact", description="Support speaking, mentoring, research, publications, awards and regional professional activity."),
            ],
        },
        "portfolio": {
            "eyebrow": "Service portfolio",
            "title": "Choose the pathway that matches your objective.",
            "description": "Select a service to understand its audience, value and next step.",
            "items": routes,
            "notice": "IPC provides professional membership, recognition, development and partnership services. The catalogue does not establish a commercial project-delivery consultancy service or publish prices and fee schedules.",
        },
        "audiences": {
            "eyebrow": "Who IPC serves",
            "title": "Professional value across the project-controls ecosystem.",
            "description": "The service model supports individuals and organisations seeking capability, credibility, employability and contribution.",
            "items": [
                item("professionals", icon="ri-user-star-line", title="Professionals", description="Recognition, career credibility, CPD, events, mentoring and progression.", cta_label="Explore recognition", cta_url="/membership"),
                item("employers", icon="ri-building-line", title="Employers", description="Capability mapping, recruitment clarity, retention, succession planning and staff recognition.", cta_label="Explore workforce services", cta_url="/information-session"),
                item("consultancies", icon="ri-briefcase-4-line", title="Consultancies", description="Market credibility, tender strength, thought leadership and senior profiles.", cta_label="Find a route", cta_url="/information-session"),
                item("academic", icon="ri-school-line", title="Academic & training partners", description="Student affiliation, curriculum relevance, scholarships, research, awards and employer links.", cta_label="Explore partnership", cta_url="/scholarships"),
                item("supporters", icon="ri-hand-heart-line", title="Sponsors & supporters", description="Ethical routes to support learners, events, awards, clubs, publications and social impact.", cta_label="Explore impact routes", cta_url="/sponsorship"),
            ],
        },
        "journey": {
            "eyebrow": "Professional service journey",
            "title": "Simple to enter. Structured enough to be credible.",
            "description": "The first website version can use a direct email-based process while keeping the experience clear and professional.",
            "items": [
                item("identify", title="Identify the objective", description="Clarify whether the priority is recognition, capability, learning, academic engagement, community or impact."),
                item("select", title="Select the route", description="Choose the service and define the individual, workforce, learner or partner audience."),
                item("context", title="Provide context", description="Share the role, organisation, current position and intended outcome."),
                item("review", title="IPC reviews", description="The Institute considers suitability, scope, evidence and the most appropriate pathway."),
                item("next", title="Agree next steps", description="Receive a recommended route, evidence request or partnership conversation."),
            ],
        },
        "route_builder": {
            "eyebrow": "Service route builder",
            "title": "Find the strongest starting route.",
            "description": "Answer three questions to generate an indicative recommendation.",
            "button_label": "Show recommended route",
            "help_text": "This guide is indicative only.",
        },
        "quality": {
            "eyebrow": "Quality and trust",
            "title": "Services should create aspiration without exaggeration.",
            "description": "Every route should be clear, practical, evidence-led and capable of being explained to professionals, employers, clients and partners.",
            "cta_label": "Discuss a service route",
            "cta_url": "/information-session",
            "items": [
                item("evidence", title="Evidence-led", description="Professional claims should be supported by appropriate evidence and judgement."),
                item("independent", title="Independent", description="Sponsorship must not influence recognition, judging or editorial decisions."),
                item("proportionate", title="Proportionate", description="Requirements should increase with accountability and influence."),
                item("consent", title="Consent-based", description="Partners do not receive automatic access to private member or learner data."),
                item("future", title="Future-facing", description="AI, digital systems, sustainability and public value sit alongside core competence."),
            ],
        },
        "faq": {
            "eyebrow": "Service questions",
            "title": "Clear guidance before making an enquiry.",
            "description": "Understand scope, pricing, recognition and organisational services.",
            "items": [
                item("services", question="What services does IPC provide?", answer="Professional membership and recognition, workforce capability pathways, CPD and events, regional clubs, mentoring, academic partnerships, scholarships, awards, publications and sponsorship routes."),
                item("consultancy", question="Does IPC provide project-delivery consultancy?", answer="The catalogue establishes professional membership, recognition, development and partnership services. It does not define a commercial consulting service for delivering client project controls."),
                item("prices", question="Are prices published?", answer="No. The catalogue contains no prices or fee schedules. Enquiries should explain the intended route and outcome."),
                item("employers", question="Can employers use IPC grades for development?", answer="Yes. The framework can support capability mapping, recruitment clarity, development plans, succession planning, tender profiles and staff recognition."),
                item("academic", question="Can academic partners connect students to IPC?", answer="Yes. Routes can include student affiliation, scholarships, awards, guest lectures, applied research, journal papers and employer engagement."),
                item("status", question="Is IPC recognition a qualification or chartered status?", answer="No. It is standards-informed, evidence-based professional recognition, not a regulated qualification, apprenticeship award, chartered status or statutory licence."),
            ],
        },
        "final_cta": {
            "eyebrow": "Start the right conversation",
            "title": "Choose a service. Define the outcome. Build professional capability.",
            "description": "Share your role or organisation, main objective, preferred pathway and intended result.",
            "primary_cta_label": "Start service enquiry",
            "primary_cta_url": "/information-session",
            "secondary_cta_label": "Explore portfolio",
            "secondary_cta_url": "#services",
            "notice": "IPC recognition does not replace competence, evidence or ethical conduct and should not be represented as a regulated qualification, chartered status or statutory licence.",
        },
        "seo": {
            "title": "Professional Services",
            "description": "Explore IPC professional services for recognition, workforce capability, learning, academic partnership, events, awards, scholarships and professional impact.",
            "canonical_url": "/services",
            "open_graph_title": "IPC Professional Services",
            "open_graph_description": "Professional recognition, workforce capability, learning and partnership routes.",
            "open_graph_image": "",
            "noindex": False,
            "nofollow": False,
        },
        "status": "published",
        "is_active": True,
        "published_at": timezone.now(),
    }
    ServiceContent.objects.update_or_create(key="main", defaults=defaults)


class Migration(migrations.Migration):
    dependencies = [("services", "0001_initial")]
    operations = [
        migrations.RunPython(seed_service_content, migrations.RunPython.noop),
    ]

