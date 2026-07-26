from django.db import migrations


APPLICATION_EMAIL = "office@instituteofprojectcontrols.org"
APPLICATION_URL = (
    "mailto:office@instituteofprojectcontrols.org"
    "?subject=Scholarship%20or%20Bursary%20Application"
    "&body=Full%20name%20and%20contact%20details%3A%0D%0A"
    "Current%20role%20or%20employment%20circumstances%3A%0D%0A"
    "Preferred%20scholarship%20or%20bursary%20category%3A%0D%0A"
    "CV%20or%20short%20professional%20background%3A%0D%0A"
    "Personal%20statement%3A%0D%0A"
    "Evidence%20of%20need%2C%20service%2C%20impact%20or%20potential%3A%0D%0A"
    "Reference%2C%20where%20available%3A%0D%0A"
    "LinkedIn%20or%20social%20media%20profile%2C%20where%20relevant%3A%0D%0A"
    "Confirmation%20of%20commitment%20to%20participate%3A"
)


HERO = {
    "eyebrow": "Scholarships & Bursaries",
    "title": "Opportunity should not depend on already knowing the profession.",
    "description": (
        "The Institute of Project Controls Scholarship & Bursary Fund is designed "
        "to widen access to project controls education, professional development, "
        "membership and career opportunity."
    ),
    "supporting_copy": (
        "Selected applicants may receive support towards eligible project controls "
        "and project management pathways delivered through Kent Business College. "
        "The Institute is looking for people with integrity, service, need, resilience, "
        "leadership, social impact, motivation or professional potential - not people "
        "who already know every project controls technique."
    ),
    "primary_cta_label": "Apply for Support",
    "primary_cta_url": APPLICATION_URL,
    "secondary_cta_label": "Sponsor a Learner",
    "secondary_cta_url": "/sponsorship",
    "tertiary_cta_label": "View Eligibility",
    "tertiary_cta_url": "#eligibility",
}

PRINCIPLES = {
    "items": [
        {
            "title": "Up to 40 places",
            "description": (
                "Up to 40 awards may be available per intake, subject to funding, "
                "eligibility, programme capacity and final approval."
            ),
        },
        {
            "title": "10 inclusive routes",
            "description": (
                "Categories recognise need, service, transition, social impact "
                "and professional potential."
            ),
        },
        {
            "title": "Email application",
            "description": (
                "A straightforward launch-phase process that allows applicants "
                "to explain their circumstances personally."
            ),
        },
        {
            "title": "Beyond tuition",
            "description": (
                "Support may include membership, events, mentoring, recognition "
                "and professional development."
            ),
        },
    ]
}

COMMITMENT = {
    "eyebrow": "The Purpose of the Fund",
    "title": "Creating access for people who can benefit from professional opportunity.",
    "description": (
        "A scholarship programme should not only reward people who have already had "
        "the greatest access to education, employment and professional networks. "
        "The Institute wants to identify people who may have the character, commitment "
        "and potential to succeed, but who face financial, professional, social or "
        "personal barriers."
    ),
    "secondary_description": (
        "Applicants may come from engineering, construction, commercial management, "
        "administration, finance, public service, the armed forces, charity leadership, "
        "community work, consultancy, self-employment, communications or completely "
        "different sectors. The purpose of the scheme is to help suitable people move "
        "towards a recognised and valuable project controls career."
    ),
    "callout": (
        "Lack of project controls knowledge should not be used as a reason to reject "
        "a strong applicant. The Institute should consider what the person could become "
        "with access to structured learning, professional membership, mentoring, events "
        "and an employer-connected community."
    ),
}

