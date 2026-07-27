from django.db import migrations


INTRO_CONTENT = {
    "eyebrow": "Kent Business College Partner Programmes",
    "title": "Choose the programme that matches your professional direction.",
    "description": (
        "IPC scholarship funding focuses on two flagship Kent Business College "
        "pathways: Associate Project Manager Level 4 and Project Controls "
        "Professional Level 6."
    ),
    "secondary_description": (
        "Explore the official Kent Business College programme page first, then "
        "apply to IPC for scholarship consideration. Kent Business College "
        "confirms programme suitability and admission; IPC confirms the "
        "scholarship contribution."
    ),
}


def update_programme_pathways_intro(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")

    for content in ScholarshipContent.objects.all():
        impact = dict(content.impact or {})
        impact.update(INTRO_CONTENT)
        ScholarshipContent.objects.filter(pk=content.pk).update(impact=impact)


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0017_add_programme_pathway_popup_content"),
    ]

    operations = [
        migrations.RunPython(
            update_programme_pathways_intro,
            migrations.RunPython.noop,
        ),
    ]
