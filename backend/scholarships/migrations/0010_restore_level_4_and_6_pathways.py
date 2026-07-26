from django.db import migrations


PROGRAMME_PATHWAYS = {
    "eyebrow": "Potential Programme Pathways",
    "title": "Support across practitioner and professional levels.",
    "description": (
        "The scholarship scheme is intended to support access to selected project controls "
        "and project management pathways. The programme offered to an applicant should reflect "
        "eligibility, career stage, existing experience and development need."
    ),
    "items": [
        {
            "id": "level-4",
            "level": "Level 4",
            "title": "Associate Project Manager",
            "description": (
                "An applied pathway for people coordinating projects, leading work packages, "
                "supporting governance, working with stakeholders or moving from technical and "
                "operational roles into structured project delivery."
            ),
            "suitable_for": (
                "Project coordinators, supervisors, team leaders, PMO staff, consultants, "
                "self-employed professionals and emerging managers."
            ),
            "development_aim": (
                "Build applied project leadership, planning, stakeholder, risk, governance "
                "and delivery capability."
            ),
            "ipc_pathway": (
                "May support progression towards Professional Member or Associate Fellow "
                "Level 4 recognition."
            ),
            "theme": "teal",
        },
        {
            "id": "level-6",
            "level": "Level 6",
            "title": "Project Controls Professional",
            "description": (
                "An advanced pathway for experienced practitioners and managers working across "
                "planning, cost, risk, change, forecasting, reporting, assurance, data quality "
                "and project controls leadership."
            ),
            "suitable_for": (
                "Planners, cost professionals, project controllers, risk professionals, managers, "
                "consultants and senior practitioners."
            ),
            "development_aim": (
                "Develop integrated controls judgement, leadership, assurance, strategic reporting "
                "and decision support."
            ),
            "ipc_pathway": (
                "May support progression towards Associate Fellow Level 4 or Fellow Level 6 "
                "recognition, subject to evidence."
            ),
            "theme": "oxblood",
        },
    ],
}


def restore_programme_pathways(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")
    ScholarshipContent.objects.filter(key="main").update(impact=PROGRAMME_PATHWAYS)


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0009_sync_preview_12_content"),
    ]

    operations = [
        migrations.RunPython(restore_programme_pathways, migrations.RunPython.noop),
    ]