ACADEMIC_PARTNERS = {
    "eyebrow": "Education Partnership",
    "title": "Connecting professional opportunity with Kent Business College programmes.",
    "description": (
        "The scholarship and bursary programme is designed to support eligible learners "
        "into selected project controls and project management pathways delivered through "
        "Kent Business College. Together, the intention is to create a more connected "
        "journey from learning to workplace application, professional membership and "
        "career progression."
    ),
    "items": [
        {
            "id": "ipc",
            "label": "Professional body",
            "title": "Institute of Project Controls",
            "description": (
                "Professional membership, recognition pathways, London Master Class "
                "Events, regional clubs, awards, scholarships, employer engagement "
                "and professional community."
            ),
        },
        {
            "id": "kbc",
            "label": "Education partner",
            "title": "Kent Business College",
            "description": (
                "Education delivery, programme support, learner development and access "
                "to selected project controls and project management pathways, subject "
                "to programme availability and eligibility."
            ),
        },
    ],
    "availability_title": "Important availability statement",
    "availability": (
        "Scholarship and bursary support is not automatic. Programme availability, "
        "eligibility requirements, funding rules, employer circumstances, learner "
        "suitability, capacity and final written approval may affect the support offered. "
        "Every successful award will be confirmed individually in writing."
    ),
}

VALUES_INTRO = {
    "eyebrow": "What an Award May Support",
    "title": "Scholarship support can extend beyond one programme fee.",
    "description": (
        "Each award should be designed around the applicant's need, the available funding "
        "and the purpose of the scholarship or bursary. Awards may be full, partial or "
        "focused on specific development activities."
    ),
    "disclaimer": (
        "The exact support offered will be confirmed in the successful applicant's award "
        "letter. Applicants should not assume that every scholarship includes every "
        "benefit listed."
    ),
}

VALUES = [
    {
        "id": "programme",
        "icon": "ri-book-open-line",
        "title": "Programme support",
        "description": (
            "Full or partial support towards an eligible programme, subject to the "
            "funding arrangement confirmed for the applicant."
        ),
    },
    {
        "id": "membership",
        "icon": "ri-user-star-line",
        "title": "IPC membership",
        "description": (
            "Support towards an appropriate membership or professional recognition "
            "route, where included in the award."
        ),
    },
    {
        "id": "masterclass",
        "icon": "ri-presentation-line",
        "title": "Master class access",
        "description": (
            "Attendance at selected London Master Class Events, subject to event "
            "availability, capacity and award conditions."
        ),
    },
    {
        "id": "mentoring",
        "icon": "ri-team-line",
        "title": "Mentoring",
        "description": (
            "Access to professional guidance, career conversations, technical mentoring "
            "or progression support where suitable mentors are available."
        ),
    },
    {
        "id": "clubs",
        "icon": "ri-community-line",
        "title": "Regional club participation",
        "description": (
            "Engagement with London, Nottingham, Manchester or Kent - Maidstone club "
            "activities and local professional networking."
        ),
    },
    {
        "id": "career",
        "icon": "ri-compass-3-line",
        "title": "Career development",
        "description": (
            "CV development, LinkedIn positioning, interview preparation, professional "
            "profile guidance and career transition support."
        ),
    },
    {
        "id": "recognition",
        "icon": "ri-award-line",
        "title": "Recognition opportunities",
        "description": (
            "Access to awards, prizes, member spotlights, professional magazine "
            "opportunities and recognition pathways where eligible."
        ),
    },
    {
        "id": "additional",
        "icon": "ri-add-circle-line",
        "title": "Additional development support",
        "description": (
            "In limited cases, an award may include agreed travel, assessment, digital "
            "learning or related professional development support."
        ),
    },
]

