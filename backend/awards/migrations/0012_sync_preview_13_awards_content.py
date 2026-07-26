from django.db import migrations
from django.utils.text import slugify


HERO = {
    "eyebrow": "Awards & Prizes",
    "title": "Recognising excellence that advances project controls.",
    "description": (
        "The Institute of Project Controls Awards & Prizes celebrate the "
        "professionals, students, researchers, teams, employers, consultants "
        "and projects that strengthen project controls practice and improve "
        "project delivery."
    ),
    "secondary_description": (
        "Recognition is available across academic achievement, commercial "
        "impact, professional contribution and special areas of service. "
        "Entries should demonstrate evidence, integrity, measurable value, "
        "technical quality and a contribution that others in the profession "
        "can learn from."
    ),
    "primary_cta_label": "Nominate by Email",
    "primary_cta_url": "#awards-interest",
    "secondary_cta_label": "Sponsor an Award",
    "secondary_cta_url": "/information-session",
    "tertiary_cta_label": "Explore Award Categories",
    "tertiary_cta_url": "#award-families",
    "image_url": (
        "https://readdy.ai/api/search-image?query=Close%20up%20of%20an%20"
        "elegant%20golden%20trophy%20and%20framed%20certificate%20on%20a%20"
        "dark%20polished%20wooden%20podium%2C%20soft%20dramatic%20spotlight"
        "%20from%20above%2C%20deep%20charcoal%20backdrop%2C%20premium%20"
        "awards%20ceremony%20atmosphere&width=1600&height=900&orientation=landscape"
    ),
    "image_alt": "Prestigious project controls award and certificate",
    "highlights": [
        {
            "title": "Four award families",
            "description": "Academic, Commercial, Professional and Special Recognition.",
        },
        {
            "title": "Quarterly recognition",
            "description": (
                "Regular opportunities to recognise current achievement and "
                "emerging contribution."
            ),
        },
        {
            "title": "Annual honours",
            "description": (
                "A future annual programme can bring together leading entries, "
                "winners, partners and Fellows."
            ),
        },
    ],
}


BENEFITS_INTRO = {
    "eyebrow": "Why recognition matters",
    "title": "Important project controls achievement is often hidden inside project reports.",
    "description": (
        "The best project controls work can prevent loss, improve decisions, "
        "protect delivery dates, increase forecast confidence, strengthen "
        "governance and help projects recover — but the people behind that "
        "work are not always publicly recognised."
    ),
    "secondary_description": (
        "The Institute Awards & Prizes provide a professional platform for "
        "making that contribution visible. They allow an employer to recognise "
        "a high-performing team, a university to celebrate outstanding "
        "research, a client to acknowledge an innovative solution and the "
        "profession to honour individuals who lead, mentor, challenge, "
        "communicate and improve practice."
    ),
    "tertiary_description": (
        "Recognition should be more than popularity or senior job title. The "
        "Institute looks for evidence of technical quality, professional "
        "impact, ethical conduct, knowledge sharing, innovation, "
        "sustainability, leadership and measurable improvement."
    ),
    "closing_description": (
        "A smaller project, early-career professional, regional team or "
        "independent consultant can be as deserving as a major organisation "
        "where the evidence is strong and the contribution is clear."
    ),
}


IMPACT_BENEFITS = [
    {
        "icon": "ri-eye-line",
        "title": "Make achievement visible",
        "description": (
            "Bring important planning, cost, risk, change and reporting "
            "contributions out of project reports and into professional view."
        ),
    },
    {
        "icon": "ri-file-shield-2-line",
        "title": "Put evidence before profile",
        "description": (
            "Recognise credible methods, measurable outcomes, integrity and "
            "learning value rather than popularity or seniority alone."
        ),
    },
    {
        "icon": "ri-scales-3-line",
        "title": "Recognise excellence fairly",
        "description": (
            "Give smaller projects, regional teams, emerging professionals and "
            "independent consultants a credible route to distinction."
        ),
    },
    {
        "icon": "ri-book-open-line",
        "title": "Share professional learning",
        "description": (
            "Turn strong research and delivery practice into examples that "
            "employers, learners and the wider profession can use."
        ),
    },
]


