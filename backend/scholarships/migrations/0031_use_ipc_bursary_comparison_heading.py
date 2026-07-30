from django.db import migrations


def update_comparison_heading(apps, schema_editor):
    GatewayContent = apps.get_model("scholarships", "ScholarshipGatewayContent")

    for record in GatewayContent.objects.all():
        comparison = dict(record.comparison or {})
        comparison.update(
            {
                "eyebrow": "IPC Bursary",
                "title": "IPC Bursary",
                "description": (
                    "IPC bursary support is assessed individually and is subject "
                    "to pathway fit, need, approval and available funds."
                ),
            }
        )
        record.comparison = comparison
        record.save(update_fields=["comparison"])


class Migration(migrations.Migration):
    dependencies = [
        (
            "scholarships",
            "0030_make_specialists_mandatory_and_reorder_pathways",
        ),
    ]

    operations = [
        migrations.RunPython(
            update_comparison_heading,
            migrations.RunPython.noop,
        ),
    ]
