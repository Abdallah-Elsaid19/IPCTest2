from django.db import migrations


MODULE_EXPLORER_INTRO = {
    "eyebrow": "Module explorer",
    "title": "Choose the modules that fit your professional goals.",
    "description": "Compare module costs, potential IPC support and the remaining payment before requesting a formal assessment.",
}


def sync_module_explorer_intro(apps, schema_editor):
    ScholarshipGatewayContent = apps.get_model(
        "scholarships",
        "ScholarshipGatewayContent",
    )
    ScholarshipGatewayContent.objects.filter(key="main").update(
        pathways_intro=MODULE_EXPLORER_INTRO,
    )


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0044_make_linkedin_profile_optional"),
    ]

    operations = [
        migrations.RunPython(sync_module_explorer_intro, migrations.RunPython.noop),
    ]
