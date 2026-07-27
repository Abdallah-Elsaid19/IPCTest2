from django.db import migrations


def remove_programme_popup_title(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")

    for content in ScholarshipContent.objects.all():
        impact = dict(content.impact or {})
        items = impact.get("items")
        if not isinstance(items, list):
            continue

        updated_items = []
        changed = False
        for raw_item in items:
            if not isinstance(raw_item, dict):
                updated_items.append(raw_item)
                continue

            item = dict(raw_item)
            if "popup_title" in item:
                item.pop("popup_title")
                changed = True
            updated_items.append(item)

        if changed:
            impact["items"] = updated_items
            ScholarshipContent.objects.filter(pk=content.pk).update(impact=impact)


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0019_split_programme_pathway_ctas"),
    ]

    operations = [
        migrations.RunPython(
            remove_programme_popup_title,
            migrations.RunPython.noop,
        ),
    ]
