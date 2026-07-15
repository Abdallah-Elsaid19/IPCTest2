from django.db import migrations, models


def backfill_application_ids(apps, schema_editor):
    MembershipApplication = apps.get_model("applications", "MembershipApplication")
    for application in MembershipApplication.objects.filter(application_id__isnull=True).iterator():
        application.application_id = application.pk
        application.save(update_fields=["application_id"])


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0003_backfill_application_relationships"),
    ]

    operations = [
        migrations.AddField(
            model_name="membershipapplication",
            name="application_id",
            field=models.IntegerField(blank=True, editable=False, null=True, unique=True),
        ),
        migrations.RunPython(backfill_application_ids, migrations.RunPython.noop),
    ]