ELIGIBILITY = {
    "eyebrow": "Understanding the Scheme",
    "title": "Scholarship and bursary are related, but not identical.",
    "description": (
        "The Institute uses both terms so that professional potential and genuine "
        "need can be recognised fairly."
    ),
    "items": [
        {
            "id": "scholarship",
            "title": "Scholarship",
            "subtitle": "Recognition of merit, character and contribution.",
            "description": (
                "A scholarship may be awarded because an applicant demonstrates strong "
                "integrity, leadership, service, social impact, community contribution, "
                "influence for a positive cause or professional potential."
            ),
            "supporting_copy": (
                "Scholarship merit does not mean the applicant must already have advanced "
                "technical knowledge. Merit can be demonstrated through character, "
                "responsibility, resilience, volunteering, leadership, public benefit "
                "and commitment to use the opportunity well."
            ),
            "points": [
                "Character and integrity",
                "Service to others",
                "Community or social contribution",
                "Leadership and positive influence",
                "Motivation and future professional potential",
            ],
        },
        {
            "id": "bursary",
            "title": "Bursary",
            "subtitle": "Support where access would otherwise be difficult.",
            "description": (
                "A bursary is primarily designed to reduce a financial, employment, "
                "educational, professional or social barrier. The applicant may have "
                "strong motivation but no employer support, limited income, interrupted "
                "employment or significant personal circumstances."
            ),
            "supporting_copy": (
                "Bursary applicants are still expected to show commitment and suitability. "
                "Need alone does not guarantee an award, but it is a major factor in "
                "understanding whether support could create a meaningful opportunity."
            ),
            "points": [
                "Financial hardship or limited income",
                "Lack of employer sponsorship",
                "Career interruption or unemployment",
                "Barriers to education or professional development",
                "Need for structured career repositioning",
            ],
        },
    ],
}

AUDIENCES_INTRO = {
    "eyebrow": "Scholarship and Bursary Categories",
    "title": (
        "Inclusive routes for different circumstances, contributions and career journeys."
    ),
    "description": (
        "Applicants should select the route that best explains why support would make "
        "a difference. More than one category may apply, and the categories are intended "
        "to widen access rather than place people into narrow labels."
    ),
    "open_title": "Do not exclude yourself because no category feels exact.",
    "open_description": (
        "Applicants whose circumstances do not fit neatly into one category may still "
        "apply. Explain the barrier, the opportunity, the personal context and the "
        "difference support would make."
    ),
    "open_cta_label": "Submit an Open Application",
    "open_cta_url": APPLICATION_URL,
}