FRAMEWORK_INTRO = {
    "eyebrow": "Awards programme model",
    "title": "Quarterly recognition with a future annual honours programme.",
    "description": (
        "The Institute can recognise achievement regularly through the Project "
        "Control Quarterly Awards while building towards a prestigious annual "
        "awards and prizes programme."
    ),
    "programme_items": [
        {
            "eyebrow": "Throughout the year",
            "title": "Project Control Quarterly Awards",
            "description": (
                "Quarterly recognition allows the Institute to respond to "
                "current practice, recognise emerging professionals, publish "
                "case studies and maintain engagement across members, "
                "employers, universities, clubs and sponsors."
            ),
        },
        {
            "eyebrow": "Annual recognition",
            "title": "Institute Awards & Prizes Honours",
            "description": (
                "The annual programme can bring together leading quarterly "
                "entries, major professional achievements, student prizes, "
                "commercial awards, Lifetime Contribution recognition and "
                "Fellowship excellence."
            ),
        },
    ],
    "families_eyebrow": "Award families",
    "families_title": "Four routes to recognise different forms of excellence.",
    "families_description": (
        "The categories recognise research, workplace achievement, "
        "professional leadership and wider contribution to project controls "
        "and society."
    ),
}


FEATURED_INTRO = {
    "eyebrow": "Award categories",
    "title": "Explore academic, commercial, professional and special recognition awards.",
    "description": (
        "Choose an award family to review its active categories, purpose, "
        "evidence emphasis and suitable nomination routes."
    ),
    "image_url": (
        "https://readdy.ai/api/search-image?query=Elegant%20awards%20ceremony%20"
        "stage%20with%20golden%20spotlights%2C%20polished%20trophies%20on%20"
        "a%20dark%20podium%2C%20premium%20professional%20event&width=700"
        "&height=900&orientation=portrait"
    ),
    "image_alt": "Professional awards ceremony stage",
    "quarterly_eyebrow": "Project Control Quarterly Awards",
    "quarterly_title": "A year-round rhythm of recognition and professional learning.",
    "quarterly_description": (
        "Quarterly themes allow the Institute to highlight different areas of "
        "the profession while publishing current examples of strong practice."
    ),
    "quarterly_supporting_copy": (
        "Themes may be adapted to reflect sector priorities, Institute events, "
        "partner activity and the quality of nominations received."
    ),
    "quarterly_items": [
        {
            "title": "Quarter 1",
            "description": (
                "Data integrity, AI, digital innovation, reporting and project "
                "controls technology."
            ),
        },
        {
            "title": "Quarter 2",
            "description": (
                "Planning, scheduling, cost engineering, estimating, "
                "forecasting and performance."
            ),
        },
        {
            "title": "Quarter 3",
            "description": (
                "Risk, opportunity, change, commercial management, claims and assurance."
            ),
        },
        {
            "title": "Quarter 4",
            "description": (
                "Leadership, mentoring, research, sustainability, social "
                "impact and professional contribution."
            ),
        },
    ],
}


BENEFICIARIES_INTRO = {
    "eyebrow": "Who can enter or be nominated",
    "title": "Awards are designed for the full project controls ecosystem.",
    "description": (
        "Eligibility depends on the category. Some awards may be open widely, "
        "while selected member or Fellowship awards may require current IPC status."
    ),
}


BENEFICIARIES = [
    {
        "title": "Individuals",
        "description": (
            "Professionals, emerging talent, consultants, mentors, educators, "
            "researchers, volunteers and senior leaders."
        ),
    },
    {
        "title": "Teams",
        "description": (
            "Project controls, planning, cost, PMO, risk, change, reporting, "
            "data, commercial and integrated delivery teams."
        ),
    },
    {
        "title": "Projects and programmes",
        "description": (
            "Construction, infrastructure, energy, rail, aviation, defence, "
            "technology and public-sector environments."
        ),
    },
    {
        "title": "Employers and clients",
        "description": (
            "Public, private and third-sector organisations demonstrating "
            "capability or workforce development."
        ),
    },
    {
        "title": "Consultancies and SMEs",
        "description": (
            "Large consultancies, specialist practices, small businesses, "
            "independent consultants and self-employed professionals."
        ),
    },
    {
        "title": "Academic partners",
        "description": (
            "Students, universities, colleges, supervisors, researchers and "
            "academic-industry collaborations."
        ),
    },
]


TIMELINE_INTRO = {
    "eyebrow": "Nomination and submission process",
    "title": "A clear email process for the launch phase.",
    "description": (
        "Individuals may nominate themselves where the category allows it. "
        "Employers, clients, academic supervisors, colleagues and professional "
        "peers may also submit nominations."
    ),
    "checklist_title": "What to include",
    "checklist": [
        "Award category and nominee name",
        "Nominee role and organisation",
        "Nominator name and relationship",
        "500–1,500 word nomination statement",
        "Challenge, contribution and result",
        "Evidence of professional impact",
        "References where appropriate",
        "Confidentiality restrictions",
        "Confirmation that information is accurate",
    ],
    "cta_label": "Nominate by Email",
    "cta_url": "#awards-interest",
}


