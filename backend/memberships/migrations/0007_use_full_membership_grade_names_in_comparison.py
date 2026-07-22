from django.db import migrations


FULL_GRADE_NAMES = {
    "affipc": "Affiliate Member",
    "mipc": "Professional Member",
    "afipcL3": "Associate Fellow Level 3",
    "afipcL4": "Associate Fellow Level 4",
    "fipc": "Fellow",
}


def use_full_grade_names(apps, schema_editor):
    MembershipContent = apps.get_model("memberships", "MembershipContent")

    for content in MembershipContent.objects.all().iterator():
        comparison = dict(content.comparison or {})
        columns = comparison.get("columns")
        if not isinstance(columns, list):
            continue

        changed = False
        updated_columns = []
        for column in columns:
            if not isinstance(column, dict):
                updated_columns.append(column)
                continue

            updated_column = dict(column)
            full_name = FULL_GRADE_NAMES.get(updated_column.get("key"))
            if full_name and updated_column.get("label") != full_name:
                updated_column["label"] = full_name
                changed = True
            updated_columns.append(updated_column)

        if changed:
            comparison["columns"] = updated_columns
            content.comparison = comparison
            content.save(update_fields=["comparison", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("memberships", "0006_seed_membership_content"),
    ]

    operations = [
        migrations.RunPython(use_full_grade_names, migrations.RunPython.noop),
    ]