AUDIENCES = [
    {
        "id": "access-hardship",
        "title": "Access & Hardship Bursary",
        "subtitle": "Removing financial and access barriers",
        "description": (
            "For applicants who cannot reasonably access professional education or "
            "development without financial support, including people who are unemployed, "
            "underemployed, on a low income, without employer sponsorship or facing "
            "significant financial pressure."
        ),
        "consideration": (
            "Financial circumstances, caring responsibilities, housing pressure, limited "
            "employer support, educational barriers, interrupted employment and the likely "
            "impact of the award."
        ),
        "evidence": (
            "A personal statement, employment circumstances, explanation of the barrier, "
            "reference from a support organisation or other proportionate evidence of need."
        ),
    },
    {
        "id": "character-service",
        "title": "Character & Service Scholarship",
        "subtitle": "Recognising integrity and service to others",
        "description": (
            "For people who demonstrate responsibility, reliability, honesty and a sustained "
            "willingness to support others. Good character means there is credible evidence "
            "of positive conduct, responsibility and intention."
        ),
        "consideration": (
            "Volunteering, caring, mentoring, community service, helping vulnerable people, "
            "ethical leadership, reliability and positive personal change."
        ),
        "evidence": (
            "A reference from an employer, charity, community leader, colleague, mentor or "
            "professional contact who has observed the applicant's contribution."
        ),
    },
    {
        "id": "community-impact",
        "title": "Community Impact Scholarship",
        "subtitle": "Supporting people who improve their communities",
        "description": (
            "For applicants whose work, volunteering or leadership creates positive local "
            "or social impact. Small, consistent and meaningful contribution can be valuable."
        ),
        "consideration": (
            "Youth mentoring, support for disadvantaged families, refugee support, community "
            "education, local campaigns, food support, neighbourhood initiatives, disability "
            "inclusion and public benefit."
        ),
        "evidence": (
            "A short impact summary, public information where appropriate, a reference from "
            "a community organisation, volunteer record or explanation of beneficiaries supported."
        ),
    },
    {
        "id": "social-media-good",
        "title": "Social Media for Good Scholarship",
        "subtitle": "Positive influence with 10,000+ followers",
        "description": (
            "For creators and public communicators who use social media to support a positive "
            "cause. Applicants should normally have more than 10,000 followers on at least one "
            "platform and show that their influence supports education, charity, community, "
            "social mobility, professional development, entrepreneurship or public benefit."
        ),
        "consideration": (
            "Authentic audience, quality of content, public benefit, responsible communication, "
            "positive engagement and willingness to promote project controls careers ethically."
        ),
        "evidence": (
            "Relevant public profiles and examples of responsible, positive communication. "
            "Follower numbers alone do not create merit."
        ),
    },
    {
        "id": "charity-ngo",
        "title": "Charity & NGO Leadership Scholarship",
        "subtitle": "Better project delivery for public benefit",
        "description": (
            "For employees, trustees, volunteers and leaders working in charities, NGOs, "
            "community groups and social organisations."
        ),
        "consideration": (
            "Responsibility for programmes, fundraising, operations, volunteers, community "
            "delivery, governance, budgets, public benefit or organisational improvement."
        ),
        "evidence": (
            "A role profile, trustee or leadership confirmation, project summary, reference "
            "from the organisation or explanation of how the learning would improve charitable delivery."
        ),
    },
    {
        "id": "public-service",
        "title": "Armed Forces, Veterans & Public Service Transition",
        "subtitle": "Translating service experience into civilian careers",
        "description": (
            "For armed forces leavers, veterans, reservists, emergency service personnel and "
            "public-service professionals moving into civilian project controls, infrastructure, "
            "construction, consultancy, logistics, risk or programme delivery careers."
        ),
        "consideration": (
            "Leadership, planning, logistics, risk awareness, discipline, responsibility, "
            "operational coordination, transition need and transferable service experience."
        ),
        "evidence": (
            "Service background, transition plan, CV, resettlement evidence, reference, career "
            "goals and an explanation of how project controls learning supports civilian employment."
        ),
    },
    {
        "id": "second-chance",
        "title": "Second Chance Career Repositioning Scholarship",
        "subtitle": "Supporting positive reintegration and rebuilding",
        "description": (
            "For people rebuilding their professional lives after custody, conviction, "
            "homelessness, addiction recovery, long-term unemployment or another significant "
            "disruption. Applications should be handled sensitively and fairly."
        ),
        "consideration": (
            "Evidence of positive change, rehabilitation, commitment, reliability, support "
            "from a recognised organisation, career plan, safeguarding considerations and "
            "readiness to participate."
        ),
        "evidence": (
            "A past difficulty should not automatically define a person's future. Suitability, "
            "risk and safeguarding may still be considered where relevant."
        ),
    },
    {
        "id": "independent",
        "title": "Self-Employed Professionals & Consultants Bursary",
        "subtitle": "Professional development without employer sponsorship",
        "description": (
            "For freelancers, sole traders, independent consultants and small consultancy owners "
            "who need professional development but do not have access to a large employer training budget."
        ),
        "consideration": (
            "Business need, professional development plan, client benefit, income barrier, "
            "potential to create work, support other organisations or build an ethical specialist consultancy."
        ),
        "evidence": (
            "Applicants may include independent planners, cost consultants, project managers, "
            "quantity surveyors, claims consultants, advisers, trainers and technical professionals."
        ),
    },
    {
        "id": "career-returner",
        "title": "Career Returner & Repositioning Bursary",
        "subtitle": "Returning after interruption or changing direction",
        "description": (
            "For people returning to work after childcare, caring responsibilities, illness, "
            "bereavement, redundancy, relocation or another significant career break, and "
            "professionals changing sector or moving into project controls."
        ),
        "consideration": (
            "Length and reason for the career break, transferable experience, confidence barriers, "
            "re-entry plan, skills refresh need and the value of structured support."
        ),
        "evidence": (
            "Potential transitions may come from operations, administration, engineering, finance, "
            "construction, logistics, procurement, commercial management, data, PMO and project coordination."
        ),
    },
    {
        "id": "emerging-talent",
        "title": "Emerging Talent Scholarship",
        "subtitle": "Supporting potential at the start of a career",
        "description": (
            "For school leavers, college leavers, graduates, apprentices, junior employees and "
            "early-career professionals who show promise but have limited access to professional "
            "networks, training or employer support."
        ),
        "consideration": (
            "Motivation, learning attitude, responsibility, problem-solving, communication, service, "
            "academic or workplace potential and commitment to building a project controls career."
        ),
        "evidence": (
            "Applicants are not expected to have advanced project controls knowledge. The scholarship "
            "exists to help strong potential become professional capability."
        ),
    },
]

