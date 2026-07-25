from django.db import migrations


def remove_internal_copy(apps, schema_editor):
    Content = apps.get_model("fund", "FundContent")
    content = Content.objects.filter(key="main").first()
    if not content:
        return
    content.programmes["information_description"] = "Confirmed values, eligibility and dates are published here when a programme opens."
    content.assurance["notice"] = "Impact figures are published only after verification and with a clearly stated reporting period."
    content.save(update_fields=["programmes", "assurance", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("fund", "0004_alter_fundcontent_individual_support")]
    operations = [migrations.RunPython(remove_internal_copy, migrations.RunPython.noop)]
