from django.db import migrations


POPUP_CONTENT = {
    "popup_eyebrow": "IPC Scholarship Fund",
    "popup_title": "IPC funding may be available for this programme.",
    "popup_description": (
        "Eligible applicants may receive support from the IPC Scholarship Fund "
        "towards this programme, which is delivered by Kent Business College. "
        "Funding is subject to eligibility, availability and written approval."
    ),
    "popup_cta_label": "View Programme at Kent",
}


def add_programme_pathway_popup_content(apps, schema_editor):
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
            if item.get("id") in {"level-4", "level-6"}:
                item.update(POPUP_CONTENT)
                changed = True
            updated_items.append(item)

        if changed:
            impact["items"] = updated_items
            ScholarshipContent.objects.filter(pk=content.pk).update(impact=impact)


def remove_programme_pathway_popup_content(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")
    popup_fields = tuple(POPUP_CONTENT)

    for content in ScholarshipContent.objects.all():
        impact = dict(content.impact or {})
        items = impact.get("items")
        if not isinstance(items, list):
            continue

        updated_items = []
        for raw_item in items:
            if not isinstance(raw_item, dict):
                updated_items.append(raw_item)
                continue

            item = dict(raw_item)
            for field in popup_fields:
                item.pop(field, None)
            updated_items.append(item)

        impact["items"] = updated_items
        ScholarshipContent.objects.filter(pk=content.pk).update(impact=impact)


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0016_add_programme_pathway_ctas"),
    ]

    operations = [
        migrations.RunPython(
            add_programme_pathway_popup_content,
            remove_programme_pathway_popup_content,
        ),
    ]
