from django.db import migrations


def update_label(apps, schema_editor):
    Grade = apps.get_model("memberships", "MembershipGrade")
    Grade.objects.filter(code="MIPC").update(short_title="Professional Member")


class Migration(migrations.Migration):
    dependencies = [("memberships", "0007_use_full_membership_grade_names_in_comparison")]
    operations = [migrations.RunPython(update_label, migrations.RunPython.noop)]
