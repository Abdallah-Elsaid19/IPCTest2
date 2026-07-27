from django.db import migrations, models
import ipc_backend.validators


def item(title, description, icon="ri-article-line", **extra):
    return {"title": title, "description": description, "icon": icon, **extra}


def sync_preview_18_content(apps, schema_editor):
    Content = apps.get_model("institutional", "PublicationContent")
    content = Content.objects.filter(key="main").first()
    if content is None:
        return

    content.hero = {
        "announcement": "Publication proposals are open: submit professional articles, technical case studies, research papers and editorial ideas.",
        "eyebrow": "Publications, Research & Professional Knowledge",
        "title": "Publish evidence. Advance project controls.",
        "description": "The Institute of Project Controls publication programme connects professional practice, academic research, employer insight and the people developing the future of the discipline.",
        "body": "Contribute professional magazine articles, technical case studies, academic papers, research notes, interviews and practice guidance on planning, cost, risk, change, forecasting, claims, data assurance, responsible AI, sustainability and leadership.",
        "callout": "Publication is not about sounding certain. It is about making evidence, assumptions, methods, limitations, judgement and learning visible enough for others to examine and use.",
        "primary_cta_label": "Propose an Article or Paper",
        "primary_cta_url": "/information-session",
        "secondary_cta_label": "Explore Publication Routes",
        "secondary_cta_url": "#publication-routes",
        "tertiary_cta_label": "Discuss Academic Partnership",
        "tertiary_cta_url": "/information-session",
        "panel_title": "IPC Professional Knowledge",
        "panel_description": "Evidence, insight and research for project controls.",
        "panel_summary": "Professional magazine, academic papers, technical case studies and applied research.",
        "panel_items": [
            "Forecasting, uncertainty and statistical discipline",
            "Responsible AI, data integrity and assurance",
            "Sustainability, carbon and whole-life value",
            "Professional judgement, ethics and leadership",
        ],
        "panel_note_title": "Staged publication programme",
        "panel_note": "Proposals are received through the information-session route. Formal issue dates and journal arrangements are announced only after approval.",
    }
    content.why_publish = {
        "eyebrow": "Why publication matters",
        "title": "Project controls knowledge should be examined, shared and improved.",
        "description": "Valuable lessons are often hidden in project files, private presentations, academic dissertations or the experience of individual professionals.",
        "body": [
            "Project controls develops when professionals explain not only what they did, but why they did it, what evidence they used, what assumptions were made, what uncertainty remained and what changed as a result.",
            "A strong publication programme gives practitioners a route to share applied learning, gives researchers a professional audience, helps employers demonstrate capability and gives students a visible bridge between education and the workplace.",
            "IPC publications are intended to make complex ideas useful. A statistically disciplined forecast, a schedule recovery lesson, a change-control failure, a carbon-cost-time model or an AI-assisted reporting workflow can all contribute when described honestly and supported by evidence.",
            "Publication also creates accountability. Authors must distinguish evidence from opinion, acknowledge limitations, protect confidential information, disclose conflicts and remain responsible for every claim published under their name.",
        ],
        "callout_title": "The publication proposition",
        "callout": "Do not publish certainty. Publish the evidence, method, limitations and judgement behind the conclusion.",
        "callout_description": "IPC seeks material that helps professionals think, question, apply and improve — not content written only to promote a person, employer, product or service.",
    }
    content.routes = {
        "eyebrow": "Publication routes",
        "title": "Different routes for professional practice, research and contribution.",
        "description": "Contributors can propose the format that best suits the evidence, audience and purpose of the work.",
        "items": [
            item("Professional Magazine", "Accessible, evidence-led content for practitioners, employers, consultants, students and partners. Suitable for interviews, technical articles, member profiles, career stories, event learning, award features and sector insight.", "ri-newspaper-line", code="01", cta="Propose a Magazine Article", url="/information-session"),
            item("Academic Journal & Papers", "A developing route for original research, practitioner papers, literature reviews, methodological work and academic-practice collaboration. Formal journal arrangements and peer-review procedures will be announced when approved.", "ri-graduation-cap-line", code="02", cta="Express Research Interest", url="/information-session"),
            item("Technical Case Studies", "Applied examples explaining the project context, controls challenge, evidence, method, intervention, outcome, limitations and transferable lessons.", "ri-file-chart-line", code="03", cta="Propose a Case Study", url="/information-session"),
            item("Research & Data Notes", "Short, focused publications presenting a dataset, model, statistical observation, survey, benchmark, method, research question or preliminary finding.", "ri-flask-line", code="04", cta="Propose a Research Note", url="/information-session"),
            item("Practice Guides", "Structured guidance, checklists, frameworks and briefing notes that help professionals apply sound project controls practice.", "ri-book-2-line", code="05", cta="Propose Practice Guidance", url="/information-session"),
            item("Interviews & Perspectives", "Edited interviews, roundtable summaries and clearly labelled professional viewpoints from Fellows, practitioners, employers, consultants, academics, students and community contributors.", "ri-discuss-line", code="06", cta="Propose an Interview", url="/information-session"),
        ],
    }
    content.themes = {
        "eyebrow": "Editorial themes",
        "title": "A publication programme shaped around the decisions that define project controls.",
        "description": "IPC welcomes proposals across sectors and project environments where the contribution is relevant, evidence-led and useful to the profession.",
        "items": [
            item("Planning, Baselines, Progress & Recovery", "Planning & Scheduling", "ri-calendar-check-line", topics=["Schedule quality and logic", "Critical path and float", "Progress measurement", "Recovery and scenario planning"]),
            item("Estimating, Cost Control & Forecasting", "Cost & Performance", "ri-money-pound-circle-line", topics=["Basis of estimate and uncertainty", "Budgets, actuals and commitments", "Earned value and productivity", "Forecast confidence and out-turn"]),
            item("Uncertainty, Change, Delay & Commercial Evidence", "Risk, Change & Claims", "ri-scales-3-line", topics=["Risk and opportunity integration", "Change impact and governance", "Delay analysis and records", "Claims avoidance and dispute support"]),
            item("Responsible AI, Analytics & Data Assurance", "AI & Digital Controls", "ri-robot-2-line", topics=["Automation and integrated systems", "Anomaly detection and scenarios", "AI verification and limitations", "Data privacy and human oversight"]),
            item("Carbon, Resources & Whole-Life Value", "Sustainability", "ri-leaf-line", topics=["Carbon-cost-time integration", "Sustainable sequencing", "Resource and environmental risk", "Lifecycle value and net zero"]),
            item("Governance, Assurance, Ethics & Capability", "Leadership & Profession", "ri-shield-star-line", topics=["Independent assurance", "Executive reporting and influence", "Professional conduct and integrity", "Careers, mentoring and competence"]),
        ],
    }
    content.formats = {
        "eyebrow": "Submission formats",
        "title": "Match the depth of the work to the needs of the audience.",
        "description": "The ranges below are practical starting points rather than rigid acceptance rules. Final guidance is confirmed during editorial discussion.",
        "columns": ["Format", "Typical purpose", "Indicative length", "Evidence expectation", "Primary audience"],
        "items": [
            {"format": "Professional magazine feature", "purpose": "Explain an issue, professional lesson, career story, interview, event insight or employer practice accessibly.", "length": "Approximately 800–1,500 words", "evidence": "Credible examples, references where needed and clear distinction between experience and general evidence.", "audience": "Members, professionals, employers and students"},
            {"format": "Technical article", "purpose": "Examine a project controls method, problem, comparison or applied technical issue in more depth.", "length": "Approximately 1,200–2,500 words", "evidence": "Method, assumptions, examples, limitations and relevant sources.", "audience": "Practitioners, consultants and technical leaders"},
            {"format": "Technical case study", "purpose": "Explain context, challenge, intervention, outcome and transferable learning from a real environment.", "length": "Approximately 1,500–3,000 words", "evidence": "Permission, evidence, metrics where available, limitations and confidentiality controls.", "audience": "Professionals, employers and educators"},
            {"format": "Research paper", "purpose": "Present original research, practitioner research, methodological analysis or academic-practice collaboration.", "length": "Approximately 3,000–7,000 words", "evidence": "Research question, literature, method, findings, limitations, ethics and references.", "audience": "Researchers, academics and advanced practitioners"},
            {"format": "Research or data note", "purpose": "Present a focused dataset, method, survey, model, benchmark or preliminary finding.", "length": "Approximately 1,000–2,000 words", "evidence": "Data source, method, assumptions, reproducibility and limitations.", "audience": "Researchers, analysts and practitioners"},
            {"format": "Student or emerging researcher paper", "purpose": "Convert a dissertation, assignment, apprenticeship project or early research contribution into a professional publication.", "length": "Approximately 1,500–3,500 words", "evidence": "Supervisor or author confirmation, sources, reflection, originality and professional relevance.", "audience": "Students, educators and employers"},
            {"format": "Practice guide or briefing", "purpose": "Provide a structured framework, checklist or explanation for practical use.", "length": "Length agreed by scope", "evidence": "Clear basis, scope, definitions, limitations and review by relevant specialists.", "audience": "Practitioners, teams and employers"},
        ],
    }
    content.audiences = {
        "eyebrow": "Who the programme serves",
        "title": "Audience Value Proposition",
        "description": "Each audience should understand why project controls publication matters and what value it can create.",
        "items": [
            {"audience": "Professionals", "value": "Thought leadership, professional visibility, structured reflection, evidence of contribution, CPD, awards and recognition pathway support.", "message": "Turn your experience into knowledge that strengthens your professional identity and helps others improve."},
            {"audience": "Employers", "value": "Capability visibility, case studies, workforce recognition, lessons learned, employer reputation and stronger controls culture.", "message": "Demonstrate how credible project controls creates decision and delivery value."},
            {"audience": "Universities and colleges", "value": "Research dissemination, student publication, dissertation conversion, academic-practice links, prizes and employability.", "message": "Connect project controls education and research with a professional audience and employer need."},
            {"audience": "Consultancies", "value": "Evidence-led thought leadership, specialist differentiation, consultant development, client learning and professional contribution.", "message": "Demonstrate expertise through useful evidence rather than promotional claims alone."},
            {"audience": "Sponsors and partners", "value": "Association with professional knowledge, research, education, innovation and public benefit, subject to editorial independence.", "message": "Support the development and sharing of trusted project controls knowledge."},
            {"audience": "Public sector and NGOs", "value": "Accessible guidance, transparency, public value, capability development, sustainability and evidence-based learning.", "message": "Share and apply project controls knowledge that improves governance and responsible delivery."},
        ],
    }
    content.principles = {
        "eyebrow": "Editorial values",
        "title": "Publication standards specific to project controls.",
        "description": "These values guide topic selection, author review, research, editing, sponsorship, corrections and professional conduct.",
        "items": [
            item("Evidence before assertion", "Claims should be supported by credible data, transparent assumptions, relevant sources or clearly identified experience.", "ri-file-search-line"),
            item("Statistical discipline", "Forecasts, samples and comparisons should recognise uncertainty, probability, confidence, variation and limitations.", "ri-bar-chart-grouped-line"),
            item("Data validity", "Authors should explain the source, coding, baseline, quality, completeness and governance of data used.", "ri-database-2-line"),
            item("Professional judgement", "Methods and tools support conclusions, but named authors remain accountable for interpretation and recommendations.", "ri-user-star-line"),
            item("Responsible AI", "AI use should be disclosed, verified and governed without fabricating evidence, references, data or authorship.", "ri-robot-2-line"),
            item("Sustainable outcomes", "Relevant work should consider carbon, resources, lifecycle value and responsible delivery rather than cost and time in isolation.", "ri-leaf-line"),
            item("Assurance and integrity", "Limitations, contradictory evidence, conflicts and material uncertainty should not be hidden.", "ri-shield-check-line"),
            item("Employer relevance", "Content should help organisations build capability, improve controls practice or make better project decisions.", "ri-building-line"),
            item("Professional recognition", "Publication should help contributors demonstrate credible professional service and knowledge sharing.", "ri-award-line"),
        ],
    }
    content.integrity = {
        "eyebrow": "Responsible AI and research integrity",
        "title": "Technology can support writing and analysis, but it cannot replace author accountability.",
        "description": "Contributors remain responsible for accuracy, originality, permissions, confidentiality, references, data and every conclusion submitted under their name.",
        "items": [
            item("Originality and attribution", "Sources, quotations, images, data, methods and prior work should be credited accurately.", "ri-double-quotes-l", code="01"),
            item("Authorship and contribution", "Named authors should have made a meaningful contribution and accept responsibility for the published work.", "ri-user-star-line", code="02"),
            item("Conflicts and sponsorship", "Employment, commercial relationships, funding, product interests and other relevant conflicts should be disclosed.", "ri-scales-3-line", code="03"),
            item("Permissions and confidentiality", "Authors must obtain permission to use employer, client, project, personal, academic or copyrighted material.", "ri-lock-line", code="04"),
            item("Data and research ethics", "Research involving people, personal data, confidential records or sensitive contexts should follow appropriate requirements.", "ri-database-2-line", code="05"),
            item("Corrections and withdrawal", "Material errors may require correction, clarification, withdrawal or retraction depending on seriousness and impact.", "ri-error-warning-line", code="06"),
        ],
        "protocol_title": "AI may assist. Human authors remain accountable.",
        "protocol_items": [
            "Disclose material AI assistance.",
            "Verify facts, calculations and references independently.",
            "Do not list an AI system as an author.",
            "Do not upload confidential data to unapproved public tools.",
            "Do not use AI to fabricate evidence, quotations or sources.",
            "Check bias, omissions and misleading certainty.",
            "Retain human control over interpretation and conclusions.",
        ],
        "protocol_note": "The editor may request an explanation of how AI was used and may reject material where its use undermines accuracy, originality, confidentiality or professional trust.",
    }
    content.process = {
        "eyebrow": "Editorial and review process",
        "title": "A clear route from idea to responsible publication.",
        "description": "During the launch phase, proposals and submissions are handled through the information-session route. The review route depends on the type, depth and risk of the material.",
        "items": [
            item("Propose the idea", "Send a title, summary, intended audience, publication route, evidence basis and explanation of professional relevance.", code="01"),
            item("Editorial scope review", "IPC considers relevance, originality, quality, duplication, risk, permissions, format and fit with the publication programme.", code="02"),
            item("Prepare or submit the manuscript", "Follow the agreed format and include author details, references, declarations, images, data notes and permissions.", code="03"),
            item("Technical or editorial review", "Material may receive editorial review, specialist review, academic review or a combination.", code="04"),
            item("Revision and author response", "Authors may be asked to clarify evidence, strengthen analysis, reduce promotional language or correct claims.", code="05"),
            item("Editorial decision", "A submission may be accepted, accepted subject to revision, redirected, deferred or declined.", code="06"),
            item("Editing, proof and approval", "Accepted work is edited for clarity and consistency. Authors may be asked to approve a final proof.", code="07"),
            item("Publication and professional engagement", "Published work may connect to events, awards, member profiles, academic discussion or follow-up learning.", code="08"),
        ],
        "checklist_title": "Include these details.",
        "checklist": ["Proposed title", "Publication route or preferred format", "150–300 word summary or abstract", "Target professional audience", "Evidence, data or research basis", "Key learning or contribution", "Author name, role and organisation", "Short biography and LinkedIn profile", "Conflicts, funding or sponsorship", "AI assistance disclosure", "Permissions or confidentiality restrictions", "Whether the work has appeared elsewhere"],
        "cta_label": "Start a Publication Proposal",
        "cta_url": "/information-session",
    }
    content.contributor_value = {
        "eyebrow": "Contributor value",
        "title": "Publication can strengthen professional identity and contribution.",
        "description": "Acceptance is based on editorial quality and relevance, not on membership, employer size, sponsorship or seniority alone.",
        "items": [
            item("Professional visibility", "Build a visible record of evidence-led contribution beyond a job title or project assignment.", "ri-eye-line"),
            item("LinkedIn and biography value", "Reference approved publications in professional profiles, speaker biographies and consultant credentials.", "ri-linkedin-box-line"),
            item("Membership evidence", "Publication may support a separate professional recognition application where it demonstrates relevant contribution.", "ri-medal-line"),
            item("Speaking opportunities", "Selected contributors may be invited to discuss their work at an event, roundtable or regional club.", "ri-mic-line"),
            item("Awards and prizes", "Eligible work may support nomination for academic, professional or thought-leadership recognition.", "ri-award-line"),
            item("Professional reflection", "The editorial process helps authors test assumptions, clarify evidence and make lessons transferable.", "ri-lightbulb-line"),
            item("Academic-practice connection", "Bring research to practitioners or convert professional experience into structured evidence and research questions.", "ri-graduation-cap-line"),
            item("Contribution to the profession", "Help improve project controls capability, standards, education and responsible decision-making.", "ri-community-line"),
        ],
        "note_title": "Publication is not automatic professional recognition",
        "note": "Publication can provide evidence of professional contribution, but it does not automatically grant membership, Associate Fellowship, Fellowship, an award or academic status.",
    }
    content.partner_value = {
        "eyebrow": "Value for organisations",
        "title": "Benefits for employers, consultancies and academic partners.",
        "description": "The publication programme creates a bridge between workforce capability, research, professional learning and visible contribution.",
        "items": [
            item("Employers", "Turn project learning into organisational knowledge.", "ri-building-line", bullets=["Recognise staff expertise and professional service", "Share anonymised lessons and improvement stories", "Strengthen controls culture and knowledge retention", "Create credible case studies for capability development", "Connect publication with events, awards and CPD"]),
            item("Consultancies", "Demonstrate expertise through useful evidence.", "ri-briefcase-4-line", bullets=["Develop consultants as authors and speakers", "Publish technical insight without disguised sales content", "Strengthen professional and client-facing profiles", "Create research and case-study partnerships", "Connect thought leadership with recognition pathways"]),
            item("Academic partners", "Connect research, students and professional practice.", "ri-graduation-cap-line", bullets=["Disseminate applied research to practitioners", "Convert dissertations into professional papers", "Create student writing and research prizes", "Develop employer-connected research questions", "Build guest lectures, events and journal collaboration"]),
        ],
        "cta_label": "Discuss Publication Partnership",
        "cta_url": "/information-session",
    }
    content.sponsorship = {
        "eyebrow": "Publication sponsorship",
        "title": "Support knowledge without purchasing editorial conclusions.",
        "description": "Employers, consultancies, universities, training providers and partners can support the professional magazine, academic papers, research, student writing, technical series and publication access.",
        "body": "Sponsorship is acknowledged transparently and remains separate from editorial acceptance, review, author conclusions, awards and professional recognition.",
        "primary_cta_label": "Explore Publication Sponsorship",
        "primary_cta_url": "/sponsorship",
        "secondary_cta_label": "Discuss Sponsorship",
        "secondary_cta_url": "/information-session",
        "items": [
            item("Magazine programme", "Support professional articles, interviews and member learning.", "ri-newspaper-line"),
            item("Academic papers", "Support calls for papers, review activity and research access.", "ri-graduation-cap-line"),
            item("Technical series", "Support focused knowledge on AI, data, risk or sustainability.", "ri-book-2-line"),
            item("Student writing prize", "Help emerging researchers convert learning into publication.", "ri-award-line"),
        ],
    }
    content.faq = {
        "eyebrow": "Frequently asked questions",
        "title": "Questions about submissions, review, AI and publication.",
        "description": "Clear answers for authors, researchers, organisations and partners.",
        "items": [
            {"question": "Do I need to be an IPC member to submit?", "answer": "Not necessarily. IPC may consider relevant submissions from members, non-members, employers, consultants, academics, students and professional partners."},
            {"question": "Is the IPC academic journal already formally launched?", "answer": "The Institute is developing a staged publication programme. Formal journal arrangements, peer-review procedures, issue dates, indexing or ISSN details should only be described as active after formal announcement."},
            {"question": "Does submission guarantee publication?", "answer": "No. Every proposal remains subject to scope, quality, evidence, originality, permissions, editorial capacity, professional conduct and written acceptance."},
            {"question": "Can I submit an article that has appeared elsewhere?", "answer": "Tell IPC where and how it has appeared. Republishing, adaptation or reuse depends on copyright, permissions, exclusivity, originality and editorial value."},
            {"question": "Can confidential project material be used?", "answer": "Only where the author has appropriate permission and can protect confidential, personal, contractual and commercially sensitive information."},
            {"question": "Can AI be used when preparing a submission?", "answer": "AI assistance may be used responsibly, but material use should be disclosed. Authors must verify facts, references and analysis, protect confidential data and remain accountable."},
            {"question": "Can a company submit a promotional article?", "answer": "Product or service promotion alone is not the purpose. Commercial contributors should provide useful, evidence-led learning and disclose relevant interests."},
            {"question": "Can students submit dissertations or assignments?", "answer": "Yes. Students may propose an adapted paper, article, research note or dissertation summary that is original, properly referenced and suitable for professional publication."},
            {"question": "Will all academic papers be peer reviewed?", "answer": "The review route depends on the publication format and formal arrangements in place. IPC should not describe a paper as peer reviewed unless the relevant process has been completed."},
            {"question": "Who owns the copyright?", "answer": "Copyright and licence terms should be confirmed before publication. Authors must disclose employer, funder, publisher or third-party rights."},
            {"question": "Can publications support Fellowship evidence?", "answer": "A relevant publication may demonstrate professional contribution within a separate recognition application. It does not automatically grant Fellowship."},
            {"question": "Can an organisation sponsor a publication series?", "answer": "Yes. Sponsorship may support a magazine issue, technical series, student prize, research programme or publication access. Editorial decisions remain independent."},
        ],
    }
    content.final_cta = {
        "eyebrow": "Contribute professional knowledge",
        "title": "Turn evidence, research and experience into knowledge the profession can use.",
        "description": "Propose a professional article, technical case study, academic paper, research note, interview or practice guide and help build a stronger evidence base for project controls.",
        "primary_cta_label": "Submit a Publication Proposal",
        "primary_cta_url": "/information-session",
        "secondary_cta_label": "Discuss Academic Partnership",
        "secondary_cta_url": "/information-session",
        "tertiary_cta_label": "Sponsor Publications",
        "tertiary_cta_url": "/sponsorship",
        "address": "39 Maidstone Innovation Centre, Maidstone, Kent, ME14 5FY",
        "email": "office@instituteofprojectcontrols.org",
    }
    content.seo = {
        "title": "Project Controls Publications, Research & Professional Knowledge",
        "description": "Contribute professional magazine articles, technical case studies, academic papers, research notes and practice guidance through the Institute of Project Controls.",
        "canonical_path": "/publications",
        "noindex": False,
        "nofollow": False,
    }
    content.save()


PUBLICATION_FIELDS = [
    "why_publish",
    "themes",
    "formats",
    "audiences",
    "integrity",
    "contributor_value",
    "partner_value",
    "sponsorship",
]


class Migration(migrations.Migration):
    dependencies = [("institutional", "0002_seed_institutional_content")]
    operations = [
        *[
            migrations.AddField(
                model_name="publicationcontent",
                name=name,
                field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section]),
            )
            for name in PUBLICATION_FIELDS
        ],
        migrations.RunPython(sync_preview_18_content, migrations.RunPython.noop),
    ]