NOMINATION_TIMELINE = [
    {
        "phase": "Select the category",
        "period": "01",
        "description": "Review the category purpose, eligibility and evidence emphasis.",
    },
    {
        "phase": "Obtain permission",
        "period": "02",
        "description": (
            "A person, employer, client, university or project should not be "
            "publicly named without appropriate permission."
        ),
    },
    {
        "phase": "Prepare the nomination statement",
        "period": "03",
        "description": (
            "Explain the context, challenge, contribution, method, result and "
            "professional value."
        ),
    },
    {
        "phase": "Attach supporting evidence",
        "period": "04",
        "description": (
            "Evidence may include metrics, reports, references, testimonials, "
            "publications, project outputs or academic papers."
        ),
    },
    {
        "phase": "Email the Institute",
        "period": "05",
        "description": (
            "Send the entry to office@instituteofprojectcontrols.org with the "
            "category name in the subject line."
        ),
    },
    {
        "phase": "Review and outcome",
        "period": "06",
        "description": (
            "The Institute may request clarification or verification before "
            "judging and public announcement."
        ),
    },
]


INTEGRITY_INTRO = {
    "eyebrow": "Judging framework",
    "title": "Strong evidence matters more than promotional language.",
    "description": (
        "Entries should explain what happened, what the nominee contributed, "
        "what changed and how the outcome can be evidenced."
    ),
    "criteria_title": "General assessment weighting",
    "criteria": [
        {"title": "Professional or organisational impact", "weight": 20},
        {"title": "Technical quality and credibility", "weight": 20},
        {"title": "Evidence of achievement", "weight": 15},
        {"title": "Innovation or improvement", "weight": 10},
        {"title": "Leadership and collaboration", "weight": 10},
        {"title": "Integrity and data reliability", "weight": 10},
        {"title": "Sustainability or social value", "weight": 10},
        {"title": "Knowledge sharing and learning value", "weight": 5},
    ],
    "checklist_title": "Credible entries are specific and transparent.",
    "checklist": [
        "The challenge is explained clearly.",
        "The nominee's contribution is identifiable.",
        "The project controls method is credible.",
        "Outcomes are supported by evidence.",
        "Assumptions and limitations are acknowledged.",
        "Confidential information is protected.",
        "The entry offers learning value to others.",
    ],
    "governance_eyebrow": "Judging integrity",
    "governance_title": (
        "Sponsorship supports the programme but must not determine outcomes."
    ),
    "governance_description": (
        "Award credibility depends on transparent criteria, appropriate "
        "judges, confidentiality and management of conflicts of interest."
    ),
}


INTEGRITY_PRINCIPLES = [
    {
        "icon": "ri-scales-3-line",
        "title": "Independent judgement",
        "description": (
            "Entries should be assessed against criteria rather than "
            "reputation, organisation size, sponsorship or familiarity."
        ),
    },
    {
        "icon": "ri-shield-user-line",
        "title": "Conflict management",
        "description": (
            "Judges should declare relevant interests and withdraw where "
            "impartiality may be affected."
        ),
    },
    {
        "icon": "ri-lock-2-line",
        "title": "Confidentiality",
        "description": (
            "Commercial, personal, academic and project information should be "
            "shared only where necessary for review."
        ),
    },
    {
        "icon": "ri-checkbox-circle-line",
        "title": "Verification",
        "description": (
            "The Institute may verify references, data, permission or public "
            "claims before confirming recognition."
        ),
    },
    {
        "icon": "ri-award-line",
        "title": "Award discretion",
        "description": (
            "The Institute may combine, defer or withhold an award where the "
            "expected standard is not met."
        ),
    },
    {
        "icon": "ri-hand-coin-line",
        "title": "Sponsor separation",
        "description": (
            "Sponsorship does not guarantee influence over eligibility, "
            "judging, finalists or winners."
        ),
    },
]


RECOGNITION_INTRO = {
    "eyebrow": "Recognition value",
    "title": "What finalists and winners may gain.",
    "description": (
        "Recognition should create professional visibility, learning and "
        "reputation while remaining proportionate to the category and programme year."
    ),
}


RECOGNITION_BENEFITS = [
    {
        "title": "Certificate or award",
        "description": "Formal recognition of finalist, commendation or winner status.",
    },
    {
        "title": "Digital recognition",
        "description": (
            "Approved badge, winner wording or social recognition where available."
        ),
    },
    {
        "title": "Website profile",
        "description": (
            "Publication of the achievement, subject to consent and confidentiality."
        ),
    },
    {
        "title": "Magazine feature",
        "description": (
            "Potential interview, case study, research summary or awards feature."
        ),
    },
    {
        "title": "Event recognition",
        "description": (
            "Invitation to a relevant Institute event or recognition session."
        ),
    },
    {
        "title": "Speaking opportunity",
        "description": "Selected winners may be invited to present their work.",
    },
    {
        "title": "LinkedIn and CV value",
        "description": (
            "Approved award wording can strengthen profiles and biographies."
        ),
    },
    {
        "title": "Professional progression",
        "description": (
            "Award evidence may support future professional development discussions."
        ),
    },
]


