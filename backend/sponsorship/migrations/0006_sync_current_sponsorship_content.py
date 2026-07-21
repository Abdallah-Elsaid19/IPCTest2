from django.db import migrations
from django.utils import timezone


def sync_content(apps, schema_editor):
    Content = apps.get_model("sponsorship", "SponsorshipContent")
    content = Content.objects.filter(key="main").first()
    if content is None:
        content = Content(key="main", routes=[], partner_types=[], integrity_principles=[])
    if not content.legacy_content:
        content.legacy_content = {"routes": content.routes, "partner_types": content.partner_types, "integrity_principles": content.integrity_principles}
    content.hero = {"eyebrow": "Sponsorship & partnerships", "title": "Support opportunity. Strengthen the profession.", "description": "Partner with IPC to support scholarships, events, awards, regional clubs, publications and professional-development activity through transparent, ethical and outcome-focused sponsorship.", "primary_cta_label": "Build a sponsorship route", "primary_cta_url": "#route-builder", "secondary_cta_label": "Explore opportunities", "secondary_cta_url": "#opportunities"}
    content.principles = {"eyebrow": "Professional impact", "title": "Support opportunity through transparent, accountable partnership.", "description": "IPC sponsorship connects organisational support with clear professional purpose and safeguards.", "items": [
        {"icon": "ri-focus-3-line", "title": "Purpose-led", "description": "Sponsorship should create access, capability or useful professional knowledge."},
        {"icon": "ri-eye-line", "title": "Ethically visible", "description": "Receive agreed recognition without influencing independent decisions."},
        {"icon": "ri-line-chart-line", "title": "Outcome-focused", "description": "Define the audience, activity, support and intended professional impact."},
        {"icon": "ri-file-list-3-line", "title": "Transparent packages", "description": "Clear scope, visibility, responsibilities and deliverables."},
        {"icon": "ri-shield-check-line", "title": "Independent decisions", "description": "No sponsor control over recognition, judging or editorial outcomes."},
        {"icon": "ri-lock-line", "title": "Consent-based engagement", "description": "No automatic access to private member or attendee data."},
        {"icon": "ri-bar-chart-box-line", "title": "Impact reporting", "description": "Measure activity and outcomes without overstating claims."},
    ]}
    content.purpose = {"eyebrow": "Why sponsor IPC", "title": "Connect organisational support with visible professional value.", "description": "Effective sponsorship should do more than place a logo. It should widen access, strengthen capability, recognise excellence or help useful knowledge reach the profession. IPC sponsorship routes are designed to support members, learners, employers, academic partners and regional communities while protecting professional independence.", "items": [
        {"icon": "ri-door-open-line", "title": "Open professional opportunity", "description": "Support scholarships, learner places, event access and career-development routes."},
        {"icon": "ri-team-line", "title": "Strengthen the talent pipeline", "description": "Connect future and current professionals with technical learning, mentors and employers."},
        {"icon": "ri-book-open-line", "title": "Help useful practice travel", "description": "Support publications, case studies, research, speakers and professional discussion."},
        {"icon": "ri-award-line", "title": "Celebrate excellence", "description": "Enable awards, prizes and professional profiles without compromising judging independence."},
    ]}
    content.routes_intro = {"eyebrow": "Sponsorship opportunities", "title": "Choose the route that matches your organisation’s purpose.", "description": "Select an opportunity to see the audience, possible support and the professional outcome the partnership should create."}
    content.routes = [
        {"id": "scholarships", "icon": "ri-graduation-cap-line", "tab": "Scholarships", "tabDescription": "Learners and emerging talent", "eyebrow": "Scholarships & bursaries", "title": "Widen access to project-controls opportunity.", "description": "Support eligible learners, career changers or emerging professionals through agreed learning, mentoring, event or community pathways.", "audience": "Students, apprentices, graduates, career changers and early-career professionals.", "support": "Learner places, event access, mentoring, materials or professional-development activity.", "outcome": "Access, confidence, employability, community and a clearer progression route.", "designTitle": "Define the learner group and intended impact", "designDescription": "The proposal should explain the target group, support model, eligibility, available places and how impact will be reported.", "note": "Sponsorship does not guarantee membership, recognition or employment outcomes.", "cta": "Discuss scholarship sponsorship"},
        {"id": "events", "icon": "ri-calendar-event-line", "tab": "Events", "tabDescription": "Learning and professional exchange", "eyebrow": "Events & master classes", "title": "Support high-value professional learning and exchange.", "description": "Enable London Master Classes, professional roundtables, regional activity, mentoring circles or employer forums.", "audience": "Members, practitioners, employers, consultants, academics and emerging professionals.", "support": "Venue, production, speaker support, learner places, accessibility or programme funding.", "outcome": "Technical learning, professional connection, CPD and wider access to practice.", "designTitle": "Define the event and audience", "designDescription": "The proposal should confirm the format, learning outcome, audience, visibility, responsibilities and registration approach.", "note": "Sponsor content remains subject to relevance, evidence and editorial review.", "cta": "Discuss event sponsorship"},
        {"id": "awards", "icon": "ri-award-line", "tab": "Awards", "tabDescription": "Excellence and contribution", "eyebrow": "Awards & prizes", "title": "Recognise evidence, excellence and professional contribution.", "description": "Support academic, commercial or professional awards and prizes through transparent arrangements that protect judging independence.", "audience": "Students, researchers, professionals, teams, employers and academic partners.", "support": "Category funding, prizes, event support, accessibility, publication or finalist profiles.", "outcome": "Visible recognition, professional stories, employer value and shared learning.", "designTitle": "Protect judging and recognition independence", "designDescription": "The package should define visibility while keeping sponsor interests separate from eligibility, scoring and final decisions.", "note": "Sponsorship does not provide automatic judging rights or guarantee any award outcome.", "cta": "Discuss awards sponsorship"},
        {"id": "clubs", "icon": "ri-team-line", "tab": "Regional clubs", "tabDescription": "Local professional communities", "eyebrow": "Regional clubs", "title": "Help professional communities grow locally.", "description": "Support regional talks, networking, mentoring, site visits, student engagement and employer activity.", "audience": "Professionals, learners, employers, consultants and academic partners in regional communities.", "support": "Venue, refreshments, learner access, speakers, travel, site visits or local programme funding.", "outcome": "Stronger local networks, CPD, mentoring and employer or academic connection.", "designTitle": "Define the region and community need", "designDescription": "The proposal should identify the regional club, intended activity, audience, hosting requirements and safeguards.", "note": "Regional sponsorship does not provide access to private member or attendee data.", "cta": "Discuss regional sponsorship"},
        {"id": "publications", "icon": "ri-book-2-line", "tab": "Publications", "tabDescription": "Research and professional knowledge", "eyebrow": "Publications & research", "title": "Help useful professional knowledge reach the sector.", "description": "Support articles, case studies, applied research, journal activity, reports and knowledge-sharing initiatives.", "audience": "Practitioners, researchers, academics, employers, consultants and learners.", "support": "Editorial production, research access, accessibility, design, distribution or publication funding.", "outcome": "Evidence-led knowledge, transferable lessons, research visibility and better professional practice.", "designTitle": "Protect editorial credibility", "designDescription": "The arrangement should define the supported work while preserving author, reviewer and editorial independence.", "note": "Sponsorship does not guarantee publication, endorsement or favourable editorial treatment.", "cta": "Discuss publication sponsorship"},
    ]
    content.benefits = {"eyebrow": "Sponsor value", "title": "Credible visibility built around contribution—not interruption.", "description": "Sponsor value should come from supporting useful professional activity and being associated with a clear, ethical purpose.", "items": [
        {"icon": "ri-layout-4-line", "title": "Agreed brand visibility", "description": "Appropriate acknowledgement on programme pages, selected communications, event materials or publications."},
        {"icon": "ri-focus-2-line", "title": "Purpose association", "description": "Be visibly connected with access, learning, excellence, community or shared professional knowledge."},
        {"icon": "ri-discuss-line", "title": "Professional engagement", "description": "Participate through approved speakers, mentors, hosts, case studies or employer discussions."},
        {"icon": "ri-user-follow-line", "title": "Talent-pipeline contribution", "description": "Support learners and emerging professionals without receiving private applicant data or preferential access."},
        {"icon": "ri-file-chart-line", "title": "Impact reporting", "description": "Receive proportionate information on supported activity, participation and outcomes."},
        {"icon": "ri-lightbulb-flash-line", "title": "Thought-leadership routes", "description": "Contribute credible technical knowledge subject to review, evidence and editorial standards."},
    ]}
    content.integrity_principles = [
        {"icon": "ri-scales-3-line", "title": "No influence over recognition", "description": "Sponsors do not decide membership grades, evidence outcomes or professional-review decisions."},
        {"icon": "ri-award-line", "title": "No control over judging", "description": "Awards and prizes must use declared criteria, conflicts management and appropriate independent assessment."},
        {"icon": "ri-lock-line", "title": "No automatic data access", "description": "Member, learner, nominee and attendee information remains protected and consent-based."},
        {"icon": "ri-article-line", "title": "No guaranteed editorial outcome", "description": "Sponsored articles, case studies or speakers remain subject to relevance, evidence and review."},
        {"icon": "ri-file-shield-2-line", "title": "Clear commercial disclosure", "description": "Sponsorship and promotional relationships should be labelled transparently."},
        {"icon": "ri-check-double-line", "title": "Proportionate claims", "description": "Impact and visibility statements must remain specific, supportable and free from exaggeration."},
    ]
    content.integrity_intro = {"eyebrow": "Ethics and independence", "title": "Visibility must never weaken professional trust.", "description": "Sponsorship arrangements should protect recognition, judging, editorial independence, privacy and the credibility of the Institute."}
    content.route_builder = {
        "eyebrow": "Sponsorship route builder", "title": "Create an indicative partnership route.",
        "description": "Answer three questions to generate a recommended starting conversation.",
        "button_label": "Build recommended route", "result_cta_label": "Start the conversation",
        "result_cta_url": "/information-session",
        "questions": [
            {"key": "objective", "label": "What is your main objective?", "options": [{"label": "Widen access", "value": "access"}, {"label": "Support learning", "value": "learning"}, {"label": "Recognise excellence", "value": "recognition"}, {"label": "Share knowledge", "value": "knowledge"}, {"label": "Support community", "value": "community"}]},
            {"key": "audience", "label": "Who should benefit most?", "options": [{"label": "Learners or career changers", "value": "learners"}, {"label": "IPC members", "value": "members"}, {"label": "Wider profession", "value": "profession"}, {"label": "Regional community", "value": "regional"}]},
            {"key": "support", "label": "How would you like to contribute?", "options": [{"label": "Funding", "value": "funding"}, {"label": "Venue or hosting", "value": "venue"}, {"label": "Speakers or mentors", "value": "people"}, {"label": "Combined package", "value": "combined"}]},
        ],
        "results": {
            "incomplete": {"title": "Complete all three questions", "description": "Choose one answer in each section so the page can suggest the most relevant sponsorship route."},
            "access": {"title": "Scholarship or learner-access sponsorship", "description": "Support a defined learner or emerging-talent group through access, mentoring, events or professional-development opportunities."},
            "recognition": {"title": "Awards and prizes sponsorship", "description": "Support professional recognition, prizes, finalist profiles or awards activity while protecting judging independence."},
            "knowledge": {"title": "Publication, research or technical-learning sponsorship", "description": "Support evidence-led knowledge, technical sessions, research, case studies or professional publications subject to review."},
            "community": {"title": "Regional club sponsorship", "description": "Support local talks, networking, mentoring, site visits, venues or regional professional activity."},
            "default": {"title": "Event and professional-learning sponsorship", "description": "Support master classes, roundtables, mentoring, employer forums or wider event access."},
        },
    }
    content.process = {"eyebrow": "Partnership process", "title": "From sponsorship objective to accountable delivery.", "description": "A professional process protects both the sponsor and the Institute by defining the purpose, boundaries, deliverables and review arrangements.", "cta_label": "Start sponsorship enquiry", "cta_url": "/information-session", "steps": [
        {"id": "01", "title": "Discover", "description": "Clarify the organisation, objective, target audience, preferred route and intended professional impact."},
        {"id": "02", "title": "Design", "description": "Agree the supported activity, scope, responsibilities, visibility, safeguards and delivery period."},
        {"id": "03", "title": "Approve", "description": "Confirm governance, conflicts, privacy, commercial disclosure and final partnership terms."},
        {"id": "04", "title": "Deliver", "description": "Run the programme, event, award, club, scholarship or publication activity as agreed."},
        {"id": "05", "title": "Review", "description": "Report proportionately on delivery, participation, outcomes, lessons and future recommendations."},
    ]}
    content.impact = {"eyebrow": "Impact reporting", "title": "Measure contribution without overstating impact.", "description": "Reporting should match the size and nature of the sponsorship and should distinguish activity, participation, outputs and longer-term outcomes.", "items": [
        {"icon": "ri-checkbox-circle-line", "title": "Delivery", "description": "What activity was funded, hosted or enabled, and was it delivered as agreed?"},
        {"icon": "ri-team-line", "title": "Participation", "description": "How many eligible learners, members, speakers, mentors or organisations took part?"},
        {"icon": "ri-door-open-line", "title": "Access", "description": "What barrier was reduced or professional opportunity created?"},
        {"icon": "ri-seedling-line", "title": "Development", "description": "What learning, mentoring, connection or professional evidence was developed?"},
        {"icon": "ri-book-open-line", "title": "Knowledge", "description": "What useful content, research, case study or professional discussion was produced?"},
        {"icon": "ri-shield-user-line", "title": "Consent", "description": "Any story, image, quotation or profile must be used transparently and with permission."},
    ]}
    content.partner_types = [
        {"type": "Employers & consultancies", "benefits": "Support talent development · Host events or site visits · Provide speakers and mentors · Sponsor scholarships or awards · Strengthen social value", "items": ["Support talent development", "Host events or site visits", "Provide speakers and mentors", "Sponsor scholarships or awards", "Strengthen social value"], "cta": "Discuss employer sponsorship"},
        {"type": "Technology & service providers", "benefits": "Support technical learning · Provide approved demonstrations · Contribute evidence-led case studies · Sponsor event access · Support research and publications", "items": ["Support technical learning", "Provide approved demonstrations", "Contribute evidence-led case studies", "Sponsor event access", "Support research and publications"], "cta": "Discuss technology partnership"},
        {"type": "Academic partners & foundations", "benefits": "Support learners and researchers · Enable scholarships and prizes · Connect education with practice · Support employability · Develop public-value programmes", "items": ["Support learners and researchers", "Enable scholarships and prizes", "Connect education with practice", "Support employability", "Develop public-value programmes"], "cta": "Discuss academic support"},
    ]
    content.partners_intro = {"eyebrow": "Who can partner with IPC", "title": "Partnership routes for organisations across the project-controls ecosystem.", "description": "Sponsorship can be designed for organisations that want to support access, professional learning, recognition, research or regional community."}
    content.faq = {"eyebrow": "Sponsorship questions", "title": "Clear boundaries before a partnership begins.", "description": "Understand visibility, privacy, recognition, judging, content and reporting.", "items": [
        {"question": "What can an organisation sponsor?", "answer": "Potential routes include scholarships, learner places, events, master classes, awards, regional clubs, publications, research and selected professional-development activity."},
        {"question": "Can a sponsor influence membership or recognition decisions?", "answer": "No. Sponsorship must remain separate from membership grades, evidence assessment and professional-review decisions."},
        {"question": "Can sponsors access attendee, member or learner data?", "answer": "Not automatically. Any data use must be transparent, consent-based, proportionate and compliant with the relevant privacy arrangements."},
        {"question": "Can a sponsor provide a speaker or case study?", "answer": "Yes, where the content is relevant, evidence-led and useful to the audience. It remains subject to IPC review and should not become an undisclosed sales presentation."},
        {"question": "Can a sponsor judge an award category?", "answer": "Any judging involvement must be explicitly agreed, conflicts-managed and compatible with independence. Sponsorship alone does not create an automatic judging right."},
        {"question": "What impact information can a sponsor receive?", "answer": "Reporting can include supported activity, participation, access created, outputs and agreed outcomes, while protecting personal and confidential information."},
    ]}
    content.final_cta = {"eyebrow": "Create professional impact", "title": "Support opportunity, knowledge and excellence across project controls.", "description": "Share your organisation, objective, preferred route, proposed support and intended professional or social impact.", "primary_cta_label": "Start a sponsorship conversation", "primary_cta_url": "/information-session", "secondary_cta_label": "Explore opportunities", "secondary_cta_url": "#opportunities"}
    content.seo = {"title": "Sponsorship & Partnerships", "description": "IPC sponsorship opportunities support scholarships, events, awards, regional clubs, publications and professional-development activity through transparent and ethical partnerships.", "canonical_path": "/sponsorship", "noindex": False, "nofollow": False}
    content.status = "published"; content.is_active = True
    if content.published_at is None: content.published_at = timezone.now()
    content.save()


def restore_legacy_content(apps, schema_editor):
    SponsorshipContent = apps.get_model("sponsorship", "SponsorshipContent")
    content = SponsorshipContent.objects.filter(key="main").first()
    if not content or not content.legacy_content:
        return
    for field in ("routes", "partner_types", "integrity_principles"):
        if field in content.legacy_content:
            setattr(content, field, content.legacy_content[field])
    content.save(update_fields=["routes", "partner_types", "integrity_principles", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("sponsorship", "0005_sponsorshipcontent_integrity_intro_and_more")]
    operations = [migrations.RunPython(sync_content, restore_legacy_content)]
