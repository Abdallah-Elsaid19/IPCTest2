from django.db import migrations


CATEGORIES = {
    "academic": {
        "title": "Academic Awards",
        "description": "Recognising research, insight and emerging professional excellence.",
        "highlights": [
            "Research",
            "Dissertations",
            "Student papers",
            "Emerging talent",
        ],
    },
    "commercial": {
        "title": "Commercial Awards",
        "description": "Teams, innovation and project impact.",
        "highlights": [
            "Teams",
            "Innovation",
            "Transformation",
            "Project delivery impact",
        ],
    },
    "professional": {
        "title": "Professional Awards",
        "description": "Individuals, leaders and mentors.",
        "highlights": [
            "Individuals",
            "Mentors",
            "Leaders",
            "Fellows",
            "Contribution",
        ],
    },
}

PROGRAMMES = {
    "ipc-dissertation-prize": {
        "title": "[Student dissertation or research prize]",
        "description": "[Short description of the purpose, likely entrants and what excellence looks like.]",
        "criteria": [
            "[Student / university / research route]",
            "[Paper, dissertation, applied study or recommendation]",
            "[Confirmed or forthcoming]",
            "[Nomination window]",
        ],
    },
    "ipc-project-controls-team-of-the-year": {
        "title": "[Project-controls team or innovation prize]",
        "description": "[Recognise team excellence, digital transformation, risk/change capability or major project impact.]",
        "criteria": [
            "[Organisation / team / project route]",
            "[Case study, metrics, outcomes and endorsements]",
            "[Confirmed or forthcoming]",
            "[Nomination window]",
        ],
    },
    "ipc-young-professional-award": {
        "title": "[Young professional, mentor or leader prize]",
        "description": "[Celebrate individual growth, professional contribution, leadership, mentoring or public service to the discipline.]",
        "criteria": [
            "[Individual / member / Fellow route]",
            "[Portfolio, references, outcomes and contribution record]",
            "[Confirmed or forthcoming]",
            "[Nomination window]",
        ],
    },
}

NOMINATION_TIMELINE = [
    {
        "phase": "Select a category",
        "period": "01",
        "description": "Choose the route that best matches the person, team, project, research or contribution being recognised.",
    },
    {
        "phase": "Prepare evidence",
        "period": "02",
        "description": "Gather a concise narrative, supporting evidence, outcomes, endorsements and relevant links or attachments.",
    },
    {
        "phase": "Confirm eligibility",
        "period": "03",
        "description": "Clarify whether the route is open to members, partners, students, teams or external nominations where applicable.",
    },
    {
        "phase": "Independent review",
        "period": "04",
        "description": "Assess submissions against the published criteria, evidence quality and professional value.",
    },
    {
        "phase": "Recognition and profile",
        "period": "05",
        "description": "Use finalist and winner status to celebrate excellence across events, publications and professional communication.",
    },
]

IMPACT_BENEFITS = [
    {
        "title": "Create a public platform",
        "description": "Winners, finalists and nominees gain a stronger professional story across CVs, LinkedIn, tenders and speaker profiles.",
    },
    {
        "title": "Recognise applied quality",
        "description": "Celebrate strong evidence, thoughtful practice, meaningful outcomes and useful contribution to the profession.",
    },
    {
        "title": "Connect people and institutions",
        "description": "Bring together members, employers, consultants, universities, sponsors and learners through a shared recognition platform.",
    },
    {
        "title": "Inspire progression",
        "description": "Help students, emerging professionals, teams and leaders understand what high-quality project-controls achievement looks like.",
    },
]

INTEGRITY_PRINCIPLES = [
    {
        "title": "Clear criteria",
        "description": "Each award route should define purpose, eligibility, expected evidence and what excellence looks like.",
    },
    {
        "title": "Independent review",
        "description": "Judging should be fair, balanced and based on evidence rather than profile or commercial influence.",
    },
    {
        "title": "Conflict management",
        "description": "Potential conflicts should be declared and handled appropriately by organisers and judges.",
    },
]


def merge_card_text(existing_items, replacements):
    merged = []
    for index, item in enumerate(existing_items):
        updated = dict(item)
        if index < len(replacements):
            updated.update(replacements[index])
        merged.append(updated)
    return merged


def sync_reference_awards_content(apps, schema_editor):
    AwardCategory = apps.get_model("awards", "AwardCategory")
    AwardProgramme = apps.get_model("awards", "AwardProgramme")
    AwardPageContent = apps.get_model("awards", "AwardPageContent")

    for slug, values in CATEGORIES.items():
        AwardCategory.objects.filter(slug=slug).update(**values)

    for slug, values in PROGRAMMES.items():
        AwardProgramme.objects.filter(slug=slug).update(**values)

    content = AwardPageContent.objects.filter(key="main").first()
    if content is None:
        return

    content.nomination_timeline = NOMINATION_TIMELINE
    content.impact_benefits = merge_card_text(content.impact_benefits, IMPACT_BENEFITS)
    content.integrity_principles = merge_card_text(content.integrity_principles, INTEGRITY_PRINCIPLES)
    content.save(
        update_fields=[
            "nomination_timeline",
            "impact_benefits",
            "integrity_principles",
            "updated_at",
        ]
    )


class Migration(migrations.Migration):
    dependencies = [("awards", "0006_awardpagecontent")]
    operations = [migrations.RunPython(sync_reference_awards_content, migrations.RunPython.noop)]
