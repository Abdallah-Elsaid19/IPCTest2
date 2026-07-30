from django.db import migrations, models
import ipc_backend.validators
import scholarships.dashboard_defaults


def merge_pathway_page_content(apps, schema_editor):
    PathwaysContent = apps.get_model("scholarships", "ScholarshipPathwaysContent")

    for record in PathwaysContent.objects.all():
        details_by_id = {
            item.get("id"): item
            for item in record.pathway_details
            if isinstance(item, dict) and item.get("id")
        }
        pages = []
        for pathway in record.pathways:
            if not isinstance(pathway, dict):
                continue
            detail = dict(details_by_id.get(pathway.get("id"), {}))
            detail.pop("id", None)
            pages.append({**pathway, **detail})

        if pages:
            record.pages = pages
            record.save(update_fields=["pages"])


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0024_split_gateway_and_pathways_content"),
    ]

    operations = [
        migrations.AddField(
            model_name="scholarshippathwayscontent",
            name="pages",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_pathway_pages,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.RunPython(
            merge_pathway_page_content,
            migrations.RunPython.noop,
        ),
        migrations.RemoveField(
            model_name="scholarshippathwayscontent",
            name="pathway_details",
        ),
        migrations.RemoveField(
            model_name="scholarshippathwayscontent",
            name="pathways",
        ),
    ]