PARTNERSHIPS_INTRO = {
    "eyebrow": "Wider value",
    "title": "Benefits for employers, consultancies and academic partners.",
    "description": (
        "A strong awards programme recognises individuals while helping "
        "organisations demonstrate capability, learning culture and "
        "professional contribution."
    ),
    "disclaimer": (
        "Sponsorship packages should be agreed separately from judging. The "
        "Institute retains responsibility for criteria, eligibility, panel "
        "appointments and outcomes."
    ),
    "sponsorship_eyebrow": "Awards sponsorship",
    "sponsorship_title": (
        "Support recognition without compromising independence."
    ),
    "sponsorship_description": (
        "Employers, consultancies, recruitment companies, universities, "
        "training providers, NGOs and corporate sponsors can support award "
        "categories, events, publications and winner development."
    ),
    "sponsorship_cta_label": "Sponsor an Award",
    "sponsorship_cta_url": "/information-session",
    "sponsorship_items": [
        {
            "title": "Sponsor a category",
            "description": (
                "Support one academic, commercial, professional or special award."
            ),
        },
        {
            "title": "Sponsor quarterly awards",
            "description": (
                "Support regular recognition and case-study publication."
            ),
        },
        {
            "title": "Sponsor annual honours",
            "description": "Support a future ceremony, event or publication.",
        },
        {
            "title": "Sponsor winner development",
            "description": (
                "Support master classes, mentoring, publication or speaking."
            ),
        },
    ],
}


PARTNERSHIPS = [
    {
        "title": "Employers",
        "description": "Celebrate teams and strengthen capability.",
        "items": [
            "Recognise staff achievement and improve retention.",
            "Show clients a strong project controls culture.",
            "Create case studies for bids and capability statements.",
            "Benchmark internal practice against award criteria.",
            "Support emerging talent, mentors and leaders.",
        ],
        "cta_label": "Sponsor an Award",
        "cta_url": "/information-session",
    },
    {
        "title": "Consultancies",
        "description": "Demonstrate specialist client value.",
        "items": [
            "Show evidence of innovation and professional impact.",
            "Differentiate consultant and team profiles.",
            "Create credible thought-leadership material.",
            "Strengthen tender CVs and client presentations.",
            "Recognise SMEs and independent consultants fairly.",
        ],
        "cta_label": "Sponsor an Award",
        "cta_url": "/information-session",
    },
    {
        "title": "Academic partners",
        "description": "Connect research with professional visibility.",
        "items": [
            "Celebrate dissertations and student contribution.",
            "Strengthen employer and practitioner engagement.",
            "Create publication and presentation opportunities.",
            "Demonstrate programme quality and learner impact.",
            "Build academic-practice partnerships.",
        ],
        "cta_label": "Sponsor an Award",
        "cta_url": "/information-session",
    },
]


FAQ = {
    "eyebrow": "Frequently asked questions",
    "title": "Questions about nominations, evidence and recognition.",
    "description": (
        "Clear guidance for entrants, nominees, employers, universities and sponsors."
    ),
    "items": [
        {
            "question": "Do I need to be an IPC member to enter?",
            "answer": (
                "Not for every category. Many academic, commercial and open "
                "professional awards may accept eligible non-members. Selected "
                "member, Fellow or Institute service awards may require active membership."
            ),
        },
        {
            "question": "Can I nominate myself?",
            "answer": (
                "Self-nomination may be accepted where the category permits it. "
                "Lifetime Contribution and similar honours may be more "
                "appropriately nominated by another person or organisation."
            ),
        },
        {
            "question": "Can a team enter more than one category?",
            "answer": (
                "A team may be eligible for more than one category, but each "
                "entry should be tailored to the relevant criteria."
            ),
        },
        {
            "question": "Can confidential projects be entered?",
            "answer": (
                "Yes, where the entrant has permission and can provide "
                "sufficient anonymised evidence. Private verification may be requested."
            ),
        },
        {
            "question": "What makes a strong nomination?",
            "answer": (
                "A strong nomination explains the challenge, contribution, "
                "method, outcome, supporting evidence and why the achievement matters."
            ),
        },
        {
            "question": "Are awards guaranteed in every category?",
            "answer": (
                "No. The Institute may withhold, combine, defer or amend a "
                "category where entry quality or programme conditions require it."
            ),
        },
        {
            "question": "Can sponsors select the winner?",
            "answer": (
                "No. Sponsors may support an award, but judging and final "
                "decisions remain independent."
            ),
        },
        {
            "question": "Does winning an award make someone a Fellow?",
            "answer": (
                "No. Awards recognise achievement. Fellowship is a separate "
                "competence and professional recognition route."
            ),
        },
        {
            "question": "Can universities submit student work?",
            "answer": (
                "Yes, with the student's permission and in accordance with the "
                "relevant academic award rules."
            ),
        },
        {
            "question": "How are winners announced?",
            "answer": (
                "Winners may be announced through the Institute website, "
                "professional magazine, email, social channels, events, "
                "quarterly recognition sessions or a future annual honours programme."
            ),
        },
    ],
}


