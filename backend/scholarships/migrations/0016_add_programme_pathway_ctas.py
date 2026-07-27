from django.db import migrations


PATHWAY_CTAS = {
    "level-4": {
        "cta_label": "Apply for IPC Scholarship",
        "cta_url": (
            "https://kentbusinesscollege.com/"
            "associate-project-manager-level-4/"
        ),
    },
    "level-6": {
        "cta_label": "Apply for IPC Scholarship",
        "cta_url": (
            "https://kentbusinesscollege.com/"
            "project-control-professional-level-6/"
        ),
    },
}


def add_programme_pathway_ctas(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")

    for content in ScholarshipContent.objects.all():
        impact = dict(content.impact or {})
        items = impact.get("items")
        if not isinstance(items, list):
            continue

        updated_items = []
        changed = False
        for index, raw_item in enumerate(items):
            if not isinstance(raw_item, dict):
                updated_items.append(raw_item)
                continue

            item = dict(raw_item)
            pathway_id = item.get("id")
            if pathway_id not in PATHWAY_CTAS:
                pathway_id = "level-4" if index == 0 else "level-6" if index == 1 else None

            cta = PATHWAY_CTAS.get(pathway_id)
            if cta:
                item.update(cta)
                changed = True
            updated_items.append(item)

        if changed:
            impact["items"] = updated_items
            ScholarshipContent.objects.filter(pk=content.pk).update(impact=impact)


def remove_programme_pathway_ctas(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")

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
            item.pop("cta_label", None)
            item.pop("cta_url", None)
            updated_items.append(item)

        impact["items"] = updated_items
        ScholarshipContent.objects.filter(pk=content.pk).update(impact=impact)


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0015_scholarshipcontent_fund"),
    ]

    operations = [
        migrations.RunPython(
            add_programme_pathway_ctas,
            remove_programme_pathway_ctas,
        ),
    ]
