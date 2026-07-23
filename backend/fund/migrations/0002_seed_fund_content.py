from django.db import migrations
from django.utils import timezone


def item(item_id, **values):
    return {"id": item_id, "is_active": True, **values}


def seed_fund_content(apps, schema_editor):
    FundContent = apps.get_model("fund", "FundContent")
    defaults = {
        "hero": {
            "eyebrow": "IPC funded opportunities",
            "title": "Fund the people behind",
            "highlight": "better project decisions.",
            "description": "Support future project-controls talent, professional learning, regional capability and applied research across planning, cost, risk, change, data and assurance.",
            "primary_cta_label": "Apply for support",
            "primary_cta_url": "#applicant-route",
            "secondary_cta_label": "Fund an opportunity",
            "secondary_cta_url": "#funder-route",
            "image": "/images/membership/hero.svg",
            "image_alt": "",
            "proof_points": [
                item("specialist", title="Specialist by design", description="Focused on project-controls talent and applied competence."),
                item("application", title="One clear application", description="Applicants can be guided towards the most suitable route."),
                item("transparent", title="Transparent by default", description="Eligibility, selection, privacy and reporting remain visible."),
            ],
            "areas": [
                item("talent", title="Future Talent", description="Scholarships, bursaries and supported entry routes."),
                item("learning", title="Professional Learning", description="Master Classes, CPD and mentoring access."),
                item("research", title="Applied Research", description="Evidence for AI, forecasting, data and sustainability."),
                item("regional", title="Regional Skills", description="Local capability, clubs and employer connection."),
                item("awards", title="Awards & Recognition", description="Visibility for excellence and emerging talent."),
            ],
        },
        "purpose": {
            "eyebrow": "Why fund project controls",
            "title": "Better projects begin with better professional capability.",
            "description": "Project-controls professionals test assumptions, interpret variance, forecast outcomes and help leaders act before problems become irreversible.",
            "supporting_text": "Funding access to learning, recognition, mentoring and community helps the profession develop the people and judgement required for more reliable project decisions.",
            "cta_label": "Explore funding routes",
            "cta_url": "#routes",
            "items": [
                item("access", label="01 / ACCESS", title="Remove barriers to entry", description="Help learners, career changers, veterans, community leaders and people facing employment barriers access professional opportunity."),
                item("capability", label="02 / CAPABILITY", title="Strengthen workforce skills", description="Support technical learning, mentoring, CPD, professional recognition and clearer career progression."),
                item("knowledge", label="03 / KNOWLEDGE", title="Fund evidence that travels", description="Enable applied research, articles, case studies, professional publications and knowledge-sharing activity."),
                item("community", label="04 / COMMUNITY", title="Build local and national networks", description="Support regional clubs, Master Classes, mentoring, employer engagement and professional exchange."),
            ],
        },
        "programmes": {
            "eyebrow": "Core funding programmes",
            "title": "Three flagship routes first. Additional pathways when the evidence is ready.",
            "description": "The launch proposition prioritises future talent, professional learning and applied research. Every live route should publish its value, places, criteria and dates.",
            "information_title": "Funding information centre",
            "information_description": "Replace placeholders only after formal programme approval.",
            "information": [
                item("values", label="Funding values", value="To be announced"),
                item("window", label="Next application window", value="Register for updates"),
                item("status", label="Current status", value="Programme design stage"),
            ],
            "items": [
                item("future-talent", number="01", status="Register interest", title="Future Talent Access", description="Support students, apprentices, graduates, returners and career changers through funded access to professional learning and community.", may_support="Scholarships, bursaries, Affiliate access, mentoring, events and career workshops.", best_for="People entering or repositioning into project controls.", outcome="Confidence, employability, professional identity and progression.", quote="Potential should not be limited by access.", cta_label="Check your route", cta_url="/information-session"),
                item("professional-learning", number="02", status="Register interest", title="Professional Learning & Regional Skills", description="Fund Master Classes, mentoring circles, technical talks, regional clubs, employer forums and selected professional-development access.", may_support="Funded places, speakers, venues, mentoring, accessibility and local activity.", best_for="Practitioners, teams, regional communities and emerging professionals.", outcome="Applied capability, CPD, connection and stronger local talent networks.", quote="Build capability where people live and deliver.", cta_label="Check your route", cta_url="/information-session"),
                item("applied-research", number="03", status="Call forthcoming", title="Applied Research & Innovation", description="Support research and practice-led insight that advances project-controls evidence, methods and decision quality.", may_support="Research, datasets, practitioner access, publications and dissemination.", best_for="Researchers, academics, practitioners and organisational collaborators.", outcome="Applied knowledge, professional evidence and better controls practice.", quote="Fund the evidence that moves the profession forward.", cta_label="Explore research", cta_url="/information-session"),
            ],
            "notice": "No funding amount or deadline is claimed until formally approved. The catalogue supports up to 40 scholarship or bursary places per intake, subject to eligibility and funding.",
        },
        "routes": {
            "eyebrow": "Professional impact pathways",
            "title": "Choose the outcome your organisation wants to make possible.",
            "description": "Select a funding route to understand the audience, possible support and intended professional impact.",
            "items": [
                item("learners", tab="Learner Access", tab_description="Scholarships and bursaries", eyebrow="Learner Access Fund", title="Open the profession to talent that might otherwise be missed.", description="Support selected learners, career changers and emerging professionals through scholarships, bursaries, event access, mentoring and professional-community pathways.", audience="Students, apprentices, graduates, career changers and people facing barriers to employment.", support="Scholarship places, bursaries, learning access, mentoring, events and professional affiliation.", outcome="Employability, confidence, professional identity and a visible progression route.", design_title="Define the learner group and the opportunity", design_description="A strong funding proposal identifies who should benefit, the barrier being reduced, the development activity and the intended professional next step.", note="Scholarship routes may support up to 40 places per intake, subject to eligibility, programme design and available funding.", cta_label="Fund learner access", cta_url="/information-session"),
                item("learning", tab="Professional Learning", tab_description="Events, mentoring and CPD", eyebrow="Professional Learning Fund", title="Turn specialist knowledge into stronger professional judgement.", description="Support Master Classes, technical sessions, mentoring circles, CPD access and professional-learning activity across modern project controls.", audience="Practitioners, early-career professionals, Associate Fellows, employers and professional teams.", support="Speakers, venues, learner places, production, accessibility, mentoring and technical-content delivery.", outcome="Improved capability, CPD evidence, cross-sector learning and more reliable project decision support.", design_title="Define the learning outcome", design_description="The funding route should identify the professional capability being developed, the intended audience and how participants can apply the learning.", note="Technical content remains subject to relevance, evidence, professional quality and appropriate review.", cta_label="Fund professional learning", cta_url="/information-session"),
                item("community", tab="Regional Skills", tab_description="Clubs and local capability", eyebrow="Regional Skills Fund", title="Build project-controls capability where people work and study.", description="Support regional clubs, local talks, mentoring, site visits, employer engagement and learner activity in London, Nottingham, Manchester and Kent–Maidstone.", audience="Regional professionals, employers, learners, academics, career changers and local communities.", support="Venues, speakers, travel, learner access, mentoring, site visits and local programme delivery.", outcome="Stronger local networks, employability, confidence, mentoring and regional capability.", design_title="Define the region and skills need", design_description="A strong route identifies the location, beneficiary group, capability gap and the local activity that funding will enable.", note="Regional funding does not provide automatic access to private member or attendee information.", cta_label="Fund regional skills", cta_url="/information-session"),
                item("awards", tab="Awards & Recognition", tab_description="Excellence and visibility", eyebrow="Awards & Recognition Fund", title="Celebrate excellence and make contribution visible.", description="Support academic, commercial, professional and special-recognition awards, prizes, finalist profiles and emerging-talent opportunities.", audience="Students, researchers, professionals, teams, employers, academic partners and community contributors.", support="Prizes, event access, publication, finalist profiles, ceremony support and social-impact categories.", outcome="Professional visibility, employer recognition, aspiration, contribution and stronger professional stories.", design_title="Protect judging independence", design_description="The funder can support the route and receive ethical visibility, while eligibility, assessment and final decisions remain independent.", note="Funding does not provide automatic judging rights or influence award outcomes.", cta_label="Fund awards and recognition", cta_url="/information-session"),
                item("knowledge", tab="Research & Knowledge", tab_description="Publications and applied insight", eyebrow="Research & Knowledge Fund", title="Help evidence-led knowledge reach the profession.", description="Support applied research, professional publications, articles, case studies, journal activity and knowledge-sharing on AI, data, sustainability, productivity, risk and controls maturity.", audience="Practitioners, researchers, academics, employers, consultants and learners.", support="Research access, editorial production, accessibility, design, distribution and publication activity.", outcome="Applied insight, research visibility, transferable lessons and stronger professional practice.", design_title="Protect editorial credibility", design_description="The supported activity should be clearly defined while preserving author, reviewer and editorial independence.", note="Funding does not guarantee publication, endorsement or favourable editorial treatment.", cta_label="Fund research and knowledge", cta_url="/information-session"),
            ],
            "notice": "Funding scope, availability and delivery arrangements should be confirmed for each programme. This page does not publish fixed prices, donation amounts or tax-relief claims.",
        },
        "applicant_matcher": {
            "eyebrow": "One clear application journey",
            "title": "Apply once. Discover the routes that fit.",
            "description": "A unified eligibility journey is simpler than asking applicants to understand every funding programme before they begin.",
            "notice": "This matcher is indicative only. Final eligibility depends on published criteria, available funding and IPC review.",
            "items": [
                item("duplication", title="Less duplication", description="Provide core information once rather than completing separate forms for every pathway."),
                item("matching", title="Better matching", description="Consider career stage, access barriers, professional objectives and location."),
                item("evidence", title="Clear evidence", description="Applicants understand which statement, documents or endorsements may be requested."),
                item("outcomes", title="Respectful outcomes", description="Receive a relevant route, request for information or honest development guidance."),
            ],
        },
        "impact": {
            "eyebrow": "From funding to professional impact",
            "title": "Make every contribution purposeful, visible and accountable.",
            "description": "The strongest funding route begins with a clear audience and ends with a credible professional outcome—not a vague promise.",
            "items": [
                item("access", icon="ri-door-open-line", title="Access created", description="What barrier was reduced and what professional opportunity became available?"),
                item("participation", icon="ri-group-line", title="Participation", description="Which learning, mentoring, event, club, award or research activity was completed?"),
                item("capability", icon="ri-line-chart-line", title="Capability", description="What knowledge, confidence, evidence or professional connection was developed?"),
                item("progression", icon="ri-arrow-up-circle-line", title="Progression", description="What realistic next step followed—employment, further study, mentoring, membership or contribution?"),
                item("public-value", icon="ri-community-line", title="Public value", description="How did the activity support social mobility, regional skills, sustainability or responsible delivery?"),
                item("reporting", icon="ri-file-chart-line", title="Responsible reporting", description="How will activity and outcomes be reported accurately, proportionately and with consent?"),
            ],
        },
        "research": {
            "eyebrow": "Applied Research & Innovation",
            "status": "Future funding call — register interest",
            "title": "Fund the evidence that moves project controls forward.",
            "description": "IPC can create a specialist annual call connecting researchers and practitioners with live project-controls questions, professional audiences and publication routes.",
            "cta_label": "Register research interest",
            "cta_url": "/information-session",
            "notice": "Funding value, dates and formal eligibility will be published only after approval.",
            "items": [
                item("ai", label="AI & ANALYTICS", icon="ri-brain-line", title="AI-enabled forecasting", description="Human judgement, validation, explainability and accountable use of automated outputs."),
                item("schedule", label="SCHEDULE", icon="ri-calendar-check-line", title="Schedule reliability", description="Baseline credibility, progress quality, forecast accuracy and recovery decision-making."),
                item("integration", label="INTEGRATION", icon="ri-links-line", title="Cost and schedule integration", description="Connected evidence for commitments, progress, forecasts and decision support."),
                item("risk", label="RISK", icon="ri-scales-3-line", title="Risk, change and contingency", description="Uncertainty, change discipline, confidence levels and defensible contingency practice."),
                item("data", label="DATA", icon="ri-database-2-line", title="Data quality and assurance", description="Provenance, governance, reconciliation, controls maturity and reporting confidence."),
                item("public-value", label="PUBLIC VALUE", icon="ri-leaf-line", title="Carbon and sustainability controls", description="Making time, cost, risk and environmental consequences visible together."),
            ],
        },
        "employer": {
            "eyebrow": "Employer-funded development",
            "title": "Help professionals make the business case internally.",
            "description": "Not every funding route requires an external donor. Employers can support membership, learning, mentoring and progression where there is a clear organisational benefit.",
            "cta_label": "Request employer toolkit",
            "cta_url": "/information-session",
            "items": [
                item("letter", title="Manager approval letter", description="A concise case explaining professional value, outcomes and requested support."),
                item("benefits", title="Organisational benefits summary", description="Capability, retention, succession planning, tender credibility and reporting quality."),
                item("cpd", title="Learning and CPD plan", description="How Master Classes, mentoring, practice and reflection connect to development."),
                item("recognition", title="Recognition pathway", description="How an employee can move from affiliation to applied or senior standing."),
                item("purchase", title="Purchase and invoicing guidance", description="A future operational section for approved payment and corporate arrangements."),
            ],
        },
        "partners": {
            "eyebrow": "Who can fund professional impact",
            "title": "Partnership routes for organisations across the talent and project-delivery ecosystem.",
            "description": "Funding can come through employers, consultancies, academic and training partners, charities, public bodies, recruitment organisations and responsible service providers.",
            "levels": [
                item("founding", label="FOUNDING", title="Founding Impact Partner", description="Supports the creation of a flagship programme and its governance, delivery or launch.", cta_label="Discuss partnership", cta_url="/information-session"),
                item("talent", label="TALENT", title="Strategic Skills Partner", description="Supports future talent, workforce capability, mentoring or learning access.", cta_label="Discuss partnership", cta_url="/information-session"),
                item("research", label="RESEARCH", title="Research & Innovation Partner", description="Supports applied evidence, practitioner access, publications and dissemination.", cta_label="Discuss partnership", cta_url="/information-session"),
                item("regional", label="REGIONAL", title="Regional Opportunity Partner", description="Supports clubs, learner access, technical talks, mentoring and local engagement.", cta_label="Discuss partnership", cta_url="/information-session"),
                item("supporter", label="SUPPORTER", title="Professional Supporter", description="Provides funding, expertise, speakers, mentors, venues, tools or funded places.", cta_label="Discuss support", cta_url="/information-session"),
            ],
            "notice": "Partner levels describe contribution type. Financial thresholds should be published only after commercial and legal approval.",
            "items": [
                item("employers", title="Employers", description="Fund workforce development, learner access, CPD, regional skills and visible social value.", cta_label="Explore employer funding", cta_url="/information-session"),
                item("consultancies", title="Consultancies", description="Support talent, thought leadership, mentoring, events, research and professional visibility.", cta_label="Explore consultancy funding", cta_url="/information-session"),
                item("academic", title="Academic & training partners", description="Connect learners, courses, employability, research and professional progression.", cta_label="Explore academic funding", cta_url="/information-session"),
                item("charities", title="Charities & public bodies", description="Support social mobility, second-chance careers, veterans, regional capability and public value.", cta_label="Explore public-value funding", cta_url="/information-session"),
                item("recruitment", title="Recruitment & service partners", description="Back career workshops, emerging-talent awards, regional clubs and ethical networking.", cta_label="Explore talent funding", cta_url="/information-session"),
            ],
        },
        "principles": {
            "eyebrow": "Funding principles",
            "title": "Prestige, impact and professional trust must move together.",
            "description": "Funding should strengthen the profession without weakening independence, privacy or the credibility of recognition.",
            "items": [
                item("purpose", title="Purpose before promotion", description="The supported professional outcome should lead the partnership—not logo placement or sales activity."),
                item("independent", title="Independent recognition", description="Funders must not influence membership grades, scholarship eligibility, judging or professional-review decisions."),
                item("consent", title="Consent and privacy", description="Funding does not provide automatic access to private learner, member, nominee or attendee information."),
                item("visibility", title="Transparent visibility", description="Commercial support, acknowledgements and sponsored content should be disclosed clearly."),
                item("evidence", title="Evidence-led impact", description="Reports should distinguish activities, outputs, outcomes and longer-term impact without exaggeration."),
                item("responsible", title="Responsible partnership", description="Funding should align with integrity, competence, accountability, technology responsibility and public value."),
            ],
        },
        "route_builder": {
            "eyebrow": "Impact route builder",
            "title": "What change does your organisation want to fund?",
            "description": "Answer three questions to generate an indicative starting route.",
            "button_label": "Build recommended route",
        },
        "governance": {
            "eyebrow": "Governance before promotion",
            "title": "A professional institute earns funding trust through visible rules.",
            "description": "A route should not be marked open until its purpose, eligibility, value, timeline, evidence and decision process are complete.",
            "items": [
                item("selection", title="Independent selection", description="Partners do not decide grades, scholarship recipients, award winners or editorial outcomes."),
                item("eligibility", title="Published eligibility", description="Every live opportunity defines its audience, evidence, criteria, deadlines and decision process."),
                item("conflicts", title="Conflicts management", description="Reviewers and decision-makers declare and manage relevant interests."),
                item("privacy", title="Privacy and consent", description="Applicants understand how their data, images and stories may be used."),
            ],
            "standard_title": "What every live programme must publish",
            "standard": [
                item("purpose", title="Purpose", description="The objective and the professional or public-value problem being addressed."),
                item("eligibility", title="Eligibility", description="Who can apply and any geographical, study, employment or membership conditions."),
                item("value", title="Value", description="Number of places, award amount or clearly defined non-financial support."),
                item("timeline", title="Timeline", description="Opening date, deadline, decision date and delivery period."),
                item("evidence", title="Evidence", description="Required statement, documents, endorsement, portfolio or proposal."),
                item("assessment", title="Assessment", description="Criteria, review approach, conflicts safeguards and decision communication."),
                item("reporting", title="Reporting", description="How participation, outcomes and impact will be measured and communicated."),
            ],
        },
        "process": {
            "eyebrow": "Funding partnership process",
            "title": "From ambition to accountable professional impact.",
            "description": "A clear process protects the funder, the Institute and the people the programme is designed to support.",
            "items": [
                item("define", title="Define", description="Clarify the objective, beneficiary group, problem being addressed and intended professional outcome."),
                item("design", title="Design", description="Agree the route, activities, available places, responsibilities, visibility and delivery period."),
                item("safeguard", title="Safeguard", description="Confirm privacy, independence, eligibility, conflicts, communications and reporting arrangements."),
                item("deliver", title="Deliver", description="Run the scholarship, learning, club, award, publication or research activity as agreed."),
                item("report", title="Report", description="Review participation, outputs, professional outcomes, lessons and future recommendations."),
            ],
            "primary_cta_label": "Start a funding enquiry",
            "primary_cta_url": "/information-session",
            "secondary_cta_label": "Build route first",
            "secondary_cta_url": "#routes",
        },
        "assurance": {
            "eyebrow": "Accountability and assurance",
            "title": "Fund impact with professional discipline.",
            "description": "Funding should be governed with the same principles project-controls professionals apply to complex delivery: clarity, evidence, assurance and transparent reporting.",
            "statistics": [
                item("places", value="—", title="Funded places awarded", description="Published after the first approved cycle."),
                item("learning", value="—", title="Learning or mentoring completions", description="Reported after delivery."),
                item("research", value="—", title="Research outputs supported", description="Subject to review and publication."),
                item("progression", value="—", title="Progression outcomes", description="Reported proportionately and with consent."),
            ],
            "notice": "No impact figures are invented. Replace each placeholder with verified programme data and a clearly stated reporting period.",
            "items": [
                item("scope", label="01 / SCOPE", title="Clear purpose and boundaries", description="Define what is being funded, who benefits, what is excluded and what success should mean."),
                item("governance", label="02 / GOVERNANCE", title="Responsibilities and approvals", description="Confirm decision routes, ownership, safeguarding, conflicts and communication responsibilities."),
                item("performance", label="03 / PERFORMANCE", title="Proportionate evidence", description="Track delivery, participation, outputs and professional outcomes without creating unnecessary burden."),
                item("transparency", label="04 / TRANSPARENCY", title="Honest impact reporting", description="Report what happened, what changed, what remains uncertain and what should improve next."),
            ],
        },
        "faq": {
            "eyebrow": "Funding questions",
            "title": "Clear answers before starting a funding conversation.",
            "description": "Understand scope, pricing, recognition, privacy, impact and partner visibility.",
            "items": [
                item("support", question="What can the IPC Professional Impact Fund support?", answer="Potential routes include scholarships, bursaries, learner access, Master Classes, mentoring, regional clubs, awards, professional publications, research and community activity."),
                item("prices", question="Are fixed funding packages or prices published?", answer="No. The catalogue does not include pricing or fee schedules. Funding scope should be discussed by email and designed around the programme, audience and intended outcome."),
                item("recognition", question="Does funding guarantee membership or professional recognition?", answer="No. Funding and recognition are separate. Membership grades, scholarship eligibility, awards and professional-review outcomes remain subject to their own criteria and independent decisions."),
                item("data", question="Do funders receive applicant or member data?", answer="No automatic access is provided. Personal data and impact stories should be handled lawfully, proportionately and with appropriate consent."),
                item("reporting", question="How will impact be reported?", answer="Reporting should distinguish participation, outputs, outcomes and longer-term impact using verified information and a stated reporting period."),
            ],
        },
        "final_cta": {
            "eyebrow": "Choose your next action",
            "title": "Apply for opportunity—or make opportunity possible.",
            "description": "Applicants can register a professional need. Employers, academics and responsible partners can define the impact they want to fund.",
            "primary_cta_label": "Apply for support",
            "primary_cta_url": "/information-session",
            "secondary_cta_label": "Fund an opportunity",
            "secondary_cta_url": "/information-session",
            "notice": "IPC funding and sponsorship should remain transparent, consent-based and separate from professional-recognition, judging and editorial decisions.",
        },
        "seo": {
            "title": "Funded Opportunities",
            "description": "Support future project-controls talent, professional learning, regional capability and applied research through IPC funded opportunities.",
            "canonical_url": "/fund",
            "open_graph_title": "IPC Funded Opportunities",
            "open_graph_description": "Fund talent, professional learning, regional capability and applied research.",
            "open_graph_image": "",
            "noindex": False,
            "nofollow": False,
        },
        "status": "published",
        "is_active": True,
        "published_at": timezone.now(),
    }
    FundContent.objects.update_or_create(key="main", defaults=defaults)


class Migration(migrations.Migration):
    dependencies = [("fund", "0001_initial")]
    operations = [
        migrations.RunPython(seed_fund_content, migrations.RunPython.noop),
    ]

