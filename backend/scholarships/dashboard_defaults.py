"""Editable defaults for the current Scholarships and pathway experiences."""


def default_gateway_seo():
    return {
        "title": "Scholarships and Funded Professional Pathways",
        "description": "Explore IPC scholarships, funded professional pathways and IPC Bursary Routes delivered through Kent Business College.",
        "canonical_path": "/scholarships",
        "keywords": [
            "project controls scholarships UK",
            "funded project controls training",
            "project management scholarships",
            "AI in project controls certificate",
            "PMO professional development",
            "Kent Business College pathways",
        ],
    }


def default_gateway_content():
    return {
        "hero": {
            "eyebrow": "Scholarships · bursaries · funded pathways",
            "title": "Professional pathways made more accessible.",
            "description": "IPC helps eligible professionals access structured project controls and project management pathways delivered through Kent Business College.",
            "supporting_text": "Explore publicly funded, employer-supported and IPC Bursary Route options—each subject to assessment, availability and the applicable terms.",
            "primary_cta_label": "Check your eligibility",
            "secondary_cta_label": "Explore the pathways",
            "notice": "No admission or funding decision is made on this page. Final confirmation follows a formal assessment.",
        },
        "partnership": {
            "eyebrow": "Partnership model",
            "title": "One professional journey. Two clearly defined roles.",
            "description": "IPC supports access and long-term professional development. Kent Business College confirms eligibility and delivers the learning experience.",
            "ipc_title": "Access, support and professional direction",
            "ipc_items": [
                "Scholarships and bursaries",
                "Specialist pathway funding",
                "Additional AI-module support",
                "Professional community access",
                "Masterclasses and development",
                "Recognition and career guidance",
            ],
            "kent_title": "Formal assessment and learning delivery",
            "kent_items": [
                "Pathway and funding assessment",
                "Teaching and coaching",
                "Assessment and quality assurance",
                "Learner support",
                "Certification",
                "Enrolment and onboarding",
            ],
            "kent_cta_label": "Visit Kent Business College",
        },
        "process": {
            "eyebrow": "How it works",
            "title": "From exploration to enrolment.",
            "items": [
                {"number": "01", "title": "Explore the pathways", "description": "Compare structure, audience, funding and weekly commitment."},
                {"number": "02", "title": "Complete an initial assessment", "description": "Review the criteria, then submit details for formal assessment."},
                {"number": "03", "title": "Confirm the right route", "description": "Kent assesses public funding; IPC assesses bursary support."},
                {"number": "04", "title": "Begin through Kent", "description": "Complete enrolment and receive the confirmed learning timetable."},
            ],
        },
        "funding": {
            "eyebrow": "Funding options",
            "title": "Two module-support options. One careful assessment.",
            "description": "Compare the potential IPC contribution and the remaining module cost before requesting a formal assessment.",
            "options": [
                {
                    "percentage": "50%",
                    "title": "Individual module support",
                    "profile": "For AI, PMI SP, EVM, Risk, PPC, MSP, Managing Portfolios and PMO modules, subject to assessment.",
                    "detail": "A £4,000 individual module may receive a 50% IPC contribution, leaving £2,000 to pay.",
                    "decision": "For a 4-month module, the £2,000 remaining balance may be paid in 8 monthly installments of £250 by Direct Debit, subject to approval.",
                },
                {
                    "percentage": "75%",
                    "title": "Enhanced module support",
                    "profile": "For the PMP and the PMO / Chartered module package, subject to assessment.",
                    "detail": "PMP: £8,000 cost, 75% IPC support and £2,000 to pay. PMO / Chartered modules: £16,000 cost, 75% IPC support and £4,000 to pay.",
                    "decision": "For PMO / Chartered modules: £400 non-refundable deposit, followed by 24 monthly installments of £150 by Direct Debit.",
                },
            ],
            "notice": "Module costs, IPC support and installment arrangements are subject to assessment, approval, available funds and written confirmation.",
        },
        "government_funding": {
            "eyebrow": "Government funding routes",
            "title": "Levy, Non-Levy and Levy Transfer explained.",
            "description": "Government funding follows the employer account, funded product, start date and current rules. It is assessed independently from IPC Professional Support.",
            "routes": [
                {"title": "Levy", "description": "An eligible employer uses available funds in its government funding account towards eligible learning and assessment costs, up to the applicable funding band."},
                {"title": "Non-Levy", "description": "An eligible employer that does not pay the levy may reserve government funding. The contribution and any employer balance depend on the rules applying at the start date."},
                {"title": "Levy Transfer", "description": "Another eligible employer may agree to transfer available account funds, subject to agreement, approval and available funds."},
            ],
            "before": {
                "eyebrow": "Starts before 1 August 2026",
                "title": "Current pre-change position",
                "items": [
                    "Available Levy funds may cover eligible costs up to the funding rate.",
                    "Eligible Non-Levy unit routes may receive the applicable government contribution up to the funding rate.",
                    "Where a Levy-paying employer has insufficient funds, the stated unit rule is 95% Government / 5% Employer.",
                ],
            },
            "after": {
                "eyebrow": "Starts on or after 1 August 2026",
                "title": "New start-date rules",
                "items": [
                    "Available Levy funds may continue to cover eligible costs up to the funding rate.",
                    "Eligible Non-Levy unit routes are funded according to the rate and rules applying to that product.",
                    "Where a Levy-paying employer has insufficient funds, the stated unit rule changes to 75% Government / 25% Employer.",
                ],
            },
            "notice": "Rules may change. Kent Business College confirms the correct employer contribution and start-date treatment before enrolment.",
        },
        "funding_figures": {
            "eyebrow": "IPC Fund",
            "title": "IPC Fund support by pathway.",
            "description": "Potential IPC Fund contributions vary by pathway and are confirmed following assessment.",
            "items": [
                {
                    "fund": "IPC Fund",
                    "percentage": "75%",
                    "pathways": ["Chartered Pathway"],
                    "is_active": True,
                },
                {
                    "fund": "IPC Fund",
                    "percentage": "50%",
                    "pathways": ["Operational Pathway", "Strategic Pathway"],
                    "is_active": True,
                },
            ],
            "notice": "Percentages are potential maximum contributions, subject to assessment, eligibility, pathway selection and written confirmation.",
        },
        "pathways_intro": {
            "eyebrow": "Pathway explorer",
            "title": "Compare the route that fits your career stage.",
            "description": "Each pathway combines a defined credit structure with professional support and a formal Kent Business College assessment.",
        },
        "learning": {
            "eyebrow": "Weekly learning model",
            "title": "Eight structured hours each week.",
            "description": "A consistent pattern combines live teaching, guided digital learning and portfolio application.",
            "rhythm_items": [
                {"icon": "laptop", "badge": "2h", "title": "Live online session", "description": "Tutor-led teaching, discussion, worked examples and applied professional practice."},
                {"icon": "book", "badge": "3h", "title": "Reading, quizzes and podcasts", "description": "Guided digital learning, knowledge checks, reflection and supporting resources."},
                {"icon": "portfolio", "badge": "3h", "title": "Portfolio-building activities", "description": "Applied evidence, workplace examples, commentary, reflection and project outputs."},
            ],
            "commitment_title": "Time must be planned and protected.",
            "commitment_description": "Applicants should normally protect eight hours each week: two hours for live teaching, three hours for guided learning and three hours for portfolio development.",
        },
        "ai_spotlight": {
            "eyebrow": "IPC specialist spotlight",
            "title": "AI in Project Controls Certificate",
            "description": "A specialist module strongly supported by IPC and delivered and certified through Kent Business College.",
            "items": [
                "AI-supported planning and scheduling",
                "Forecasting and performance analysis",
                "Risk identification and earned value insight",
                "Automated reporting and scenario modelling",
                "Predictive and portfolio intelligence",
                "Ethical AI, data responsibility and human oversight",
            ],
        },
        "comparison": {
            "eyebrow": "IPC Bursary",
            "title": "IPC Bursary",
            "description": "IPC bursary support is assessed individually and is subject to pathway fit, need, approval and available funds.",
            "rows": [
                {"route": "Up to 100% funded", "applicant": "Eligible employed applicant", "employer": "Support, protected time and reviews", "conditions": "Residency, status, England work and current rules", "assessment": "Kent Business College"},
                {"route": "95% / 5% before 1 August 2026", "applicant": "Eligible start with insufficient Levy account funds", "employer": "Approval, registration and 5% contribution", "conditions": "Start date, funded product and employer account position", "assessment": "Kent Business College"},
                {"route": "75% / 25% from 1 August 2026", "applicant": "Eligible new start with insufficient Levy account funds", "employer": "Approval, registration and 25% contribution", "conditions": "Start date, funded product and employer account position", "assessment": "Kent Business College"},
                {"route": "Up to 75% IPC bursary", "applicant": "Selected unemployed or bursary-route applicant", "employer": "May vary by circumstances", "conditions": "Pathway fit, need, approval and available funds", "assessment": "IPC and Kent as applicable"},
                {"route": "Up to 50% IPC bursary", "applicant": "Selected employed bursary-route applicant", "employer": "Optional sponsorship", "conditions": "Pathway fit, approval and available funds", "assessment": "IPC and Kent as applicable"},
                {"route": "IPC Bursary Route", "applicant": "Employer-sponsored, self-funded or self-employed", "employer": "Optional unless agreed", "conditions": "Admissions, payment and pathway terms", "assessment": "IPC and Kent Business College"},
            ],
        },
        "all_inclusive": {
            "eyebrow": "All-inclusive value",
            "title": "An all-inclusive professional package.",
            "statement": "All-inclusive package designed to support professional progression and career advancement.",
            "items": [
                {"icon": "handshake", "title": "London Masterclass events"},
                {"icon": "graduation", "title": "Graduation Ceremony"},
                {"icon": "health", "title": "Private Health Care Insurance"},
                {"icon": "check", "title": "Exams and Memberships"},
                {"icon": "book", "title": "Learning Materials"},
                {"icon": "target", "title": "Diploma Level 7 in Strategy and Leadership (MBA) – free top-up to the programme"},
            ],
        },
        "audiences": {
            "eyebrow": "Who may benefit",
            "title": "Professional development for different career moments.",
            "description": "Suitability depends on the pathway, not on fitting a single professional profile.",
            "items": [
                "Early-career professionals",
                "Project planners",
                "Schedulers",
                "Project controls specialists",
                "PMO professionals",
                "Programme leaders",
                "Portfolio leaders",
                "Consultants",
                "Career changers",
                "Employers",
                "Self-employed bursary-route applicants",
                "Professionals interested in AI",
            ],
        },
        "eligibility": {
            "eyebrow": "IPC Bursary Fund eligibility",
            "title": "Could the IPC Bursary Fund support your pathway?",
            "description": "IPC assesses every bursary application individually. Support depends on pathway fit, demonstrated financial need, expected professional benefit, applicant commitment and available IPC Bursary Fund resources.",
            "criteria": [
                "A valid IPC membership reference linked to your account",
                "A selected IPC pathway that fits your experience and professional goals",
                "Evidence that you cannot reasonably meet the full pathway cost without support",
                "A clear explanation of the career or professional outcome the bursary would enable",
                "A measurable benefit for your role, organisation, sector or professional community",
                "The ability to commit the time required to complete the selected pathway",
                "Disclosure of any employer sponsorship, personal contribution or other available funding",
                "Relevant qualifications, memberships, certifications or professional experience",
                "Acceptance of the bursary participation, progress and publicity terms",
                "Final IPC assessment, approval and availability of bursary funds",
            ],
            "documents_title": "Information IPC may request",
            "documents": [
                "Your valid IPC membership reference",
                "The quoted cost for your selected pathway",
                "Information supporting your financial circumstances",
                "Employer sponsorship or contribution details, where applicable",
                "Relevant qualifications, memberships or certifications",
                "Additional evidence needed to assess pathway fit or financial need",
            ],
            "documents_notice": "IPC will confirm any supporting evidence required during review. Do not send sensitive documents by unsecured email.",
            "notes": [
                {"title": "Individual assessment", "description": "Submitting an application does not guarantee an award or a particular contribution. IPC confirms any approved amount in writing."},
                {"title": "Different employment circumstances", "description": "Employed, self-employed and unemployed IPC members may be considered where the pathway, need and intended outcome meet the bursary criteria."},
            ],
        },
        "commitment": {
            "eyebrow": "Learning-commitment checker",
            "title": "Can you commit to the pathway?",
            "description": "Select each commitment you can normally accommodate. The check stores no data and is indicative only.",
            "items": [
                "2 hours for live online teaching each week",
                "3 hours for reading and digital learning each week",
                "3 hours for portfolio development each week",
                "One hour for a monthly coaching meeting",
                "One hour for a progress review every ten weeks",
                "Workplace time for practical application",
            ],
            "button_label": "Check my commitment",
        },
        "faq": {
            "eyebrow": "Frequently asked questions",
            "title": "The practical details, answered carefully.",
            "description": "Where arrangements vary, the answer directs you to formal confirmation rather than making assumptions.",
            "items": [
                {"question": "What does IPC fund?", "answer": "IPC may provide scholarship or bursary support, specialist pathway funding, additional AI-module support and selected professional-development benefits. The exact contribution is confirmed individually."},
                {"question": "What does Kent Business College provide?", "answer": "Kent Business College is responsible for pathway delivery, teaching, coaching, assessment, quality assurance, learner support, eligibility and funding assessment, certification and enrolment."},
                {"question": "What is a learning credit?", "answer": "A credit is used on this page to show the relative value assigned to each module within a pathway. Kent Business College confirms the formal pathway specification."},
                {"question": "Can I apply if public funding is unavailable?", "answer": "Yes. The IPC Bursary Route, employer-sponsored and self-funded arrangements may be explored, subject to assessment and availability."},
                {"question": "Can my employer pay the remaining balance?", "answer": "Potentially. Employer contributions and payment arrangements must be agreed before enrolment and remain subject to the applicable IPC Bursary Route terms."},
                {"question": "How do payment plans work?", "answer": "Operational, Strategic, PMO Professional and Chartered IPC Bursary Route balances may have approved terms of up to 36 months. The APM bursary route may have terms of up to 24 months. Deposits, approval and final conditions apply."},
                {"question": "Is the AI certificate included in every pathway?", "answer": "No. AI in Project Controls is a mandatory core component of the Operational and Strategic pathways and forms part of the APM Pathway. The Chartered Pathway includes AI in Project Management. The standalone PMO Professional pathway is four credits."},
                {"question": "How do I select the Chartered Pathway elective?", "answer": "You select either Portfolio Management or Earned Value Management as the one-credit specialist elective. Kent Business College confirms the selection process."},
                {"question": "Does the Chartered Pathway automatically provide chartered status?", "answer": "No. It supports advanced professional and chartered-level capability, but completion does not automatically confer a professional status."},
                {"question": "How much time should I plan each week?", "answer": "The structured study pattern is eight hours: two hours of live teaching, three hours of guided digital learning and three hours of portfolio development."},
                {"question": "How long does each pathway take?", "answer": "Operational, Strategic and Chartered pathways have a 24-month study period. PMO Professional has a 16-month study period, while APM has a 12-month study period."},
                {"question": "What are the 840 learning hours?", "answer": "They describe the approximate total learning requirement for the complete applicable pathway, not 840 hours for each credit."},
                {"question": "What are the 350 learning hours?", "answer": "They are the approximate learning allocation for the APM Pathway across 12 months."},
                {"question": "Do I need to attend every live session?", "answer": "Consistent attendance and engagement are expected. Any attendance requirements or permitted exceptions are confirmed during onboarding."},
                {"question": "What do I submit each month?", "answer": "Participants normally submit learning-platform activities and portfolio-building activities to their coach."},
                {"question": "What is included in portfolio evidence?", "answer": "Evidence may include anonymised workplace examples, project outputs, screenshots, documents, professional reflections and commentary."},
                {"question": "Can I use confidential workplace documents?", "answer": "Only where your employer permits and after confidential client, project, financial, personal and commercial information has been removed or anonymised."},
                {"question": "What happens in monthly coaching?", "answer": "The one-hour session may review progress, evidence, learning needs, practical application and next actions."},
                {"question": "Who attends the ten-week progress review?", "answer": "The participant, coach and line manager normally attend."},
                {"question": "Does my employer need to provide protected learning time?", "answer": "Employer support and protected learning time are normally required for the publicly funded route."},
                {"question": "Can self-employed professionals apply?", "answer": "Yes, through the IPC Bursary Route, subject to assessment."},
                {"question": "Can unemployed applicants apply?", "answer": "Yes. An IPC Bursary Route may be considered, subject to assessment and available funds."},
                {"question": "What documents may be required?", "answer": "Identity, address, residency, right-to-work, employment, working-hours, work-location, employer approval and current-study evidence may be requested."},
                {"question": "How long does the eligibility process take?", "answer": "Kent Business College confirms the current process and likely timing after reviewing the required information."},
                {"question": "Are examinations and memberships included?", "answer": "Relevant examinations and selected professional memberships may be included according to the pathway specification."},
                {"question": "Is private healthcare included?", "answer": "Private Health Care Insurance is included in the all-inclusive professional package, subject to the confirmed package terms."},
                {"question": "Is MBA progression guaranteed?", "answer": "The package includes a Diploma Level 7 in Strategy and Leadership and a free MBA top-up to the programme, subject to the applicable academic requirements."},
                {"question": "Can international professionals use the IPC Bursary Route?", "answer": "This route may be possible. Kent Business College confirms the applicable admissions and delivery requirements."},
                {"question": "What is the difference between a Government Funding Band and IPC Professional Support?", "answer": "The Government Funding Band is the maximum eligible public contribution. IPC Professional Support is a separate potential contribution."},
                {"question": "What do Levy, Non-Levy and Levy Transfer mean?", "answer": "Levy uses an eligible employer’s government funding account. Non-Levy applies to an eligible employer that does not pay the levy. Levy Transfer is an agreed transfer from another eligible employer’s account."},
            ],
        },
        "final_cta": {
            "eyebrow": "Your next step",
            "title": "Find the right pathway and funding route.",
            "description": "Begin with Kent Business College for a formal pathway and eligibility assessment, or speak with IPC about bursary and professional-support options.",
            "primary_cta_label": "Apply through Kent Business College",
            "secondary_cta_label": "Speak to an IPC pathway adviser",
        },
    }