RECIPIENT_COMMITMENT = {
    "eyebrow": "Conditions and Responsibilities",
    "title": "Support creates opportunity and also carries responsibility.",
    "description": (
        "Successful applicants should understand the conditions of their award before accepting it."
    ),
    "items": [
        {
            "title": "Programme eligibility",
            "description": (
                "The applicant must meet the eligibility, entry and participation requirements "
                "of the relevant programme and education partner."
            ),
        },
        {
            "title": "Truthful information",
            "description": (
                "Applications must be accurate. False or misleading information may result "
                "in rejection or withdrawal of an award."
            ),
        },
        {
            "title": "Participation and completion",
            "description": (
                "Successful applicants are expected to attend, participate, complete required "
                "work and communicate promptly about barriers."
            ),
        },
        {
            "title": "Professional conduct",
            "description": (
                "Award holders must act respectfully and follow relevant conduct, safeguarding, "
                "equality, confidentiality and professional behaviour requirements."
            ),
        },
        {
            "title": "Progress updates",
            "description": (
                "The Institute may request proportionate progress updates, reflections or "
                "confirmation of continued participation."
            ),
        },
        {
            "title": "Individual award terms",
            "description": (
                "The value, duration, covered activities and conditions of each award will "
                "be confirmed individually in writing."
            ),
        },
        {
            "title": "No automatic professional recognition",
            "description": (
                "A scholarship does not automatically grant Associate Fellowship or Fellowship. "
                "Professional recognition remains subject to the relevant competence and evidence requirements."
            ),
        },
        {
            "title": "Withdrawal where necessary",
            "description": (
                "Support may be reviewed or withdrawn for serious misconduct, non-participation, "
                "false information or failure to meet agreed conditions."
            ),
        },
    ],
    "closing_title": "Equality, confidentiality and fair review",
    "closing_description": (
        "Applications should be handled fairly, respectfully and confidentially. The Institute "
        "will seek to avoid unlawful discrimination and will consider equality, safeguarding, "
        "data protection, suitability and conflict-of-interest principles when reviewing applications."
    ),
}

