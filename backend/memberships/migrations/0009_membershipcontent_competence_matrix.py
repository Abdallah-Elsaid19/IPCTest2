from django.db import migrations, models

import ipc_backend.validators


COMPETENCE_MATRIX = {
    "eyebrow": "Competence Matrix",
    "title": "Depth of competence expected by grade.",
    "description": (
        "The Institute reviews competence proportionately. A Level 3 applicant "
        "is not judged like a Fellow. A Fellow is expected to show senior "
        "judgement and contribution, not simply long service."
    ),
    "competence_area_label": "Competence area",
    "affipc_label": "AffIPC",
    "mipc_label": "MIPC",
    "afipc_l3_label": "AFIPC L3",
    "afipc_l4_label": "AFIPC L4",
    "fipc_label": "FIPC",
    "rows": [
        {
            "area": "Project lifecycle and governance",
            "affipc": "Awareness",
            "mipc": "Practical awareness",
            "afipc_l3": "Foundation understanding",
            "afipc_l4": "Applied use",
            "fipc": "Strategic governance and assurance",
        },
        {
            "area": "Planning and scheduling",
            "affipc": "Awareness",
            "mipc": "Role exposure",
            "afipc_l3": "Foundation terms and logic",
            "afipc_l4": "Applied schedule control",
            "fipc": "Schedule assurance, strategy and recovery advice",
        },
        {
            "area": "Cost, estimating and forecasting",
            "affipc": "Awareness",
            "mipc": "Basic exposure",
            "afipc_l3": "Foundation cost control concepts",
            "afipc_l4": "Applied cost reporting and forecasting",
            "fipc": "Senior cost engineering judgement and assurance",
        },
        {
            "area": "Risk, change and uncertainty",
            "affipc": "Awareness",
            "mipc": "Basic awareness",
            "afipc_l3": "Understands registers and change logs",
            "afipc_l4": "Analyses implications and supports controls",
            "fipc": "Challenges assumptions and advises on mitigation",
        },
        {
            "area": "Performance reporting and earned value",
            "affipc": "Awareness",
            "mipc": "Can support reporting",
            "afipc_l3": "Understands progress and variance",
            "afipc_l4": "Produces and interprets performance insight",
            "fipc": "Assures reports and influences senior decisions",
        },
        {
            "area": "AI, technology and data quality",
            "affipc": "Digital awareness",
            "mipc": "Tool use",
            "afipc_l3": "Uses software with guidance",
            "afipc_l4": "Validates dashboards and data outputs",
            "fipc": "Leads digital improvement and responsible AI use",
        },
        {
            "area": "Sustainability and net zero",
            "affipc": "Awareness",
            "mipc": "Recognises relevance",
            "afipc_l3": "Understands environmental responsibilities",
            "afipc_l4": "Considers carbon and resource impacts in controls",
            "fipc": "Integrates sustainability into controls strategy",
        },
        {
            "area": "Leadership and influence",
            "affipc": "Personal conduct",
            "mipc": "Team contribution",
            "afipc_l3": "Reliable task ownership",
            "afipc_l4": "Influences project stakeholders",
            "fipc": "Leads people, standards and professional improvement",
        },
    ],
}


def seed_competence_matrix(apps, schema_editor):
    MembershipContent = apps.get_model("memberships", "MembershipContent")
    MembershipContent.objects.filter(key="main").update(
        competence_matrix=COMPETENCE_MATRIX,
    )


class Migration(migrations.Migration):
    dependencies = [
        ("memberships", "0008_professional_member_public_label"),
    ]

    operations = [
        migrations.AddField(
            model_name="membershipcontent",
            name="competence_matrix",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.RunPython(
            seed_competence_matrix,
            migrations.RunPython.noop,
        ),
    ]
