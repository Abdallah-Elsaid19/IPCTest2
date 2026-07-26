from django.db import migrations


def update_ipc_partner_label(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")
    content = ScholarshipContent.objects.filter(key="main").first()
    if content is None:
        return

    academic_partners = dict(content.academic_partners or {})
    items = []
    for item in academic_partners.get("items", []):
        updated_item = dict(item)
        if updated_item.get("id") == "ipc":
            updated_item["label"] = "Professional Institution"
        items.append(updated_item)

    academic_partners["items"] = items
    content.academic_partners = academic_partners
    content.save(update_fields=["academic_partners"])


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0010_restore_level_4_and_6_pathways"),
    ]

    operations = [
        migrations.RunPython(update_ipc_partner_label, migrations.RunPython.noop),
    ]
