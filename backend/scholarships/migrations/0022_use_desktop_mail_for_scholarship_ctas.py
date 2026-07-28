from django.db import migrations
from urllib.parse import quote


IPC_EMAIL = "office@instituteofprojectcontrols.org"

PROGRAMME_SUBJECTS = {
    "level-4": "IPC Scholarship Enquiry - Associate Project Manager Level 4",
    "level-6": "IPC Scholarship Enquiry - Project Controls Professional Level 6",
}


def mailto(subject):
    return f"mailto:{IPC_EMAIL}?subject={quote(subject)}"


def outlook_url(subject):
    return (
        "https://outlook.office.com/mail/deeplink/compose"
        f"?to={quote(IPC_EMAIL)}&subject={quote(subject)}"
    )


def use_desktop_mail(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")

    for content in ScholarshipContent.objects.all():
        fields_to_update = []

        impact = dict(content.impact or {})
        items = impact.get("items")
        if isinstance(items, list):
            updated_items = []
            impact_changed = False
            for raw_item in items:
                if not isinstance(raw_item, dict):
                    updated_items.append(raw_item)
                    continue

                item = dict(raw_item)
                subject = PROGRAMME_SUBJECTS.get(item.get("id"))
                if subject:
                    item["cta_url"] = mailto(subject)
                    impact_changed = True
                updated_items.append(item)

            if impact_changed:
                impact["items"] = updated_items
                content.impact = impact
                fields_to_update.append("impact")

        final_cta = dict(content.final_cta or {})
        if final_cta:
            final_cta["primary_cta_url"] = mailto(
                "IPC Scholarship Application"
            )
            content.final_cta = final_cta
            fields_to_update.append("final_cta")

        if fields_to_update:
            content.save(update_fields=fields_to_update)


def restore_outlook_web(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")

    for content in ScholarshipContent.objects.all():
        fields_to_update = []

        impact = dict(content.impact or {})
        items = impact.get("items")
        if isinstance(items, list):
            updated_items = []
            impact_changed = False
            for raw_item in items:
                if not isinstance(raw_item, dict):
                    updated_items.append(raw_item)
                    continue

                item = dict(raw_item)
                subject = PROGRAMME_SUBJECTS.get(item.get("id"))
                if subject:
                    item["cta_url"] = outlook_url(subject)
                    impact_changed = True
                updated_items.append(item)

            if impact_changed:
                impact["items"] = updated_items
                content.impact = impact
                fields_to_update.append("impact")

        final_cta = dict(content.final_cta or {})
        if final_cta:
            final_cta["primary_cta_url"] = outlook_url(
                "IPC Scholarship Application"
            )
            content.final_cta = final_cta
            fields_to_update.append("final_cta")

        if fields_to_update:
            content.save(update_fields=fields_to_update)


class Migration(migrations.Migration):
    dependencies = [
        (
            "scholarships",
            "0021_refresh_scholarship_journey_conditions_routes_faq",
        ),
    ]

    operations = [
        migrations.RunPython(use_desktop_mail, restore_outlook_web),
    ]
