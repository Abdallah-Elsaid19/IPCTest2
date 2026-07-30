from django.db import migrations


PATHWAY_UPDATES = {
    "operational": {
        "modules": [
            {"name": "PMP", "credits": "2 credits", "note": "Mandatory core"},
            {
                "name": "AI in Project Controls Certificate",
                "credits": "1 credit",
                "note": "Mandatory core",
            },
            {
                "name": "Risk Management",
                "credits": "1 credit",
                "note": "Mandatory specialist",
            },
            {
                "name": "Project Planning & Control (PPC)",
                "credits": "1 credit",
                "note": "Mandatory specialist",
            },
            {
                "name": "Choose 1 of 2 operational specialist electives",
                "credits": "1 credit",
                "note": "PMI-SP • Earned Value Management (EVM)",
            },
        ],
        "additional": (
            "PMP, AI in Project Controls, Risk Management and Project Planning "
            "& Control (PPC) are mandatory. Learners choose either PMI-SP or "
            "Earned Value Management (EVM) as the final one-credit elective."
        ),
        "creditNumbers": [2, 1, 1, 1, 1],
    },
    "strategic": {
        "modules": [
            {"name": "PMP", "credits": "2 credits", "note": "Mandatory core"},
            {
                "name": "AI in Project Controls Certificate",
                "credits": "1 credit",
                "note": "Mandatory core",
            },
            {
                "name": "Risk Management",
                "credits": "1 credit",
                "note": "Mandatory specialist",
            },
            {
                "name": "PMO",
                "credits": "1 credit",
                "note": "Mandatory specialist",
            },
            {
                "name": "Choose 1 of 2 strategic specialist electives",
                "credits": "1 credit",
                "note": "MSP • Managing Portfolios",
            },
        ],
        "additional": (
            "PMP, AI in Project Controls, Risk Management and PMO are mandatory. "
            "Learners choose either MSP or Managing Portfolios as the final "
            "one-credit elective."
        ),
        "creditNumbers": [2, 1, 1, 1, 1],
    },
}

PATHWAY_ORDER = {
    "operational": 0,
    "strategic": 1,
    "chartered": 2,
    "pmo": 3,
    "apm": 4,
}


def update_pathway_structure(apps, schema_editor):
    PathwaysContent = apps.get_model("scholarships", "ScholarshipPathwaysContent")

    for record in PathwaysContent.objects.all():
        pages = []
        for page in record.pages:
            if not isinstance(page, dict):
                pages.append(page)
                continue
            pathway_id = page.get("id")
            pages.append({**page, **PATHWAY_UPDATES.get(pathway_id, {})})

        pages.sort(
            key=lambda page: PATHWAY_ORDER.get(page.get("id"), 99)
            if isinstance(page, dict)
            else 100
        )
        record.pages = pages
        record.save(update_fields=["pages"])


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0029_bursaryapplication_membership_reference"),
    ]

    operations = [
        migrations.RunPython(
            update_pathway_structure,
            migrations.RunPython.noop,
        ),
    ]
