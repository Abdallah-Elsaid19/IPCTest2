from django.db import migrations, models
import ipc_backend.validators


def item(title, description, icon="ri-focus-3-line", **extra):
    return {
        "title": title,
        "description": description,
        "icon": icon,
        "is_active": True,
        **extra,
    }


def service(code, title, description, bullets, meta_label, meta, cta, url):
    return {
        "code": code,
        "title": title,
        "description": description,
        "bullets": bullets,
        "meta_label": meta_label,
        "meta": meta,
        "cta": cta,
        "url": url,
        "is_active": True,
    }


def sync_preview_19_content(apps, schema_editor):
    Content = apps.get_model("services", "ServiceContent")
    content = Content.objects.filter(key="main").first()
    if content is None:
        return

    content.hero = {
        "announcement": "Professional and organisational services are open: recognition, capability, learning, research, community and strategic partnership.",
        "eyebrow": "Services & Professional Solutions",
        "title": "Turn project controls competence into recognised capability.",
        "description": "The Institute of Project Controls provides professional services for individuals, employers, consultancies, universities, colleges, public bodies, NGOs and strategic partners.",
        "body": "Build professional identity, understand competence, strengthen workforce capability, develop specialist knowledge, connect education with employer demand and create visible professional or social impact.",
        "callout_title": "IPC is a specialist professional institution.",
        "callout": "Its services are designed around evidence, recognition, learning, capability, research and community — not pay-to-recognise certification or generic management consultancy.",
        "primary_cta_label": "Explore Services",
        "primary_cta_url": "#service-catalogue",
        "secondary_cta_label": "Discuss Your Requirement",
        "secondary_cta_url": "/information-session",
        "tertiary_cta_label": "Explore Professional Recognition",
        "tertiary_cta_url": "/membership",
        "panel_eyebrow": "Four service outcomes",
        "panel_title": "Professional value from evidence to impact.",
        "panel_items": [
            item("Recognise", "Make individual competence and contribution visible.", "ri-award-line"),
            item("Develop", "Build technical, digital, leadership and ethical capability.", "ri-graduation-cap-line"),
            item("Strengthen", "Improve workforce pathways, controls culture and confidence.", "ri-team-line"),
            item("Connect", "Link professionals, employers, educators and communities.", "ri-links-line"),
        ],
        "panel_note": "Designed for professionals, employers, consultancies, academic institutions, public bodies, NGOs, sponsors and partners.",
    }
    content.impact_strip = {
        "items": [
            item("Professionals", "Recognition, grade guidance, CPD, events, publication and professional visibility.", "ri-user-star-line"),
            item("Employers", "Workforce capability, recognition cohorts, learning and controls culture.", "ri-building-line"),
            item("Academic partners", "Student engagement, research, prizes, guest learning and employer connection.", "ri-school-line"),
            item("Strategic partners", "Sponsorship, social impact, knowledge programmes and professional community.", "ri-handshake-line"),
        ]
    }
    content.why_services = {
        "eyebrow": "Why IPC services exist",
        "title": "Professional recognition is stronger when connected to capability, learning and contribution.",
        "description": "A post-nominal can create visibility, but sustainable professional value also requires evidence, development, employer relevance, community and responsible practice.",
        "body": [
            "Project controls professionals work across planning, scheduling, cost engineering, estimating, risk, change, reporting, PMO, assurance, commercial management, data and digital delivery.",
            "Their competence is often developed through a combination of education, project experience, mentoring, self-directed learning and professional responsibility.",
            "Employers need clearer ways to recognise that capability, develop career pathways and strengthen the quality of project information used for decisions.",
            "Universities and colleges need a stronger connection between curriculum, research, learners and the workplace. Professionals need a visible route to recognition, contribution and progression.",
            "IPC services connect those needs. The Institute supports individual recognition, organisational capability, specialist learning, academic engagement, research, publication, awards, scholarships, regional communities and strategic sponsorship.",
            "The purpose is not to sell a title or impose one operating model. It is to help people and organisations understand, evidence, develop and communicate project controls capability in a credible and proportionate way.",
        ],
        "callout_eyebrow": "The service proposition",
        "callout": "Recognition makes competence visible. Development makes it stronger. Community makes it transferable.",
        "callout_description": "IPC brings these elements together so professional value can be understood by individuals, employers, educators, clients and the wider project community.",
    }
    content.audiences = {
        "eyebrow": "Find the right service",
        "title": "Services matched to the needs of each audience.",
        "description": "Start with the outcome you need, then agree the most appropriate service or combination of services.",
        "columns": ["Audience", "Common need", "Relevant IPC services", "Primary outcome"],
        "items": [
            {"audience": "Professionals", "need": "Professional identity, grade guidance, career differentiation, CPD, networking and visible contribution.", "services": "Membership and Fellowship, evidence guidance, master classes, clubs, publications, awards and mentoring.", "outcome": "Credible recognition and a clearer professional progression pathway.", "is_active": True},
            {"audience": "Employers and clients", "need": "Workforce capability, career pathways, controls culture, technical development and delivery confidence.", "services": "Capability mapping, recognition cohorts, capability reviews, bespoke learning, roundtables and awards.", "outcome": "Better visibility and development of the people behind project decisions.", "is_active": True},
            {"audience": "Consultancies", "need": "Consultant differentiation, technical depth, thought leadership, client confidence and talent development.", "services": "Professional recognition, cohort services, master classes, case studies, publications and capability workshops.", "outcome": "Stronger professional profiles and evidence-led specialist positioning.", "is_active": True},
            {"audience": "Universities and colleges", "need": "Student employability, professional identity, research, employer engagement and applied curriculum.", "services": "Student membership, guest lectures, curriculum dialogue, research, publications, prizes and scholarships.", "outcome": "Stronger connection between learning, research and the project controls profession.", "is_active": True},
            {"audience": "Public sector and NGOs", "need": "Governance, transparency, planning, risk, reporting, sustainability, social value and staff development.", "services": "Capability workshops, master classes, recognition, scholarships, guidance and community programmes.", "outcome": "Improved professional capability and more evidence-based delivery.", "is_active": True},
            {"audience": "Sponsors and partners", "need": "Professional impact, talent access, community benefit, visibility and association with specialist knowledge.", "services": "Learner sponsorship, events, awards, clubs, publications, research and strategic partnership.", "outcome": "Visible support for opportunity, knowledge and professional excellence.", "is_active": True},
        ],
    }
    content.portfolio = {
        "eyebrow": "Service catalogue",
        "title": "Four connected service pillars.",
        "description": "Choose one service or combine several around an individual, workforce, academic or social-impact objective.",
        "items": [
            {
                "code": "01",
                "slug": "recognition-services",
                "title": "Professional Recognition Services",
                "short_title": "Professional Recognition",
                "description": "Make individual capability, responsibility and professional contribution visible through a structured evidence-based pathway.",
                "icon": "ri-award-line",
                "highlights": ["Affiliate and Professional Membership", "Associate Fellowship Level 3 and Level 4", "Fellow Level 6 Project Control Professional", "Individual and employer-supported routes"],
                "services": [
                    service("R01", "Membership & Fellowship Applications", "Apply for the recognition level that reflects current knowledge, application, responsibility, conduct and contribution.", ["Affiliate Member", "Professional Member", "Associate Fellow Level 3", "Associate Fellow Level 4", "Fellow Level 6"], "Best for", "Individuals seeking professional identity and progression.", "Explore Recognition", "/membership"),
                    service("R02", "Grade Guidance & Evidence Readiness", "Receive initial guidance on the likely recognition route, evidence types and professional areas that may require further development before formal application.", ["Role and responsibility discussion", "Evidence inventory", "Competence gap identification", "Recommended next steps"], "Important boundary", "Guidance does not guarantee an application outcome or bypass formal evidence review.", "Request Grade Guidance", "/information-session"),
                    service("R03", "Employer Recognition Cohorts", "Support a group of employees through a coordinated professional-recognition journey while preserving individual evidence standards and independent decisions.", ["Programme briefing for staff", "Evidence-readiness workshops", "Application scheduling", "Aggregate progress information"], "Employer value", "Create a visible workforce pathway without purchasing recognition outcomes.", "Discuss a Recognition Cohort", "/information-session"),
                    service("R04", "Professional Contribution Pathway", "Connect recognition with events, mentoring, speaking, publication, awards and professional service so members can continue demonstrating contribution.", ["Professional biography guidance", "Publication and speaker routes", "Mentoring and club contribution", "Awards and recognition opportunities"], "Best for", "Members building a stronger LinkedIn, CV and professional leadership profile.", "Discuss Contribution", "/information-session"),
                ],
                "is_active": True,
            },
            {
                "code": "02",
                "slug": "capability-services",
                "title": "Capability & Learning Services",
                "short_title": "Capability & Learning",
                "description": "Help organisations understand current capability, define development priorities and strengthen project controls practice.",
                "icon": "ri-bar-chart-box-line",
                "highlights": ["Workforce capability mapping", "Project controls capability reviews", "Master classes and roundtables", "Emerging talent and mentoring"],
                "services": [
                    service("C01", "Workforce Capability Mapping", "Map roles, responsibilities, development needs and professional-recognition opportunities across a project controls team or function.", ["Role-family review", "Competence-domain mapping", "Recognition-level alignment", "Development-priority narrative"], "Potential output", "A practical capability map and recommended progression pathway.", "Discuss Capability Mapping", "/information-session"),
                    service("C02", "Project Controls Capability Review", "A structured developmental review across governance, baselines, schedule, cost, risk, change, data, digital practice, sustainability and people.", ["Evidence and stakeholder discussion", "Strengths and development priorities", "Capability and risk narrative", "Improvement-roadmap workshop"], "Scope boundary", "This is not a statutory audit or formal assurance opinion unless separately agreed in writing.", "View Review Framework", "#capability-review"),
                    service("C03", "London Master Classes & Bespoke Learning", "Specialist learning on the technical, digital, ethical and leadership capabilities required in modern project controls.", ["Planning and schedule assurance", "Cost engineering and forecasting", "Risk, change, delay and claims", "Responsible AI and data assurance", "Sustainability and leadership"], "Delivery options", "Institute events, employer sessions, executive roundtables and approved technical workshops.", "Explore Master Classes", "/events"),
                    service("C04", "Mentoring & Emerging Talent Pathways", "Support students, apprentices, graduates, career changers and developing professionals through mentoring and structured exposure to the discipline.", ["Mentor and mentee pathways", "Career-readiness activity", "Regional club engagement", "Recognition and scholarship routes"], "Best for", "Employers, academic partners, charities and social-impact programmes.", "Discuss a Talent Pathway", "/information-session"),
                ],
                "is_active": True,
            },
            {
                "code": "03",
                "slug": "knowledge-services",
                "title": "Knowledge & Academic Engagement",
                "short_title": "Knowledge & Academic",
                "description": "Connect professional practice, research, education and visible knowledge contribution.",
                "icon": "ri-book-open-line",
                "highlights": ["Academic partnership", "Research and publications", "Technical case studies and guidance", "Awards and professional recognition"],
                "services": [
                    service("K01", "Academic Partnership", "Build a structured relationship between an academic institution, learners, employers and the project controls professional community.", ["Student membership pathways", "Guest lectures and master classes", "Dissertation prizes and awards", "Research and employer engagement", "Professional progression discussion"], "Important boundary", "Partnership does not automatically constitute programme accreditation or qualification approval.", "Discuss Academic Partnership", "/information-session"),
                    service("K02", "Research & Publication Services", "Contribute professional magazine articles, academic papers, technical case studies, research notes, interviews and practice guidance.", ["Professional magazine route", "Academic and practitioner papers", "Research and data notes", "Editorial and technical review"], "Editorial principle", "Submission does not guarantee publication and sponsored content remains subject to independence.", "Explore Publications", "/publications"),
                    service("K03", "Case Studies, Practice Guides & Knowledge Exchange", "Convert project lessons, employer practice, event learning and research into structured professional knowledge that others can examine and apply.", ["Anonymised case-study development", "Practice guides and briefings", "Research and practitioner roundtables", "Event-to-publication pathways"], "Professional value", "Strengthen organisational learning while protecting permissions and confidentiality.", "Propose Knowledge Content", "/information-session"),
                    service("K04", "Awards & Recognition Programmes", "Recognise professionals, teams, employers, students, researchers and contributions through academic, commercial, professional and special awards.", ["Award nominations", "Employer and team recognition", "Student and dissertation prizes", "Quarterly and annual honours"], "Independence", "Sponsorship and partnership do not determine judges, finalists or winners.", "Explore Awards", "/awards"),
                ],
                "is_active": True,
            },
            {
                "code": "04",
                "slug": "community-services",
                "title": "Opportunity & Community Services",
                "short_title": "Opportunity & Community",
                "description": "Widen access, strengthen local professional communities and connect organisations with meaningful professional impact.",
                "icon": "ri-community-line",
                "highlights": ["Scholarships and bursaries", "Regional clubs", "Sponsorship", "Strategic partnerships"],
                "services": [
                    service("O01", "Scholarships & Bursary Support", "Support eligible learners and professionals who demonstrate need, character, service, resilience, social impact, leadership or future potential.", ["Access and hardship", "Veterans and career transition", "Self-employed professionals", "Charity and community leadership", "Emerging talent"], "Capacity", "Up to 40 places may be available per intake, subject to funding, eligibility and programme capacity.", "Explore Scholarships", "/scholarships"),
                    service("O02", "Regional Clubs & Professional Community", "Join or support local technical talks, mentoring, employer engagement, networking and student participation.", ["London", "Nottingham", "Manchester", "Kent – Maidstone"], "Engagement routes", "Attend, speak, mentor, host, volunteer or sponsor local professional activity.", "Explore Regional Clubs", "/clubs"),
                    service("O03", "Sponsorship Services", "Support learners, events, awards, clubs, publications, research or social-impact programmes through a defined sponsorship arrangement.", ["Learner and scholarship sponsorship", "Event and master class support", "Awards and publication sponsorship", "Regional and community programmes"], "Integrity", "Sponsorship creates support and visibility, not control over professional outcomes.", "Explore Sponsorship", "/sponsorship"),
                    service("O04", "Strategic Partnership", "Combine recognition, learning, research, events, awards, scholarships and community activity around an agreed professional objective.", ["Corporate capability partnership", "Academic partnership programme", "Social-impact partnership", "Multi-activity annual programme"], "Delivery model", "Tailored scope, defined benefits, clear boundaries and proportionate impact reporting.", "Discuss Strategic Partnership", "/information-session"),
                ],
                "is_active": True,
            },
        ],
    }
    content.quality = {
        "eyebrow": "Project controls capability review",
        "title": "A structured developmental view of the system behind project decisions.",
        "description": "Reviews can be shaped around an organisation, function, team, project environment or development programme.",
        "panel_eyebrow": "Eight review domains",
        "panel_title": "Review capability, not only documents.",
        "panel_description": "The review considers how governance, methods, data, people and professional behaviours work together to create reliable project controls information.",
        "panel_items": ["Evidence and stakeholder discussion", "Strengths and priority risks", "Development opportunities", "Proportionate improvement roadmap"],
        "panel_note": "Scope, access, confidentiality, deliverables and limitations are confirmed in writing before work begins.",
        "items": [
            item("Governance & Controls Strategy", "Roles, controls plans, decision rights, reporting cycles, escalation and integration with project governance.", "ri-government-line", code="01"),
            item("Scope, Coding & Baselines", "Scope definition, work breakdown, coding structures, baseline approval, traceability and controlled change.", "ri-git-branch-line", code="02"),
            item("Planning & Scheduling", "Planning approach, logic, milestones, critical path, resources, progress, forecasting and recovery.", "ri-calendar-check-line", code="03"),
            item("Cost, Estimating & Performance", "Estimates, budgets, actuals, commitments, accruals, earned value, cash flow and forecast confidence.", "ri-money-pound-circle-line", code="04"),
            item("Risk, Opportunity & Change", "Risk processes, quantitative analysis, contingency, early warning, impact assessment and change control.", "ri-scales-3-line", code="05"),
            item("Data, Reporting & Assurance", "Data validity, interfaces, dashboards, variance, trends, narrative quality, traceability and independent challenge.", "ri-database-2-line", code="06"),
            item("Digital, AI & Sustainability", "Automation, analytics, responsible AI, systems integration, carbon, resources and whole-life value.", "ri-robot-2-line", code="07"),
            item("People, Leadership & Conduct", "Role capability, learning, communication, mentoring, ethical challenge, inclusion and professional accountability.", "ri-team-line", code="08"),
        ],
        "notice_title": "Developmental review, not an automatic assurance opinion",
        "notice": "A standard IPC capability review supports understanding and improvement. It should not be represented as a statutory audit, regulated certification, legal opinion, project approval or formal assurance opinion unless a separate written scope explicitly defines and authorises that work.",
    }
    content.employer_solutions = {
        "eyebrow": "Employer & consultancy solutions",
        "title": "Build a recognised project controls workforce.",
        "description": "Connect capability mapping, professional recognition, learning, mentoring and visible contribution into one coherent workforce pathway.",
        "body": "Services can support an existing project controls function, emerging capability, graduate or apprenticeship pathways, consultant development, public-sector teams or a targeted improvement programme.",
        "primary_cta_label": "Discuss Employer Services",
        "primary_cta_url": "/information-session",
        "secondary_cta_label": "Explore Recognition",
        "secondary_cta_url": "/membership",
        "items": [
            item("Capability mapping", "Understand roles, strengths, gaps and progression needs.", "ri-bar-chart-box-line"),
            item("Recognition cohorts", "Coordinate evidence readiness while preserving independence.", "ri-team-line"),
            item("Bespoke learning", "Master classes, technical workshops and executive discussion.", "ri-graduation-cap-line"),
            item("Emerging talent", "Connect apprentices, graduates and returners with the profession.", "ri-seedling-line"),
            item("Thought leadership", "Develop case studies, speakers, articles and awards.", "ri-lightbulb-flash-line"),
            item("Professional community", "Engage staff through events, clubs, mentoring and service.", "ri-community-line"),
        ],
    }
    content.academic_solutions = {
        "eyebrow": "Academic partner solutions",
        "title": "Connect project controls education with professional identity and employer demand.",
        "description": "IPC can help universities and colleges create a richer professional environment around learners, research, curriculum discussion, employability and employer engagement.",
        "body": "Partnership services should be described accurately. Academic partnership does not automatically mean regulated accreditation, qualification approval or guaranteed professional recognition.",
        "primary_cta_label": "Discuss Academic Services",
        "primary_cta_url": "/information-session",
        "secondary_cta_label": "Explore Research & Publications",
        "secondary_cta_url": "/publications",
        "items": [
            item("Student membership", "Build professional identity before graduation.", "ri-user-star-line"),
            item("Guest learning", "Connect learners with practitioners, Fellows and employers.", "ri-presentation-line"),
            item("Curriculum dialogue", "Discuss professional relevance, competence and workplace need.", "ri-discuss-line"),
            item("Research & publication", "Disseminate applied research and student work professionally.", "ri-book-open-line"),
            item("Prizes & awards", "Recognise dissertations, researchers and academic contribution.", "ri-award-line"),
            item("Employer connection", "Create live discussion, careers access and collaborative work.", "ri-handshake-line"),
        ],
    }
    content.outcomes = {
        "eyebrow": "Potential service outcomes",
        "title": "Clear outputs shaped by the agreed scope.",
        "description": "Exact deliverables depend on the audience, service, evidence, duration and written agreement.",
        "items": [
            item("Recognition pathway", "A clearer route for individuals or cohorts to prepare for an appropriate professional recognition level.", "ri-route-line"),
            item("Capability map", "A structured view of role families, competence domains, development needs and progression priorities.", "ri-mind-map"),
            item("Development roadmap", "Prioritised actions linked to capability, learning, mentoring or recognition.", "ri-road-map-line"),
            item("Master class or workshop", "Specialist learning designed around an agreed technical, leadership or organisational need.", "ri-presentation-line"),
            item("Research or publication output", "A case study, article, paper, briefing, research note or professional knowledge contribution.", "ri-article-line"),
            item("Academic engagement plan", "A combination of student, research, employer, event, prize and professional activities.", "ri-school-line"),
            item("Community programme", "Mentoring, regional activity, scholarship access, career support or professional social impact.", "ri-community-line"),
            item("Impact narrative", "Proportionate reporting on participation, outputs, professional development and programme impact.", "ri-file-chart-line"),
        ],
    }
    content.engagement = {
        "eyebrow": "How an engagement works",
        "title": "Start with the outcome, then define the right service.",
        "description": "There is no public checkout for organisational services. Scope, responsibilities, benefits and boundaries are agreed before delivery begins.",
        "items": [
            item("Define the need", "Explain the audience, challenge, current position, desired outcome and why the service matters now.", code="01"),
            item("Select the service route", "Identify whether the priority is recognition, capability, learning, academic engagement, publication, community or partnership.", code="02"),
            item("Agree evidence and access", "Confirm the information, stakeholders, permissions, confidentiality and practical access required.", code="03"),
            item("Confirm scope and boundaries", "Record deliverables, timing, responsibilities, exclusions, public wording and independence requirements.", code="04"),
            item("Deliver the service", "Complete the agreed review, workshop, recognition support, event, publication, partnership or community activity.", code="05"),
            item("Review outcomes and next steps", "Discuss outputs, learning, limitations, development priorities and appropriate follow-on activity.", code="06"),
        ],
        "checklist_eyebrow": "Service enquiry checklist",
        "checklist_title": "Include these details.",
        "checklist": ["Your name, role and organisation", "Service or outcome of interest", "Audience or number of participants", "Current challenge or opportunity", "Preferred timing", "Location or delivery format", "Evidence or information available", "Confidentiality requirements", "Expected outputs or success indicators"],
        "cta_label": "Start a Service Enquiry",
        "cta_url": "/information-session",
    }
    content.principles = {
        "eyebrow": "Service principles",
        "title": "Professional value depends on independence, clarity and evidence.",
        "description": "These principles protect individuals, organisations, partners and the credibility of the Institute.",
        "items": [
            item("Evidence before assertion", "Findings, guidance and recognition should be grounded in relevant and proportionate evidence.", "ri-file-search-line"),
            item("No pay-to-recognise outcome", "A fee, sponsorship or partnership does not purchase membership, Fellowship, awards or publication.", "ri-forbid-2-line"),
            item("Clear scope and limitations", "Deliverables, exclusions, assumptions and the status of any review are confirmed accurately.", "ri-focus-3-line"),
            item("Confidentiality and consent", "Personal, academic, employer, client and project information should be protected appropriately.", "ri-lock-line"),
            item("Conflict management", "Relevant interests should be disclosed and managed where they may affect impartiality or trust.", "ri-scales-3-line"),
            item("Responsible AI", "AI may support analysis and delivery, but outputs require verification and human accountability.", "ri-robot-2-line"),
            item("Sustainability and public value", "Relevant services should consider carbon, resources, lifecycle value, inclusion and responsible delivery.", "ri-leaf-line"),
            item("Accurate public wording", "Organisations should use only approved descriptions of recognition, partnership, sponsorship and outcomes.", "ri-double-quotes-l"),
        ],
    }
    content.faq = {
        "eyebrow": "Frequently asked questions",
        "title": "Questions about IPC services, scope and professional outcomes.",
        "description": "Clear answers about access, recognition, capability reviews, academic partnership, publication and public wording.",
        "items": [
            {"question": "Are IPC services only for existing members?", "answer": "No. Services may support members, applicants, employers, consultancies, universities, colleges, public bodies, NGOs, sponsors and professional partners. Some activities or benefits may have membership-specific conditions.", "is_active": True},
            {"question": "Does grade guidance guarantee membership or Fellowship?", "answer": "No. Initial guidance can identify a likely route and evidence needs, but formal recognition remains subject to application, evidence review, conduct requirements and Institute decision.", "is_active": True},
            {"question": "Can an employer purchase recognition for its staff?", "answer": "No. An employer can fund or coordinate a recognition cohort and provide evidence-readiness support, but each individual outcome remains independent and evidence-based.", "is_active": True},
            {"question": "Is the capability review a formal audit?", "answer": "The standard service is a developmental capability review. It is not a statutory audit, regulated certification, legal opinion, project approval or formal assurance opinion unless a separate written scope explicitly establishes otherwise.", "is_active": True},
            {"question": "Can IPC deliver private employer master classes?", "answer": "Yes. A bespoke session or roundtable may be discussed around an agreed project controls topic, audience, learning outcome, delivery format and confidentiality requirement.", "is_active": True},
            {"question": "Does academic partnership mean programme accreditation?", "answer": "Not automatically. Academic partnership may include student membership, guest learning, research, prizes, publications, scholarships and employer engagement. A separate accreditation claim would require its own formally approved framework and written agreement.", "is_active": True},
            {"question": "Can a consultancy publish case studies through IPC?", "answer": "Yes. Proposed content should provide useful professional learning, disclose commercial interests, protect client confidentiality and avoid becoming a disguised sales presentation.", "is_active": True},
            {"question": "Can services be combined into one programme?", "answer": "Yes. A strategic partnership can combine capability mapping, recognition, master classes, mentoring, research, awards, scholarships, publications or community activity around an agreed objective.", "is_active": True},
            {"question": "Are service prices published online?", "answer": "Organisational, academic, sponsorship and tailored professional services are scoped individually and confirmed in writing rather than presented as a generic public price list.", "is_active": True},
            {"question": "Can service outcomes be used in tenders or public materials?", "answer": "Only accurate, approved wording should be used. A review, partnership or sponsorship should not be described as a certification, accreditation, endorsement or assurance opinion unless that status has been explicitly granted in writing.", "is_active": True},
        ],
    }
    content.final_cta = {
        "eyebrow": "Build recognised project controls capability",
        "title": "Start with the professional outcome your people or organisation needs.",
        "description": "Discuss individual recognition, workforce capability, specialist learning, academic engagement, research, publication, awards, scholarships, community activity or strategic partnership.",
        "primary_cta_label": "Discuss Your Requirement",
        "primary_cta_url": "/information-session",
        "secondary_cta_label": "Explore Recognition",
        "secondary_cta_url": "/membership",
        "tertiary_cta_label": "Discuss Partnership",
        "tertiary_cta_url": "/information-session",
        "address": "39 Maidstone Innovation Centre, Maidstone, Kent, ME14 5FY",
        "email": "office@instituteofprojectcontrols.org",
    }
    content.seo = {
        "title": "Project Controls Services & Professional Solutions",
        "description": "Explore Institute of Project Controls services for professionals, employers, consultancies, universities and partners, including professional recognition, competence assessment, workforce capability, master classes, research, publications, awards, scholarships and clubs.",
        "canonical_path": "/services",
        "noindex": False,
        "nofollow": False,
    }
    content.save()


NEW_FIELDS = [
    "impact_strip",
    "why_services",
    "employer_solutions",
    "academic_solutions",
    "outcomes",
    "engagement",
]


class Migration(migrations.Migration):
    dependencies = [("services", "0003_cross_link_institution_routes")]
    operations = [
        *[
            migrations.AddField(
                model_name="servicecontent",
                name=name,
                field=models.JSONField(
                    default=dict,
                    validators=[ipc_backend.validators.validate_content_section],
                ),
            )
            for name in NEW_FIELDS
        ],
        migrations.RunPython(sync_preview_19_content, migrations.RunPython.noop),
    ]
