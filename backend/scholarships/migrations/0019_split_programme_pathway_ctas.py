from django.db import migrations
from urllib.parse import quote


IPC_EMAIL = "office@instituteofprojectcontrols.org"

PROGRAMMES = {
    "level-4": {
        "programme_cta_label": "View APM at Kent Business College",
        "programme_url": (
            "https://kentbusinesscollege.com/"
            "associate-project-manager-level-4/"
        ),
        "email_subject": (
            "IPC Scholarship Enquiry - Associate Project Manager Level 4"
        ),
    },
    "level-6": {
        "programme_cta_label": "View PCP at Kent Business College",
        "programme_url": (
            "https://kentbusinesscollege.com/"
            "project-control-professional-level-6/"
        ),
        "email_subject": (
            "IPC Scholarship Enquiry - Project Controls Professional Level 6"
        ),
    },
}

POPUP_DESCRIPTION = (
    "Explore the official Kent Business College programme page first, then "
    "apply to IPC for scholarship consideration. Kent Business College "
    "confirms programme suitability and admission; IPC confirms the "
    "scholarship contribution."
)


def outlook_compose_url(subject):
    return (
        "https://outlook.office.com/mail/deeplink/compose"
        f"?to={quote(IPC_EMAIL)}&subject={quote(subject)}"
    )


def split_programme_pathway_ctas(apps, schema_editor):
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
            programme = PROGRAMMES.get(item.get("id"))
            if programme:
                item.update(
                    {
                        "cta_label": "Apply for IPC Scholarship",
                        "cta_url": outlook_compose_url(
                            programme["email_subject"]
                        ),
                        "programme_cta_label": programme[
                            "programme_cta_label"
                        ],
                        "programme_url": programme["programme_url"],
                        "popup_description": POPUP_DESCRIPTION,
                    }
                )
                changed = True
            updated_items.append(item)

        if changed:
            impact["items"] = updated_items
            ScholarshipContent.objects.filter(pk=content.pk).update(impact=impact)


def restore_single_programme_cta(apps, schema_editor):
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
            programme = PROGRAMMES.get(item.get("id"))
            if programme:
                item["cta_url"] = programme["programme_url"]
                item.pop("programme_cta_label", None)
                item.pop("programme_url", None)
            updated_items.append(item)

        impact["items"] = updated_items
        ScholarshipContent.objects.filter(pk=content.pk).update(impact=impact)


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0018_update_programme_pathways_intro"),
    ]

    operations = [
        migrations.RunPython(
            split_programme_pathway_ctas,
            restore_single_programme_cta,
        ),
    ]