INTEREST_INTRO = {
    "eyebrow": "Nominate",
    "title": "Tell the Institute about work that deserves recognition.",
    "description": (
        "Choose the relevant award programme and provide the nominee, "
        "organisation, contribution and evidence you want the Institute to review."
    ),
    "secondary_cta_label": "Book an information session",
    "secondary_cta_url": "/information-session",
}


FINAL_CTA = {
    "eyebrow": "Recognise excellence",
    "title": "Nominate work that deserves to be seen, shared and celebrated.",
    "description": (
        "Submit a professional, academic, commercial or special recognition "
        "nomination and help the Institute build a visible record of excellence "
        "across project controls."
    ),
    "cta_label": "Nominate by Email",
    "cta_url": "#awards-interest",
    "secondary_cta_label": "Sponsor an Award",
    "secondary_cta_url": "/information-session",
    "items": [
        {
            "title": "Academic awards",
            "description": "Research, dissertation and education routes",
        },
        {
            "title": "Commercial awards",
            "description": "Teams, organisations and delivery impact",
        },
        {
            "title": "Professional awards",
            "description": "Competence, leadership and contribution",
        },
        {
            "title": "Special recognition",
            "description": "Integrity, inclusion, service and social impact",
        },
    ],
}


SEO = {
    "title": "Project Controls Awards & Prizes",
    "description": (
        "Nominate professionals, teams, employers, consultants, students, "
        "researchers and academic partners for Institute of Project Controls "
        "academic, commercial, professional and special recognition awards."
    ),
    "canonical_path": "/awards",
    "noindex": False,
    "nofollow": False,
}


CATEGORY_DATA = [
    {
        "slug": "academic",
        "title": "Academic Awards & Prizes",
        "description": (
            "Recognising students, researchers, academics and education partners "
            "who create useful, original and professionally relevant project "
            "controls knowledge."
        ),
        "image_url": (
            "https://readdy.ai/api/search-image?query=University%20graduation%20"
            "ceremony%20with%20academic%20regalia%20and%20award%20certificate%2C"
            "%20warm%20golden%20lighting&width=500&height=350&orientation=landscape"
        ),
        "icon_class": "ri-graduation-cap-line",
        "highlights": [
            "Students and apprentices",
            "Undergraduate and postgraduate researchers",
            "Universities and colleges",
            "Academic-practice partnerships",
            "Applied research and dissertation work",
        ],
        "sort_order": 10,
    },
    {
        "slug": "commercial",
        "title": "Commercial & Organisational Awards",
        "description": (
            "Recognising teams, projects, employers and consultancies that use "
            "project controls to create measurable delivery, commercial, "
            "social or environmental value."
        ),
        "image_url": (
            "https://readdy.ai/api/search-image?query=Professional%20project%20"
            "team%20receiving%20an%20award%20on%20stage%2C%20modern%20corporate"
            "%20ceremony%2C%20warm%20golden%20lighting&width=500&height=350"
            "&orientation=landscape"
        ),
        "icon_class": "ri-building-2-line",
        "highlights": [
            "Project and programme teams",
            "Employers and clients",
            "Consultancies and SMEs",
            "Public-sector organisations",
            "Planning, cost, risk and data functions",
        ],
        "sort_order": 20,
    },
    {
        "slug": "professional",
        "title": "Professional Awards",
        "description": (
            "Recognising individuals whose competence, conduct, leadership, "
            "service and professional impact strengthen project controls practice."
        ),
        "image_url": (
            "https://readdy.ai/api/search-image?query=Individual%20professional%20"
            "receiving%20a%20prestigious%20award%20certificate%2C%20gold%20"
            "trophy%2C%20refined%20corporate%20ceremony&width=500&height=350"
            "&orientation=landscape"
        ),
        "icon_class": "ri-user-star-line",
        "highlights": [
            "Practitioners and emerging professionals",
            "Specialists and consultants",
            "Managers and leaders",
            "Mentors and Fellows",
            "Professionals from all project sectors",
        ],
        "sort_order": 30,
    },
    {
        "slug": "special",
        "title": "Special Recognition Awards",
        "description": (
            "Recognising service, integrity, inclusion, social impact, "
            "transition, international contribution and activity that "
            "strengthens the profession beyond technical delivery alone."
        ),
        "image_url": (
            "https://readdy.ai/api/search-image?query=Elegant%20gold%20award%20"
            "trophy%20for%20community%20service%20and%20professional%20"
            "recognition%2C%20dark%20ceremony%20stage&width=500&height=350"
            "&orientation=landscape"
        ),
        "icon_class": "ri-award-line",
        "highlights": [
            "Professional integrity",
            "Community and social impact",
            "Career access and transition",
            "International contribution",
            "Regional and Institute service",
        ],
        "sort_order": 40,
    },
]


