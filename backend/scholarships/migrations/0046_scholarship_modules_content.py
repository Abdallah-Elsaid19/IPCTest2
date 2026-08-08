from django.db import migrations, models

import ipc_backend.validators
import scholarships.dashboard_defaults


def publish_modules_content(apps, schema_editor):
    ScholarshipPathwaysContent = apps.get_model(
        "scholarships",
        "ScholarshipPathwaysContent",
    )
    ScholarshipPathwaysContent.objects.filter(key="main").update(
        modules=scholarships.dashboard_defaults.default_module_offers(),
        is_active=True,
        status="published",
    )


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0045_sync_module_explorer_intro"),
    ]

    operations = [
        migrations.AddField(
            model_name="scholarshippathwayscontent",
            name="modules",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_module_offers,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.RunPython(publish_modules_content, migrations.RunPython.noop),
    ]