def default_gateway_hero():
    return default_gateway_content()["hero"]


def default_gateway_partnership():
    return default_gateway_content()["partnership"]


def default_gateway_process():
    return default_gateway_content()["process"]


def default_gateway_funding():
    return default_gateway_content()["funding"]


def default_gateway_government_funding():
    return default_gateway_content()["government_funding"]


def default_gateway_funding_figures():
    return default_gateway_content()["funding_figures"]


def default_gateway_pathways_intro():
    return default_gateway_content()["pathways_intro"]


def default_gateway_learning():
    return default_gateway_content()["learning"]


def default_gateway_ai_spotlight():
    return default_gateway_content()["ai_spotlight"]


def default_gateway_comparison():
    return default_gateway_content()["comparison"]


def default_gateway_all_inclusive():
    return default_gateway_content()["all_inclusive"]


def default_gateway_audiences():
    return default_gateway_content()["audiences"]


def default_gateway_eligibility():
    return default_gateway_content()["eligibility"]


def default_gateway_commitment():
    return default_gateway_content()["commitment"]


def default_gateway_faq():
    return default_gateway_content()["faq"]


def default_gateway_final_cta():
    return default_gateway_content()["final_cta"]


def default_module_offers():
    return [
        {
            "id": "individual-module",
            "label": "Individual module",
            "title": "Choose a professional module",
            "description": "Choose one or more eligible professional modules, each assessed individually.",
            "modules": ["AI", "PMI SP", "EVM", "Risk", "PPC", "MSP", "Managing Portfolios", "PMO"],
            "courseCost": "£4,000",
            "ipcSupport": "50%",
            "amountPayable": "£2,000",
            "details": [
                "Each module is selected and assessed individually.",
                "4-month learning duration for each module.",
                "The £2,000 remaining balance may be paid in 8 monthly installments of £250 by Direct Debit, subject to approval.",
            ],
            "bonus": None,
        },
        {
            "id": "pmp-modules",
            "label": "PMP credits",
            "title": "Project Management Professional",
            "description": "The PMP is worth two credits and has an eight-month learning duration.",
            "modules": [],
            "courseCost": "£8,000",
            "ipcSupport": "75%",
            "amountPayable": "£2,000",
            "details": [
                "The PMP is worth two credits.",
                "8-month learning duration.",
                "The £2,000 remaining balance may be paid in 16 monthly installments of £125 by Direct Debit, subject to approval.",
            ],
            "bonus": None,
        },
        {
            "id": "apm-modules",
            "label": "APM modules",
            "title": "APM modules",
            "description": "A 12-month APM package combining PMP and AI in Project Controls.",
            "modules": ["PMP", "AI"],
            "courseCost": "£12,000",
            "ipcSupport": "TBC",
            "amountPayable": "TBC",
            "details": [
                "APM combines the two-credit PMP with AI in Project Controls.",
                "12-month learning duration.",
                "IPC Fund support and the remaining balance are confirmed after individual assessment.",
            ],
            "bonus": None,
        },
        {
            "id": "pmo-chartered-modules",
            "label": "PMO / Chartered modules",
            "title": "Four-module professional package",
            "description": "A four-module PMO and Chartered professional package.",
            "modules": ["PMO", "Risk", "Plan", "Stakeholder"],
            "courseCost": "£16,000",
            "ipcSupport": "75%",
            "amountPayable": "£4,000",
            "details": [
                "16-month learning duration.",
                "£400 non-refundable deposit, leaving a £3,600 balance.",
                "24 monthly installments of £150 by Direct Debit.",
            ],
            "bonus": {
                "label": "Included by IPC",
                "title": "ChPP certificate cost",
                "description": "IPC will cover the cost of the ChPP certificate.",
                "image": "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/c49b55b4496342219ee90b7b048c7dc7.png",
            },
        },
    ]


