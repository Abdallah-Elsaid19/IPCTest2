from django.db import migrations


def deactivate_fallback_category(apps, schema_editor):
    AwardCategory = apps.get_model("awards", "AwardCategory")
    AwardCategory.objects.filter(slug="other").update(is_active=False)


class Migration(migrations.Migration):
    dependencies = [("awards", "0004_awardcategory_programme_relation")]
    operations = [
        migrations.RunPython(deactivate_fallback_category, migrations.RunPython.noop),
    ]