APPLICATION_PROCESS = {
    "eyebrow": "How to Apply",
    "title": "A clear email application process for the launch phase.",
    "description": (
        "Applicants do not need to create an online account. Prepare the information below "
        "and email the Institute directly."
    ),
    "cta_label": "Start Application Email",
    "cta_url": APPLICATION_URL,
    "email": APPLICATION_EMAIL,
    "subject": "Scholarship or Bursary Application",
    "steps": [
        {
            "title": "Select a scholarship or bursary route",
            "description": (
                "Choose the category that best explains your circumstances, contribution, "
                "transition, need or future potential. More than one route may apply."
            ),
        },
        {
            "title": "Prepare a professional background",
            "description": (
                "Include a CV, LinkedIn profile or short background summary. If your experience "
                "is outside project controls, explain its transferable value."
            ),
        },
        {
            "title": "Write a 500-1,000 word personal statement",
            "description": (
                "Explain your circumstances, motivation, chosen category, relevant service or "
                "experience, barriers faced and the difference support would make."
            ),
        },
        {
            "title": "Add supporting evidence",
            "description": (
                "This may include references, community or service evidence, career plans, "
                "relevant public profiles, transition information or proportionate evidence of need."
            ),
        },
        {
            "title": "Email the Institute",
            "description": (
                "Send the application to office@instituteofprojectcontrols.org. The Institute "
                "may request clarification, further evidence or a short discussion."
            ),
        },
    ],
    "checklist_title": "Include these details in your email.",
    "checklist": [
        "Full name and contact details",
        "Current role or employment circumstances",
        "Scholarship or bursary category",
        "CV or short professional background",
        "500-1,000 word personal statement",
        "Evidence of need, service, impact or potential",
        "Reference, where available",
        "LinkedIn or social media profile, where relevant",
        "Confirmation of commitment to participate",
    ],
}

PARTNERS = {
    "eyebrow": "For Organisations and Donors",
    "title": "Sponsor opportunity, talent and professional mobility.",
    "description": (
        "Employers, consultancies, training providers, universities, recruitment companies, "
        "NGOs, charities, foundations and individual donors can help increase the number and "
        "value of scholarship places. Sponsorship can support one learner, a group, an award "
        "category, a regional community, a professional event or an entire scholarship pathway."
    ),
    "items": [
        {
            "id": "learner",
            "title": "Sponsor one learner",
            "description": "Support an individual's programme or professional development.",
        },
        {
            "id": "category",
            "title": "Sponsor a category",
            "description": "Support veterans, career returners, consultants or emerging talent.",
        },
        {
            "id": "intake",
            "title": "Sponsor an intake",
            "description": "Create a wider cohort-based scholarship or bursary initiative.",
        },
        {
            "id": "development",
            "title": "Sponsor member development",
            "description": "Support events, mentoring, clubs, awards or professional publications.",
        },
    ],
    "cta_label": "Explore Sponsorship",
    "cta_url": "/sponsorship",
}

FAQ = {
    "eyebrow": "Frequently Asked Questions",
    "title": "Questions about eligibility, funding and applications.",
    "description": (
        "Clear information about who may apply, what support can include and how the scheme operates."
    ),
    "items": [
        {
            "question": "Do I need existing project controls knowledge?",
            "answer": (
                "No. Existing technical knowledge is not the main scholarship criterion. "
                "Applicants may be completely new to project controls. The Institute is primarily "
                "interested in character, need, service, motivation, potential and commitment to complete."
            ),
        },
        {
            "question": "Are 40 places guaranteed in every intake?",
            "answer": (
                "No. The Institute aims to support up to 40 places per intake, but the actual number "
                "depends on funding availability, programme capacity, eligibility, application quality "
                "and final approval."
            ),
        },
        {
            "question": "Does every scholarship cover the full programme?",
            "answer": (
                "Not necessarily. Awards may be full, partial or focused on specific professional "
                "development activities. The exact support will be confirmed in writing for each "
                "successful applicant."
            ),
        },
        {
            "question": "Can self-employed professionals and consultants apply?",
            "answer": (
                "Yes. A specific bursary route is available for self-employed professionals, freelancers, "
                "sole traders and consultants who do not have access to a large employer training budget."
            ),
        },
        {
            "question": "Can armed forces veterans and public-service professionals apply?",
            "answer": (
                "Yes. The transition category helps applicants translate transferable leadership, "
                "logistics, planning and risk experience into civilian project controls careers."
            ),
        },
        {
            "question": "Can a person with a previous conviction apply?",
            "answer": (
                "Yes. The Second Chance Career Repositioning category supports positive reintegration "
                "and rebuilding. Applications will be handled fairly and sensitively, while suitability, "
                "safeguarding and relevant requirements may still be considered."
            ),
        },
        {
            "question": "Do all applicants need more than 10,000 social media followers?",
            "answer": (
                "No. A follower threshold is relevant only to the Social Media for Good route and is "
                "not a general scholarship requirement."
            ),
        },
        {
            "question": "What if none of the categories describes me?",
            "answer": (
                "Use the open application route. Explain your circumstances, the barrier you face, "
                "your professional or social contribution and the difference support would make."
            ),
        },
        {
            "question": "Does receiving a scholarship automatically make me a Fellow?",
            "answer": (
                "No. A scholarship may support learning and professional development, but Associate "
                "Fellowship and Fellowship remain competence-based recognition routes with separate "
                "evidence requirements."
            ),
        },
        {
            "question": "Will I have to share my personal story publicly?",
            "answer": (
                "No. Applicants should not be required to disclose private financial, medical, criminal "
                "justice or personal circumstances publicly. A success story may only be shared with "
                "appropriate consent and agreed wording."
            ),
        },
        {
            "question": "Can an employer, university or charity sponsor applicants?",
            "answer": (
                "Yes. Organisations can sponsor individuals, groups, award categories, events, mentoring "
                "and related professional development through the Institute's sponsorship route."
            ),
        },
    ],
}

