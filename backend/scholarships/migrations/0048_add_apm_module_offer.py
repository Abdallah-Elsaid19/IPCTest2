from django.db import migrations


APM_MODULE_OFFER = {
    "id": "apm-modules",
    "label": "APM modules",
    "title": "APM modules",
    "description": "A 12-month APM package combining PMP and AI in Project Controls.",
    "modules": ["PMP", "AI"],
    "courseCost": "£12,000",
    "ipcSupport": "TBC",
    "amountPayable": "TBC",
    "details": [
        "APM combines the PMP two-module programme with AI in Project Controls.",
        "12-month learning duration.",
        "IPC Fund support and the remaining balance are confirmed after individual assessment.",
    ],
    "bonus": None,
}


def add_apm_module_offer(apps, schema_editor):
    ScholarshipPathwaysContent = apps.get_model(
        "scholarships",
        "ScholarshipPathwaysContent",
    )
    content = ScholarshipPathwaysContent.objects.filter(key="main").first()
    if content is None:
        return

    modules = [
        item
        for item in content.modules or []
        if item.get("id") != APM_MODULE_OFFER["id"]
    ]
    insert_at = next(
        (
            index + 1
            for index, item in enumerate(modules)
            if item.get("id") == "pmp-modules"
        ),
        len(modules),
    )
    modules.insert(insert_at, APM_MODULE_OFFER)
    content.modules = modules
    content.save(update_fields=["modules", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0047_add_individual_pmo_module"),
    ]

    operations = [
        migrations.RunPython(add_apm_module_offer, migrations.RunPython.noop),
    ]