def default_pathways():
    common_operational_funding = {
        "funded": "Eligible funded-route participants may access a £6,000 Government Funding Band plus a separate IPC Fund contribution of up to £1,000, subject to assessment and written confirmation.",
        "bursaryRoute": "Applicants who are not employed or cannot commit eight protected hours each week may explore the IPC Bursary Route, with up to 50% of the eligible pathway cost supported by the IPC Fund.",
        "ipcSupport": "Up to £1,000 IPC Fund support alongside an eligible funded route, or up to 50% IPC Fund support through the separately assessed IPC Bursary Route.",
        "payment": "An approved payment plan may extend for up to 36 months, subject to deposit and final payment terms.",
    }
    pathways = [
        {
            "id": "operational",
            "name": "Operational Pathway",
            "short": "Operational",
            "stage": "Early career to established practitioner",
            "audience": "Project coordinators, planners, schedulers, cost and risk support professionals, and people moving into project controls.",
            "summary": "Build practical confidence across planning, scheduling, risk, earned value and day-to-day project delivery.",
            "credits": "6 credits",
            "coreTotal": "6 total credits",
            "modules": [
                {"name": "PMP", "credits": "2 credits", "note": "Mandatory core"},
                {"name": "AI in Project Controls Certificate", "credits": "1 credit", "note": "Mandatory core"},
                {"name": "Risk Management", "credits": "1 credit", "note": "Mandatory specialist"},
                {"name": "Project Planning & Control (PPC)", "credits": "1 credit", "note": "Mandatory specialist"},
                {"name": "Choose 1 of 2 operational specialist electives", "credits": "1 credit", "note": "PMI-SP • Earned Value Management (EVM)"},
            ],
            "additional": "PMP, AI in Project Controls, Risk Management and Project Planning & Control (PPC) are mandatory. Learners choose either PMI-SP or Earned Value Management (EVM) as the final one-credit elective.",
            **common_operational_funding,
            "outcomes": ["Practical planning and scheduling", "Applied risk and earned value insight", "Stronger project controls fundamentals", "Workplace-ready delivery confidence"],
            "hours": "840",
            "hoursLabel": "total hours for the complete pathway",
            "duration": "24 months",
            "url": "https://kentbusinesscollege.com/project-control-professional-level-6/#pathways",
        },
        {
            "id": "strategic",
            "name": "Strategic Pathway",
            "short": "Strategic",
            "stage": "Senior practitioner to strategic leader",
            "audience": "Senior project controls practitioners, programme leaders, portfolio professionals, PMO leaders and strategic decision-makers.",
            "summary": "Advance programme leadership, portfolio governance, strategic risk, PMO maturity and data-led decision-making.",
            "credits": "6 credits",
            "coreTotal": "6 total credits",
            "modules": [
                {"name": "PMP", "credits": "2 credits", "note": "Mandatory core"},
                {"name": "AI in Project Controls Certificate", "credits": "1 credit", "note": "Mandatory core"},
                {"name": "Risk Management", "credits": "1 credit", "note": "Mandatory specialist"},
                {"name": "PMO", "credits": "1 credit", "note": "Mandatory specialist"},
                {"name": "Choose 1 of 2 strategic specialist electives", "credits": "1 credit", "note": "MSP • Managing Portfolios"},
            ],
            "additional": "PMP, AI in Project Controls, Risk Management and PMO are mandatory. Learners choose either MSP or Managing Portfolios as the final one-credit elective.",
            **common_operational_funding,
            "outcomes": ["Programme and portfolio leadership", "Strategic risk and PMO maturity", "Portfolio intelligence and forecasting", "Data-led governance decisions"],
            "hours": "840",
            "hoursLabel": "total hours for the complete pathway",
            "duration": "24 months",
            "url": "https://kentbusinesscollege.com/project-control-professional-level-6/#pathways",
        },
        {
            "id": "pmo",
            "name": "Certified PMO Professional",
            "short": "PMO Professional",
            "stage": "Established PMO practitioner and leader",
            "audience": "PMO professionals, managers, consultants and experienced practitioners seeking a focused advanced PMO route.",
            "summary": "A standalone four-credit professional pathway focused on advanced PMO practice, governance, assurance and organisational value.",
            "credits": "4 credits",
            "coreTotal": "4 modules • 4 total credits",
            "modules": [
                {"name": "PMO", "credits": "1 credit"},
                {"name": "Risk", "credits": "1 credit"},
                {"name": "Planning", "credits": "1 credit"},
                {"name": "Stakeholder", "credits": "1 credit"},
            ],
            "additional": "The Certified PMO Professional pathway contains four required modules: PMO, Risk, Planning and Stakeholder. Together they form the complete four-credit pathway.",
            "funded": "Eligible funded-route participants may access a £27,000 Government Funding Band plus a separate IPC Fund contribution of up to £7,000, subject to assessment and written confirmation.",
            "bursaryRoute": "Where the funded route is not suitable, applicants may explore the PMO IPC Bursary Route with up to 75% of the eligible pathway cost supported by the IPC Fund.",
            "ipcSupport": "Up to £7,000 IPC Fund support alongside an eligible funded route, or up to 75% IPC Fund support through the separately assessed IPC Bursary Route.",
            "payment": "An approved payment plan may extend for up to 36 months, subject to deposit and final payment terms.",
            "outcomes": ["Advanced PMO practice", "Governance and assurance", "Organisational decision support", "PMO leadership confidence"],
            "hours": "560",
            "hoursLabel": "total pathway hours across 16 months",
            "duration": "16 months",
            "url": "https://kentbusinesscollege.com/project-control-professional-level-6/#pathways",
        },
        {
            "id": "chartered",
            "name": "Chartered Pathway",
            "short": "Chartered",
            "stage": "Experienced professional and advanced leader",
            "audience": "Experienced PMO professionals, project management leaders, senior consultants and managers developing advanced Level 6 capability.",
            "summary": "A structured route designed to support advanced professional and chartered-level capability without guaranteeing a particular professional status.",
            "credits": "6 credits",
            "coreTotal": "4 + 1 + 1 structure",
            "modules": [
                {"name": "Certified PMO Professional Level 6", "credits": "4 credits"},
                {"name": "AI in Project Management", "credits": "1 credit"},
                {"name": "Choose 1 of 2 specialist electives", "credits": "1 credit", "note": "Portfolio Management • Earned Value Management"},
            ],
            "additional": "The selected elective completes the six-credit structure. Both electives are displayed for choice; only one is required.",
            "funded": "Eligible funded-route participants may access a £27,000 Government Funding Band plus a separate IPC Fund contribution of up to £7,000, subject to assessment and written confirmation.",
            "bursaryRoute": "Where the funded route is not suitable, applicants may explore the Chartered IPC Bursary Route with up to 75% of the eligible pathway cost supported by the IPC Fund.",
            "ipcSupport": "Up to £7,000 IPC Fund support alongside an eligible funded route, or up to 75% IPC Fund support through the separately assessed IPC Bursary Route.",
            "payment": "An approved payment plan may extend for up to 36 months, subject to deposit and final payment terms.",
            "outcomes": ["Advanced professional capability", "Strategic PMO and controls leadership", "AI-enabled project management", "Specialist portfolio or earned value evidence"],
            "hours": "840",
            "hoursLabel": "total hours for the complete pathway",
            "duration": "24 months",
            "url": "https://kentbusinesscollege.com/project-control-professional-level-6/#pathways",
        },
        {
            "id": "apm",
            "name": "APM Pathway",
            "short": "APM",
            "stage": "Developing project professional",
            "audience": "Project coordinators, project team members, developing project managers and professionals seeking a focused, practical route.",
            "summary": "A concise pathway combining practical project management development with specialist AI in project controls learning.",
            "credits": "3 credits",
            "coreTotal": "2 + 1 structure",
            "modules": [
                {"name": "PMP", "credits": "2 credits"},
                {"name": "AI in Project Controls Certificate", "credits": "1 credit"},
            ],
            "additional": "No additional modules or credits are included in this pathway structure.",
            "funded": "Eligible funded-route participants may access a £6,000 Government Funding Band plus a separate IPC Fund contribution of up to £1,000, subject to assessment and written confirmation.",
            "bursaryRoute": "The IPC Bursary Route is available subject to pathway confirmation. No fixed bursary percentage is stated for this pathway.",
            "ipcSupport": "Up to £1,000 IPC Fund support may accompany an eligible funded route. Any additional bursary support is confirmed through a separate IPC assessment.",
            "payment": "An IPC Bursary Route payment plan of up to 24 months may be available, subject to deposit, approval and final terms.",
            "outcomes": ["Practical project management capability", "AI-enabled project controls awareness", "Applied workplace development", "Evidence of professional impact"],
            "hours": "350",
            "hoursLabel": "total pathway hours across 12 months",
            "duration": "12 months",
            "url": "https://kentbusinesscollege.com/college-of-project-management/associate-project-manager-level-4-with-pmp/",
        },
    ]
    order = {"operational": 0, "strategic": 1, "chartered": 2, "pmo": 3, "apm": 4}
    return sorted(pathways, key=lambda pathway: order.get(pathway.get("id"), 99))