FINAL_CTA = {
    "eyebrow": "Apply for Opportunity",
    "title": "Take the next step towards a project controls career.",
    "description": (
        "You do not need to already be an expert. Explain who you are, the barrier you face, "
        "the contribution you have made and the professional future you want to build."
    ),
    "primary_cta_label": "Apply for Scholarship or Bursary",
    "primary_cta_url": APPLICATION_URL,
    "secondary_cta_label": "Ask About Eligibility",
    "secondary_cta_url": (
        "mailto:office@instituteofprojectcontrols.org"
        "?subject=Scholarship%20Eligibility%20Enquiry"
    ),
    "tertiary_cta_label": "Sponsor a Learner",
    "tertiary_cta_url": "/sponsorship",
    "email": APPLICATION_EMAIL,
    "address": "39 Maidstone Innovation Centre, Maidstone, Kent, ME14 5FY",
}

CONDITIONS = {
    "eyebrow": "Important Information",
    "title": "Every award is individual.",
    "description": (
        "Support is subject to eligibility, programme availability, funding, capacity, "
        "evidence review and written approval."
    ),
    "items": [
        "Applications do not guarantee an award.",
        "Awards may be full, partial or activity-specific.",
        "Every successful award is confirmed individually in writing.",
    ],
}

SEO = {
    "title": "Project Controls Scholarships & Bursaries",
    "description": (
        "Apply for project controls scholarships and bursaries through the Institute of "
        "Project Controls. Up to 40 places per intake may support eligible learners, "
        "professionals, veterans, career changers, charity leaders, self-employed consultants "
        "and applicants facing barriers."
    ),
    "canonical_path": "/scholarships",
    "noindex": False,
    "nofollow": False,
}


def sync_preview_content(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")
    ScholarshipContent.objects.filter(key="main").update(
        hero=HERO,
        principles=PRINCIPLES,
        commitment=COMMITMENT,
        academic_partners=ACADEMIC_PARTNERS,
        values_intro=VALUES_INTRO,
        values=VALUES,
        eligibility=ELIGIBILITY,
        audiences_intro=AUDIENCES_INTRO,
        audiences=AUDIENCES,
        recipient_commitment=RECIPIENT_COMMITMENT,
        application_process=APPLICATION_PROCESS,
        partners=PARTNERS,
        conditions=CONDITIONS,
        faq=FAQ,
        final_cta=FINAL_CTA,
        seo=SEO,
    )


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0008_redesign_scholarships_page"),
    ]

    operations = [
        migrations.RunPython(sync_preview_content, migrations.RunPython.noop),
    ]
