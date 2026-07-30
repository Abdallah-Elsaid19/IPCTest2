from django.db import migrations


IPC_FUND_FIGURES = {
    "eyebrow": "IPC Fund",
    "title": "IPC Fund support by pathway.",
    "description": (
        "Potential IPC Fund contributions vary by pathway and are confirmed "
        "following assessment."
    ),
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
    "notice": (
        "Percentages are potential maximum contributions, subject to assessment, "
        "eligibility, pathway selection and written confirmation."
    ),
}


def refresh_ipc_fund_figures(apps, schema_editor):
    ScholarshipGatewayContent = apps.get_model(
        "scholarships",
        "ScholarshipGatewayContent",
    )
    ScholarshipGatewayContent.objects.filter(key="main").update(
        funding_figures=IPC_FUND_FIGURES,
    )


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0026_split_scholarship_page_sections"),
    ]

    operations = [
        migrations.RunPython(
            refresh_ipc_fund_figures,
            migrations.RunPython.noop,
        ),
    ]