def default_pathway_details():
    return [
        {
            "id": "operational",
            "accent": "#d69a32",
            "accentSoft": "#f4e4c6",
            "promise": "Turn project information into dependable plans, credible schedules and practical performance insight.",
            "themes": ["Planning systems", "Schedule confidence", "Earned value", "Operational risk", "Delivery reporting", "AI-assisted controls"],
            "evidence": ["Integrated project plan", "Schedule analysis", "Earned value report", "Risk register", "Controls dashboard", "AI-assisted workflow"],
            "journey": ["Build the baseline", "Test the schedule", "Measure performance", "Control risk", "Report clearly", "Improve decisions"],
            "creditNumbers": [2, 1, 1, 1, 1],
            "funding": {"governmentBand": "£6,000", "ipcFund": "Up to £1,000", "governmentSummary": "For eligible employed participants using the funded route.", "bursarySupport": "Up to 50%", "bursarySummary": "IPC Fund support may cover up to 50% of the eligible IPC Bursary Route cost.", "commitment": "Normally employed, employer-supported and able to protect eight hours each week."},
        },
        {
            "id": "strategic",
            "accent": "#8870ad",
            "accentSoft": "#e7dff0",
            "promise": "Connect project controls insight with programme, portfolio and organisational decision-making.",
            "themes": ["Programme leadership", "Portfolio governance", "Strategic risk", "PMO maturity", "Executive reporting", "Scenario modelling"],
            "evidence": ["Programme governance pack", "Portfolio prioritisation", "Strategic risk view", "PMO maturity review", "Executive dashboard", "Forecast scenario"],
            "journey": ["Frame strategy", "Align programmes", "Prioritise portfolios", "Strengthen governance", "Model scenarios", "Advise leaders"],
            "creditNumbers": [2, 1, 1, 1, 1],
            "funding": {"governmentBand": "£6,000", "ipcFund": "Up to £1,000", "governmentSummary": "For eligible employed participants using the funded route.", "bursarySupport": "Up to 50%", "bursarySummary": "IPC Fund support may cover up to 50% of the eligible IPC Bursary Route cost.", "commitment": "Normally employed, employer-supported and able to protect eight hours each week."},
        },
        {
            "id": "pmo",
            "accent": "#c4862c",
            "accentSoft": "#f2e1c7",
            "promise": "Develop the systems, governance and assurance practices that make a PMO valuable to its organisation.",
            "themes": ["PMO operating model", "Governance design", "Assurance", "Reporting systems", "Stakeholder value", "Decision support"],
            "evidence": ["PMO charter", "Governance framework", "Assurance review", "Reporting catalogue", "Stakeholder map", "Improvement roadmap"],
            "journey": ["Define purpose", "Design governance", "Build services", "Assure delivery", "Measure value", "Mature the PMO"],
            "creditNumbers": [1, 1, 1, 1],
            "funding": {"governmentBand": "£27,000", "ipcFund": "Up to £7,000", "governmentSummary": "For eligible employed participants using the funded PMO route.", "bursarySupport": "Up to 75%", "bursarySummary": "The IPC Fund may support up to 75% of the eligible PMO IPC Bursary Route cost.", "commitment": "The funded route normally requires employment, employer support and eight protected hours each week."},
        },
        {
            "id": "chartered",
            "accent": "#9b7ac3",
            "accentSoft": "#e9e0f2",
            "promise": "Build advanced technical knowledge and professional evidence for senior recognition and strategic progression.",
            "themes": ["Advanced PMO practice", "Planning and control", "Risk and quality", "Stakeholder systems", "Responsible AI", "Specialist elective"],
            "evidence": ["Professional portfolio", "Controls framework", "Risk and quality review", "Stakeholder strategy", "AI governance note", "Elective evidence"],
            "journey": ["Diagnose capability", "Develop technical depth", "Apply at work", "Build evidence", "Reflect professionally", "Prepare for recognition"],
            "creditNumbers": [4, 1, 1],
            "funding": {"governmentBand": "£27,000", "ipcFund": "Up to £7,000", "governmentSummary": "For eligible employed participants using the funded Chartered route.", "bursarySupport": "Up to 75%", "bursarySummary": "The IPC Fund may support up to 75% of the eligible Chartered IPC Bursary Route cost.", "commitment": "The funded route normally requires employment, employer support and eight protected hours each week."},
        },
        {
            "id": "apm",
            "accent": "#d69a32",
            "accentSoft": "#f4e4c6",
            "promise": "Create a focused foundation in practical project management and AI-enabled project controls.",
            "themes": ["Project foundations", "Scope and planning", "Stakeholders", "Risk and quality", "Delivery leadership", "AI in projects"],
            "evidence": ["Project brief", "Delivery plan", "Stakeholder map", "Risk log", "Progress report", "AI-assisted project output"],
            "journey": ["Frame the project", "Plan delivery", "Engage people", "Manage risk", "Track progress", "Demonstrate impact"],
            "creditNumbers": [2, 1],
            "funding": {"governmentBand": "£6,000", "ipcFund": "Up to £1,000", "governmentSummary": "For eligible employed participants using the funded APM route.", "bursarySupport": "Individual review", "bursarySummary": "The IPC Bursary Route and any IPC Fund contribution are assessed individually.", "commitment": "Funded-route employment, employer support and protected learning-time requirements apply."},
        },
    ]


def default_pathway_pages():
    """Return one complete dashboard record for each scholarship pathway page."""
    details_by_id = {
        item["id"]: item
        for item in default_pathway_details()
        if isinstance(item, dict) and item.get("id")
    }
    pages = []
    for pathway in default_pathways():
        detail = dict(details_by_id.get(pathway.get("id"), {}))
        detail.pop("id", None)
        pages.append({**pathway, **detail})
    return pages