AWARDS = [
    ("A01", "academic", "Best Project Controls Dissertation Prize", "Recognises an outstanding dissertation addressing a relevant project controls challenge through strong research, analysis, professional relevance and clear conclusions.", "Suitable for", "Undergraduate, postgraduate, apprenticeship or professional programme dissertations."),
    ("A02", "academic", "Best Student Research Paper in Project Controls", "Rewards a well-evidenced paper contributing insight into planning, cost, risk, change, data, commercial practice, sustainability or performance.", "Suitable for", "Individual students or student teams supported by an academic supervisor."),
    ("A03", "academic", "Emerging Project Controls Researcher Award", "Recognises an early-stage researcher demonstrating originality, intellectual curiosity, professional relevance and future potential.", "Suitable for", "Early-career academics, doctoral researchers, graduates and practitioner-researchers."),
    ("A04", "academic", "Project Data Analytics Research Prize", "Recognises research improving data, forecasting, dashboards, assurance, performance measurement, visualisation or advanced analytics.", "Evidence emphasis", "Data validity, methodology, interpretation, limitations and decision value."),
    ("A05", "academic", "AI and Digital Project Controls Research Prize", "Rewards responsible research into AI, automation, BIM-related information, digital twins, predictive methods or integrated controls systems.", "Judging principle", "Technology should improve judgement, assurance or delivery rather than add unnecessary complexity."),
    ("A06", "academic", "Sustainability and Net Zero Research Prize", "Recognises research connecting project controls with carbon reduction, resource efficiency, environmental performance, sustainable scheduling or whole-life value.", "Suitable evidence", "Models, case studies, carbon-cost-time analysis or applied recommendations."),
    ("A07", "academic", "Academic Contribution to Project Controls Award", "Recognises an educator or academic whose teaching, research, supervision, publications or employer engagement has materially strengthened project controls learning.", "Suitable for", "Lecturers, programme leaders, supervisors, researchers and academic mentors."),
    ("A08", "academic", "Best University or College Project Controls Programme", "Recognises a programme demonstrating curriculum relevance, learner support, employer connection, applied assessment and career progression.", "Evidence emphasis", "Outcomes, employer engagement, curriculum design, inclusion and learner impact."),
    ("A09", "academic", "Academic–Industry Collaboration Prize", "Rewards a partnership converting academic knowledge into practical benefit through research, live briefs, guest teaching, placements or innovation.", "Suitable for", "Universities, colleges, employers, consultancies and research partners."),
    ("A10", "academic", "Outstanding Student Contribution Prize", "Recognises a student whose academic progress is accompanied by service, peer support, leadership, professional conduct or contribution to the community.", "Judging principle", "Achievement may include character, contribution and potential, not only academic marks."),
    ("C01", "commercial", "Project Controls Team of the Year", "Recognises a team demonstrating technical quality, collaboration, reliable reporting, proactive challenge and measurable support to delivery.", "Evidence emphasis", "Team role, challenge, method, improvement, outcomes and stakeholder confirmation."),
    ("C02", "commercial", "Project Controls Innovation Award", "Rewards a practical innovation improving planning, cost, risk, change, reporting, assurance, productivity or decision-making.", "Innovation test", "The solution should be different, useful and supported by evidence of value."),
    ("C03", "commercial", "Cost and Schedule Performance Award", "Recognises strong cost and schedule integration, credible forecasting, timely variance analysis and action to protect or recover performance.", "Evidence emphasis", "Baseline credibility, forecast quality, intervention and measurable improvement."),
    ("C04", "commercial", "Digital Transformation in Project Controls Award", "Recognises improvement through integrated systems, automation, BIM-related data, dashboards or digital workflow.", "Judging principle", "Entries should show adoption, governance and decision value, not only software installation."),
    ("C05", "commercial", "AI and Data Excellence Award", "Rewards responsible AI, analytics or data engineering used to improve assurance, identify trends, strengthen forecasts or support earlier intervention.", "Important requirement", "Explain verification, human oversight, limitations, privacy and data integrity."),
    ("C06", "commercial", "Risk and Change Management Excellence Award", "Recognises an integrated approach to uncertainty, risk, opportunity, change control, impact assessment, contingency and governance.", "Evidence emphasis", "Early warning, quality of analysis, decision support and reduction of unmanaged exposure."),
    ("C07", "commercial", "Major Project Controls Achievement Award", "Recognises a significant achievement on a major or complex project, programme or portfolio where controls improved delivery confidence.", "Suitable evidence", "Recovery, assurance, governance, transformation or major decision support."),
    ("C08", "commercial", "Commercial and Claims Excellence Award", "Rewards strong use of controls evidence in contract administration, change substantiation, claims avoidance, records, delay analysis or dispute support.", "Professional expectation", "Evidence should be accurate, ethical, proportionate and confidential where required."),
    ("C09", "commercial", "Sustainability and Net Zero Project Controls Award", "Recognises the use of project controls to make carbon, environmental impact, resources and sustainable choices visible and manageable.", "Suitable evidence", "Carbon-cost-time integration, sustainable sequencing or reduced environmental impact."),
    ("C10", "commercial", "Employer Project Controls Capability Award", "Recognises an employer creating a strong career structure, learning culture, ethical reporting environment and progression route.", "Evidence emphasis", "Talent development, competence, inclusion, retention and organisational impact."),
    ("C11", "commercial", "SME and Independent Consultancy Excellence Award", "Recognises a small consultancy, sole practitioner or specialist team delivering exceptional project controls value or client impact.", "Judging principle", "Organisation size should not disadvantage a strong, evidence-based entry."),
    ("C12", "commercial", "Project Controls Social Value Award", "Rewards an organisation using project controls capability to support social mobility, local talent, apprenticeships, communities or inclusive employment.", "Suitable evidence", "Beneficiary outcomes, access created, skills developed and sustained commitment."),
    ("P01", "professional", "Project Controls Professional of the Year", "The principal individual award for a professional demonstrating outstanding competence, integrity, impact and contribution.", "Evidence emphasis", "Personal contribution, judgement, outcomes, conduct and wider learning value."),
    ("P02", "professional", "Young Project Controls Professional of the Year", "Recognises an emerging professional demonstrating potential, learning, responsibility, applied competence and positive contribution.", "Judging principle", "Achievement relative to opportunity should be considered, not only seniority."),
    ("P03", "professional", "Project Controls Leader of the Year", "Recognises a leader who builds trusted controls functions, develops people and improves senior project decision-making.", "Suitable for", "Heads of controls, programme controls managers and senior consultants."),
    ("P04", "professional", "Planner or Scheduler of the Year", "Rewards excellence in planning strategy, schedule development, logic, assurance, critical path, communication or recovery planning.", "Evidence emphasis", "Schedule quality, judgement, stakeholder impact and delivery confidence."),
    ("P05", "professional", "Cost Engineer of the Year", "Recognises excellence in estimating, budgeting, cost control, commitments, forecasting, cash flow or variance analysis.", "Professional value", "Evidence should show how cost insight improved decisions or protected value."),
    ("P06", "professional", "Risk Professional of the Year", "Rewards a professional improving risk and opportunity management through analysis, facilitation, quantification, mitigation and communication.", "Evidence emphasis", "Better visibility of uncertainty and improved decision or contingency quality."),
    ("P07", "professional", "Project Data and Reporting Professional of the Year", "Recognises a professional improving data quality, dashboards, reporting discipline, analytics, visualisation or management insight.", "Judging principle", "Information quality and decision usefulness matter more than presentation alone."),
    ("P08", "professional", "Project Controls Consultant of the Year", "Recognises an independent or consultancy professional delivering trusted advice, solving difficult controls problems and creating client value.", "Suitable evidence", "Client references, case studies, recovery, assurance or technical contribution."),
    ("P09", "professional", "Mentor of the Year", "Recognises a professional consistently supporting the learning, confidence, progression, inclusion and conduct of others.", "Evidence emphasis", "Mentee outcomes, accessibility, support quality and sustained commitment."),
    ("P10", "professional", "Fellowship Excellence Award", "Recognises an IPC Fellow demonstrating exceptional leadership, service, thought leadership, mentoring or contribution.", "Suitable for", "Fellows in good standing who contribute beyond normal job duties."),
    ("P11", "professional", "Women in Project Controls Award", "Recognises an outstanding woman whose professional achievement, leadership, mentoring or advocacy strengthens the discipline.", "Evidence emphasis", "Professional impact and contribution to an inclusive, respected community."),
    ("P12", "professional", "Lifetime Contribution to Project Controls", "The Institute's highest contribution award for sustained professional service, leadership, knowledge sharing, innovation or sector influence.", "Nomination route", "Normally nominated by peers, employers, academic partners, clients or the Institute."),
    ("S01", "special", "International Contribution to Project Controls Award", "Recognises an individual or organisation strengthening project controls knowledge, collaboration or professional development across countries or regions.", "Suitable evidence", "Knowledge transfer, education, mentoring, events, standards or international project impact."),
    ("S02", "special", "Community and Social Impact Award", "Rewards the use of project or controls capability to support charities, communities, disadvantaged groups or public-benefit initiatives.", "Evidence emphasis", "Beneficiary value, ethical delivery and contribution beyond commercial gain."),
    ("S03", "special", "Veterans and Career Transition Achievement Award", "Recognises a veteran, public service professional, career returner or second-chance professional who has repositioned into project controls.", "Judging principle", "Resilience, transferable skills, growth, contribution and support for others."),
    ("S04", "special", "Professional Integrity and Ethical Reporting Award", "Recognises evidence-based professional conduct that protected data integrity, transparency, public value or responsible decision-making.", "Confidentiality", "Sensitive cases may require anonymised or private review."),
    ("S05", "special", "Diversity, Inclusion and Opportunity Award", "Recognises an initiative widening access to project controls careers, removing barriers, supporting progression or improving inclusion.", "Suitable evidence", "Access created, participation, progression, lived impact and sustained commitment."),
    ("S06", "special", "Outstanding Regional Club Contribution Award", "Recognises a member, volunteer, speaker, employer or partner strengthening the London, Nottingham, Manchester or Kent–Maidstone club community.", "Evidence emphasis", "Events, mentoring, networking, student engagement or professional service."),
    ("S07", "special", "Professional Magazine and Thought Leadership Award", "Recognises an article, interview, technical note, case study or editorial contribution making project controls knowledge useful and accessible.", "Judging principle", "Clarity, originality, evidence, professional relevance and learning value."),
    ("S08", "special", "Institute Service Award", "Recognises sustained voluntary support for membership, scholarships, events, clubs, mentoring, publications or professional standards.", "Suitable for", "Members, Fellows, partners, academics, volunteers and supporters."),
]


