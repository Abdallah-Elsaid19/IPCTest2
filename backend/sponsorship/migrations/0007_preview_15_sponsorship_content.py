from django.db import migrations, models
import ipc_backend.validators


def route(
    route_id,
    icon,
    tab,
    tab_description,
    title,
    description,
    highlights,
    opportunities,
):
    return {
        "id": route_id,
        "icon": icon,
        "tab": tab,
        "tabDescription": tab_description,
        "eyebrow": tab,
        "title": title,
        "description": description,
        "highlights": highlights,
        "opportunities": opportunities,
        "cta": f"Discuss {tab.lower()} sponsorship",
    }


def option(code, title, description, label, detail):
    return {
        "code": code,
        "title": title,
        "description": description,
        "label": label,
        "detail": detail,
    }


def sync_preview_15_content(apps, schema_editor):
    Content = apps.get_model("sponsorship", "SponsorshipContent")
    content = Content.objects.filter(key="main").first()
    if content is None:
        return

    content.hero = {
        "announcement": "Sponsorship partnerships are open: support learners, scholarships, events, awards, clubs, publications and professional impact.",
        "eyebrow": "Sponsorship & Strategic Partnerships",
        "title": "Support the people, ideas and communities that strengthen project delivery.",
        "description": "The Institute of Project Controls works with employers, consultancies, training providers, universities, recruitment companies, NGOs, charities and corporate partners to widen access to professional development and recognise excellence.",
        "details": [
            "Sponsorship can support learners, scholarships, London Master Class Events, regional clubs, awards, professional publications, academic research, mentoring and social-impact activity.",
            "Partnerships are shaped around the sponsor’s objectives while protecting the independence of Institute decisions.",
        ],
        "primary_cta_label": "Start a Sponsorship Conversation",
        "primary_cta_url": "/information-session",
        "secondary_cta_label": "Explore Sponsorship Routes",
        "secondary_cta_url": "#sponsorship-routes",
    }
    content.principles = {
        "eyebrow": "Targeted professional impact",
        "title": "Support opportunity across the project-controls profession.",
        "description": "Sponsorship can focus on a defined audience, activity or professional outcome.",
        "items": [
            {"icon": "ri-graduation-cap-line", "title": "Learners", "description": "Support education, membership, mentoring and career access."},
            {"icon": "ri-team-line", "title": "Professional community", "description": "Support master classes, clubs, events and knowledge exchange."},
            {"icon": "ri-award-line", "title": "Recognition", "description": "Support awards, prizes, publications and professional visibility."},
            {"icon": "ri-lightbulb-flash-line", "title": "Thought leadership", "description": "Connect your organisation with evidence-led project controls."},
        ],
    }
    content.purpose = {
        "eyebrow": "Why sponsorship matters",
        "title": "Professional capability grows when opportunity, recognition and community are funded deliberately.",
        "description": "Many talented people lack employer-supported development, access to technical networks or a visible route into the profession.",
        "body": [
            "Employers also need project controls professionals who can build credible schedules, produce reliable forecasts, control change, manage uncertainty, protect data integrity and support informed decisions.",
            "Sponsorship connects these needs. It creates access for learners and professionals while helping organisations support a discipline that protects project value. It can fund education, recognition, events, research, awards, mentoring, regional engagement and useful professional publications.",
            "IPC partnerships are designed to create visible and credible impact. Sponsors can support a defined activity, category, location or community while the Institute protects professional integrity, confidentiality, fairness and independent judgement.",
        ],
        "items": [
            {"icon": "ri-focus-3-line", "title": "Defined activity", "description": "Support a learner, event, award, club, publication or wider programme."},
            {"icon": "ri-file-list-3-line", "title": "Tailored partnerships", "description": "Sponsorship scope is discussed individually and confirmed in writing."},
            {"icon": "ri-shield-check-line", "title": "Protected independence", "description": "Sponsorship does not determine recognition, scholarship or award outcomes."},
        ],
    }
    content.partners_intro = {
        "eyebrow": "Sponsor value proposition",
        "title": "Different organisations engage for different reasons.",
        "description": "IPC aligns sponsorship opportunities with the strategic and social value each partner is seeking to create.",
    }
    content.partner_types = [
        {
            "type": "Employers and clients",
            "benefits": "Talent development, capability visibility, employee engagement, social value and stronger controls culture.",
            "items": ["Learners", "Memberships", "Master classes", "Awards", "Regional clubs", "Scholarship pathways"],
            "cta": "Strengthen the capability that protects your projects, forecasts and decisions.",
        },
        {
            "type": "Consultancies",
            "benefits": "Thought leadership, professional positioning, client confidence and specialist community engagement.",
            "items": ["Events", "Technical content", "Awards", "Publications", "Research", "Consultant development"],
            "cta": "Demonstrate specialist value while contributing to a stronger profession.",
        },
        {
            "type": "Training providers",
            "benefits": "Learner recognition, employer connections, curriculum relevance and professional progression.",
            "items": ["Learner membership", "Awards", "Events", "Research", "Clubs", "Scholarship support"],
            "cta": "Connect learning to professional identity and employer demand.",
        },
        {
            "type": "Universities and colleges",
            "benefits": "Student opportunity, research links, employability, prizes and practitioner access.",
            "items": ["Dissertation prizes", "Bursaries", "Guest lectures", "Research", "Academic-industry collaboration"],
            "cta": "Make project controls education more visible, applied and connected to industry.",
        },
        {
            "type": "Recruitment companies",
            "benefits": "Ethical talent engagement, careers visibility and emerging talent access.",
            "items": ["Career workshops", "Learner sponsorship", "Clubs", "Magazine careers content", "Emerging talent awards"],
            "cta": "Support better-prepared talent while respecting consent and privacy.",
        },
        {
            "type": "NGOs, charities and foundations",
            "benefits": "Social mobility, professional education, public value and community impact.",
            "items": ["Bursaries", "Charity leadership", "Second-chance careers", "Veterans", "Community programmes"],
            "cta": "Use professional capability to widen opportunity and improve delivery for public benefit.",
        },
    ]
    content.routes_intro = {
        "eyebrow": "Sponsorship routes",
        "title": "Support one priority or build a multi-activity partnership.",
        "description": "Sponsorship can focus on a learner, event, award, publication or regional community, or combine several activities into one strategic programme.",
    }
    content.routes = [
        route(
            "learners",
            "ri-graduation-cap-line",
            "Learners & Scholarships",
            "Education and progression",
            "Sponsor access to education and professional progression.",
            "Support eligible learners with education, membership, events, mentoring and career development.",
            ["One learner or a group", "Up to 40 places per intake", "Named scholarships or bursaries", "Career transition support", "Professional membership access"],
            [
                option("L01", "Sponsor One Learner", "Support one eligible person with an agreed programme, membership, mentoring or development activity.", "Best for", "Employers, consultants, donors, charities and small organisations seeking direct impact."),
                option("L02", "Sponsor a Learner Cohort", "Support several learners entering a selected project controls or project management pathway.", "Potential focus", "Emerging talent, employees, career returners or local communities."),
                option("L03", "Named Scholarship Fund", "Create a named scholarship aligned with workforce, social value or professional priorities.", "Examples", "Veterans, charity leaders, women, emerging talent or independent consultants."),
                option("L04", "Access and Hardship Fund", "Support applicants facing financial, employment or educational barriers.", "Integrity principle", "Selection remains evidence-led and independent of the sponsor."),
            ],
        ),
        route(
            "events",
            "ri-calendar-event-line",
            "Events & Master Classes",
            "Professional learning",
            "Support professional learning and high-value conversation.",
            "London Master Class Events provide a premium forum for technical knowledge, employer discussion and thought leadership.",
            ["Flagship London events", "Technical workshops", "Speaker support", "Delegate bursaries", "Post-event publication"],
            [
                option("E01", "London Master Class Sponsor", "Support a flagship event on planning, cost, risk, change, AI, data, sustainability or leadership.", "Potential benefits", "Brand recognition, agreed guest places and professional association."),
                option("E02", "Venue and Hospitality Sponsor", "Provide or support a venue, catering, refreshments or delegate experience.", "Suitable for", "Employers, venues, consultancies and service firms."),
                option("E03", "Speaker and Knowledge Sponsor", "Support expert speakers, recording, travel or learning materials.", "Boundary", "Speakers and content remain subject to Institute approval."),
                option("E04", "Delegate Access Sponsor", "Fund attendance for students, apprentices, charity leaders or professionals facing access barriers.", "Social value", "Widen participation without reducing professional quality."),
            ],
        ),
        route(
            "awards",
            "ri-award-line",
            "Awards & Prizes",
            "Professional recognition",
            "Help make outstanding achievement visible.",
            "Awards sponsorship supports recognition of professionals, teams, students, researchers and employers.",
            ["Academic awards", "Commercial awards", "Professional awards", "Special recognition", "Quarterly and annual honours"],
            [
                option("A01", "Named Award Category Sponsor", "Support one approved award such as Team of the Year, Best Dissertation or Sustainability Excellence.", "Important", "Sponsorship does not give control over judging or winners."),
                option("A02", "Quarterly Awards Sponsor", "Support regular recognition, case-study publication and professional engagement.", "Best for", "Organisations seeking year-round professional association."),
                option("A03", "Annual Honours Sponsor", "Support a future awards reception, publication or digital recognition event.", "Potential scope", "Venue, production, certificates, trophies and media."),
                option("A04", "Winner Development Sponsor", "Support winners with master classes, mentoring, publication or speaking opportunities.", "Value", "Turn recognition into continued professional development."),
            ],
        ),
        route(
            "clubs",
            "ri-community-line",
            "Regional Clubs",
            "Local communities",
            "Build strong local professional communities.",
            "Regional clubs create accessible opportunities for technical talks, networking, mentoring and employer engagement.",
            ["London Club", "Nottingham Club", "Manchester Club", "Kent – Maidstone Club"],
            [
                option("R01", "Regional Club Partner", "Support the ongoing professional activity of one regional club.", "Activities", "Talks, briefings, networking, mentoring and student engagement."),
                option("R02", "Local Event Host", "Provide a venue, refreshments, technical speaker or local event support.", "Employer benefit", "Local visibility and meaningful professional engagement."),
                option("R03", "Emerging Talent Sponsor", "Support students, apprentices and early-career professionals to participate.", "Impact", "Stronger local talent and education-employer connection."),
                option("R04", "Technical Activity Sponsor", "Support a responsible site visit, workshop, roundtable or professional development activity.", "Requirements", "Subject to safety, suitability and confidentiality."),
            ],
        ),
        route(
            "publications",
            "ri-book-open-line",
            "Magazine & Journal",
            "Professional knowledge",
            "Support knowledge professionals can use.",
            "Publications connect applied practice, academic research, employer insight and professional contribution.",
            ["Professional magazine", "Academic journal papers", "Technical case studies", "Research notes", "Awards supplements"],
            [
                option("P01", "Professional Magazine Sponsor", "Support an issue or editorial programme covering practice, careers, events, clubs and awards.", "Editorial rule", "Sponsored content is labelled and subject to editorial standards."),
                option("P02", "Academic Journal Sponsor", "Support calls for papers, review activity, academic collaboration and practitioner research.", "Independence", "Sponsorship does not determine acceptance or conclusions."),
                option("P03", "Technical Series Sponsor", "Support a focused series on planning, cost, risk, AI, data, sustainability or leadership.", "Thought leadership", "Evidence and promotion must remain clearly distinguished."),
                option("P04", "Student Writing Prize Sponsor", "Support student articles, dissertation summaries and academic-practice writing.", "Value", "Give emerging voices a credible route into publication."),
            ],
        ),
        route(
            "research",
            "ri-flask-line",
            "Research & Innovation",
            "Evidence-led development",
            "Fund evidence-led development of the discipline.",
            "Research sponsorship connects employers, consultants, academics and practitioners around practical questions.",
            ["AI and data assurance", "Forecasting and uncertainty", "Net zero and lifecycle value", "Skills and workforce capability"],
            [
                option("I01", "Applied Research Sponsor", "Support investigation of a practical project controls challenge.", "Outputs", "Reports, papers, roundtables, case studies or guidance."),
                option("I02", "Responsible AI and Data Programme", "Support work on AI assurance, anomaly detection, privacy and human oversight.", "Principle", "Technology should strengthen evidence and accountability."),
                option("I03", "Sustainability and Net Zero Programme", "Support work connecting carbon, schedule, cost, resources and whole-life value.", "Value", "Better visibility of environmental implications."),
                option("I04", "Skills and Talent Research", "Support research into careers, workforce gaps, competence and employer needs.", "Partners", "Employers, recruiters, universities and training providers."),
            ],
        ),
        route(
            "community",
            "ri-hand-heart-line",
            "Community Activities",
            "Service and social impact",
            "Sponsor professional service and wider social impact.",
            "Community sponsorship supports access, employability, mentoring and professional confidence.",
            ["Mentoring circles", "Career workshops", "Veterans and returners", "Charity capability"],
            [
                option("C01", "Mentoring Programme Sponsor", "Support mentor preparation, matching and professional resources.", "Impact", "Confidence, career direction, conduct and progression."),
                option("C02", "Career Readiness Sponsor", "Support CV, LinkedIn, interview and project controls career workshops.", "Suitable for", "Recruiters, employers, consultants and educators."),
                option("C03", "Veterans and Returners Sponsor", "Support transition workshops, mentoring and community access.", "Value", "Translate transferable skills into civilian careers."),
                option("C04", "Charity and NGO Capability Sponsor", "Support planning, risk, reporting and leadership development.", "Public benefit", "Better governance, resource use and impact visibility."),
            ],
        ),
        route(
            "strategic",
            "ri-links-line",
            "Strategic Partnership",
            "Multi-activity relationship",
            "Combine routes around a shared objective.",
            "Strategic partnership is suitable for organisations seeking a longer-term relationship with recognition, talent, research and community.",
            ["Multi-activity programme", "Annual priorities", "Corporate or academic recognition", "Impact reporting"],
            [
                option("S01", "Founding or Strategic Partner", "Support a combination of learners, events, awards, clubs, publications or research.", "Best for", "Employers, major consultancies, universities and foundations."),
                option("S02", "Corporate Capability Partner", "Connect employee development, membership progression, events and mentoring.", "Employer value", "Stronger talent pathways, retention and controls culture."),
                option("S03", "Academic Partnership Programme", "Combine student membership, research, awards, guest lectures and scholarships.", "Academic value", "Better employability and industry connection."),
                option("S04", "Social Impact Partnership", "Support scholarships, career transition, NGOs, mentoring and professional access.", "Impact focus", "Social mobility, inclusion and public value."),
            ],
        ),
    ]
    content.scholarship_feature = {
        "eyebrow": "Scholarship and bursary fund",
        "title": "Help support up to 40 places per intake.",
        "description": "The Institute aims to make selected project controls and project management pathways more accessible through scholarships, bursaries, membership support and professional development.",
        "body": "Sponsors can support access and hardship, emerging talent, veterans, charity leaders, social impact, self-employed professionals, career returners and second-chance applicants.",
        "note": "The final number of places depends on available funding, eligibility, programme capacity and written approval.",
        "primary_cta_label": "Explore Scholarships",
        "primary_cta_url": "/scholarships",
        "secondary_cta_label": "Sponsor the Fund",
        "secondary_cta_url": "/information-session",
        "items": [
            {"icon": "ri-door-open-line", "title": "Access and hardship", "description": "Remove financial and professional barriers."},
            {"icon": "ri-medal-line", "title": "Veterans and transition", "description": "Support transferable talent into civilian careers."},
            {"icon": "ri-briefcase-4-line", "title": "Consultants and freelancers", "description": "Support professionals without employer funding."},
            {"icon": "ri-hand-heart-line", "title": "Charity and social impact", "description": "Build professional capability for public benefit."},
        ],
    }
    content.benefits = {
        "eyebrow": "Sponsor benefits",
        "title": "Professional visibility connected to meaningful contribution.",
        "description": "Benefits are matched to the scope and nature of the partnership. They recognise support without compromising independence.",
        "items": [
            {"icon": "ri-global-line", "title": "Website recognition", "description": "Approved sponsor profile or acknowledgement on relevant pages."},
            {"icon": "ri-calendar-event-line", "title": "Event visibility", "description": "Agreed recognition in event materials and communication."},
            {"icon": "ri-user-star-line", "title": "Guest participation", "description": "Agreed guest places for selected events or activities."},
            {"icon": "ri-lightbulb-flash-line", "title": "Thought leadership", "description": "Approved articles, interviews, panels or technical contributions."},
            {"icon": "ri-award-line", "title": "Named initiative", "description": "An approved scholarship, award, event or programme may carry sponsor acknowledgement."},
            {"icon": "ri-links-line", "title": "Professional association", "description": "Connect the organisation with competence and project controls excellence."},
            {"icon": "ri-team-line", "title": "Talent engagement", "description": "Support a professional community while respecting privacy and fair access."},
            {"icon": "ri-file-chart-line", "title": "Impact reporting", "description": "Receive proportionate information about supported activity."},
            {"icon": "ri-map-pin-line", "title": "Regional presence", "description": "Build visibility through London, Nottingham, Manchester or Kent."},
            {"icon": "ri-building-line", "title": "Employer reputation", "description": "Demonstrate commitment to capability and responsible delivery."},
            {"icon": "ri-article-line", "title": "Publication acknowledgement", "description": "Approved recognition in magazine, research or awards material."},
            {"icon": "ri-discuss-line", "title": "Strategic dialogue", "description": "Participate in agreed employer or academic roundtables."},
        ],
    }
    content.recognition_levels = {
        "eyebrow": "Sponsorship recognition levels",
        "title": "Flexible levels without publishing fixed prices.",
        "description": "The Institute agrees a sponsorship level after understanding the activity, duration, audience and impact required.",
        "items": [
            {"level": "Entry level", "title": "Supporter", "description": "For an individual or small organisation supporting one activity.", "benefits": ["One defined activity", "Agreed acknowledgement", "Simple impact confirmation"]},
            {"level": "Focused support", "title": "Bronze Sponsor", "description": "For a club event, learner place, small event or award.", "benefits": ["Defined programme scope", "Digital recognition", "Agreed guest access"]},
            {"level": "Programme support", "title": "Silver Sponsor", "description": "For scholarship support, an event or publication activity.", "benefits": ["Expanded recognition", "Content opportunity", "Impact summary"]},
            {"level": "Major partnership", "title": "Gold Sponsor", "description": "For a major event, award programme or learner cohort.", "benefits": ["High-visibility programme", "Thought leadership", "Strategic engagement"]},
            {"level": "Strategic relationship", "title": "Platinum or Founding Partner", "description": "For sustained support across several Institute priorities.", "benefits": ["Multi-activity agreement", "Longer-term impact", "Executive relationship"]},
        ],
        "note_title": "Tailored by discussion",
        "note": "These levels are not a public price list. Every arrangement is confirmed in writing, including scope, benefits, duration, branding, reporting, confidentiality and integrity requirements.",
    }
    content.integrity_intro = {
        "eyebrow": "Independence and integrity",
        "title": "Sponsorship supports the mission. It does not purchase outcomes.",
        "description": "The long-term value of sponsorship depends on protecting professional credibility.",
        "principle_title": "Credibility creates more value than paid influence.",
        "principle_description": "A sponsor benefits most when recognition, scholarships, awards and publications remain trusted. Organisations can be associated with professional contribution without controlling professional judgement.",
        "principle_items": ["Clear written agreement", "Defined benefits and boundaries", "Conflict-of-interest management", "Data protection and confidentiality", "Transparent sponsored content", "Proportionate impact reporting"],
    }
    content.integrity_principles = [
        {"icon": "ri-user-star-line", "title": "Independent membership decisions", "description": "Sponsorship does not guarantee Affiliate, Member, Associate Fellow or Fellow recognition."},
        {"icon": "ri-graduation-cap-line", "title": "Independent scholarship selection", "description": "Sponsors may agree a purpose, but eligibility and selection remain subject to fair criteria."},
        {"icon": "ri-award-line", "title": "Independent awards judging", "description": "Award sponsorship does not give control over judges, finalists or winners."},
        {"icon": "ri-article-line", "title": "Editorial independence", "description": "Sponsored content must be labelled and remains subject to editorial standards."},
        {"icon": "ri-lock-line", "title": "Consent-based talent engagement", "description": "Sponsorship does not provide unrestricted access to member or learner data."},
        {"icon": "ri-check-double-line", "title": "Accurate public claims", "description": "Sponsors should use only approved wording and descriptions of the relationship."},
    ]
    content.process = {
        "eyebrow": "How sponsorship begins",
        "title": "A simple conversation followed by a clear written agreement.",
        "description": "There is no public checkout or fixed-price catalogue. The Institute first understands the sponsor’s objectives and intended impact.",
        "steps": [
            {"id": "01", "title": "Choose an area of interest", "description": "Select learners, events, awards, clubs, publications, research, community activity or strategic partnership."},
            {"id": "02", "title": "Explain the desired impact", "description": "Describe the audience, location, objective or social value the organisation wants to support."},
            {"id": "03", "title": "Discuss scope and fit", "description": "IPC considers availability, integrity, capacity, audience relevance and conflicts."},
            {"id": "04", "title": "Agree benefits and boundaries", "description": "Confirm branding, guest access, reporting, confidentiality and independence requirements."},
            {"id": "05", "title": "Confirm the agreement", "description": "A written sponsorship agreement sets out scope, duration and responsibilities."},
            {"id": "06", "title": "Deliver and review impact", "description": "The activity is delivered and proportionate impact information is shared."},
        ],
        "checklist_title": "Include these details in your enquiry.",
        "checklist": ["Organisation name and website", "Primary contact and role", "Sponsorship route of interest", "Audience or location to support", "Preferred activity or programme", "Approximate duration or intake", "Professional or social-impact objective", "Branding or reporting requirements"],
        "cta_label": "Start a Sponsorship Conversation",
        "cta_url": "/information-session",
    }
    content.faq = {
        "eyebrow": "Frequently asked questions",
        "title": "Questions about sponsorship, benefits and independence.",
        "description": "Clear answers before a sponsorship or strategic partnership begins.",
        "items": [
            {"question": "Who can become an IPC sponsor?", "answer": "Employers, consultancies, training providers, universities, recruitment companies, NGOs, charities, foundations, public bodies, professional service firms and individual donors may enquire. All relationships remain subject to suitability and Institute approval."},
            {"question": "Are sponsorship prices published online?", "answer": "No. Sponsorship is tailored to the activity, duration, audience, support required and benefits agreed. It is confirmed individually in writing."},
            {"question": "Can we sponsor one learner?", "answer": "Yes. An organisation or donor may support one learner, a group, a named scholarship, a bursary category or a broader intake."},
            {"question": "Can a sponsor select a scholarship recipient?", "answer": "A sponsor may agree an appropriate purpose or eligibility focus, but selection remains subject to fair criteria, programme requirements and independent review."},
            {"question": "Can an award sponsor select the winner?", "answer": "No. Sponsors may support and promote a category, but they do not control judging, scores, finalists or winners."},
            {"question": "Will sponsorship provide access to member data?", "answer": "No unrestricted access is provided. Engagement must respect consent, privacy, data protection and the purpose for which information was collected."},
            {"question": "Can our experts speak at an event?", "answer": "Potential speaking opportunities may be discussed, but speakers and content remain subject to Institute approval and technical relevance."},
            {"question": "Can we sponsor a magazine article?", "answer": "Sponsored editorial or thought-leadership content may be considered where useful, accurate and clearly labelled. It remains subject to editorial review."},
            {"question": "Can a university sponsor research or student prizes?", "answer": "Yes. Academic partners may support dissertation prizes, calls for papers, applied research, guest lectures, student membership and scholarships."},
            {"question": "How is sponsorship impact reported?", "answer": "Reporting depends on the agreement and may include supported places, participation, outputs, events, publications or appropriately consented impact stories."},
        ],
    }
    content.final_cta = {
        "eyebrow": "Build professional impact",
        "title": "Sponsor opportunity, recognition and stronger project controls capability.",
        "description": "Support a learner, fund a scholarship, sponsor a master class, recognise excellence, strengthen a regional club, publish useful knowledge or build a strategic partnership.",
        "primary_cta_label": "Discuss Sponsorship",
        "primary_cta_url": "/information-session",
        "secondary_cta_label": "Sponsor a Learner",
        "secondary_cta_url": "/information-session",
        "tertiary_cta_label": "Sponsor an Award",
        "tertiary_cta_url": "/information-session",
        "address": "39 Maidstone Innovation Centre, Maidstone, Kent, ME14 5FY",
        "email": "office@instituteofprojectcontrols.org",
    }
    content.seo = {
        "title": "Project Controls Sponsorship | Sponsor Learners, Events, Awards & Clubs",
        "description": "Sponsor learners, scholarships, events, awards, regional clubs, publications, research and professional impact through the Institute of Project Controls.",
        "canonical_path": "/sponsorship",
        "noindex": False,
        "nofollow": False,
    }
    content.save()


class Migration(migrations.Migration):
    dependencies = [("sponsorship", "0006_sync_current_sponsorship_content")]

    operations = [
        migrations.AddField(
            model_name="sponsorshipcontent",
            name="scholarship_feature",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="sponsorshipcontent",
            name="recognition_levels",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.RunPython(sync_preview_15_content, migrations.RunPython.noop),
    ]