LEGACY_SLUGS = {
    "Best Project Controls Dissertation Prize": "ipc-dissertation-prize",
    "Project Controls Team of the Year": "ipc-project-controls-team-of-the-year",
    "Young Project Controls Professional of the Year": "ipc-young-professional-award",
    "Lifetime Contribution to Project Controls": "ipc-lifetime-contribution-award",
}


def sync_preview_13_awards(apps, schema_editor):
    AwardCategory = apps.get_model("awards", "AwardCategory")
    AwardProgramme = apps.get_model("awards", "AwardProgramme")
    AwardPageContent = apps.get_model("awards", "AwardPageContent")

    categories = {}
    active_category_slugs = []
    for data in CATEGORY_DATA:
        category, _created = AwardCategory.objects.update_or_create(
            slug=data["slug"],
            defaults={**data, "is_active": True},
        )
        categories[data["slug"]] = category
        active_category_slugs.append(data["slug"])
    AwardCategory.objects.exclude(slug__in=active_category_slugs).update(is_active=False)

    active_programme_slugs = []
    for code, category_slug, title, description, meta_label, meta in AWARDS:
        slug = LEGACY_SLUGS.get(title, slugify(title))
        active_programme_slugs.append(slug)
        AwardProgramme.objects.update_or_create(
            slug=slug,
            defaults={
                "title": title,
                "description": description,
                "criteria": [f"{meta_label}: {meta}"],
                "category": categories[category_slug],
                "is_active": True,
            },
        )
    AwardProgramme.objects.exclude(slug__in=active_programme_slugs).update(is_active=False)

    content = AwardPageContent.objects.filter(key="main").first()
    if content is None:
        return
    content.hero = HERO
    content.benefits_intro = BENEFITS_INTRO
    content.impact_benefits = IMPACT_BENEFITS
    content.framework_intro = FRAMEWORK_INTRO
    content.featured_intro = FEATURED_INTRO
    content.beneficiaries_intro = BENEFICIARIES_INTRO
    content.beneficiaries = BENEFICIARIES
    content.timeline_intro = TIMELINE_INTRO
    content.nomination_timeline = NOMINATION_TIMELINE
    content.integrity_intro = INTEGRITY_INTRO
    content.integrity_principles = INTEGRITY_PRINCIPLES
    content.recognition_intro = RECOGNITION_INTRO
    content.recognition_benefits = RECOGNITION_BENEFITS
    content.partnerships_intro = PARTNERSHIPS_INTRO
    content.partnerships = PARTNERSHIPS
    content.faq = FAQ
    content.interest_intro = INTEREST_INTRO
    content.final_cta = FINAL_CTA
    content.seo = SEO
    content.status = "published"
    content.is_active = True
    content.save()


class Migration(migrations.Migration):
    dependencies = [
        ("awards", "0011_add_recognition_content"),
    ]

    operations = [
        migrations.RunPython(sync_preview_13_awards, migrations.RunPython.noop),
    ]
