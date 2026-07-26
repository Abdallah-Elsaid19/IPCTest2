from django.db import migrations


def remove_application_checklist_and_eligibility_cta(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")
    content = ScholarshipContent.objects.filter(key="main").first()
    if content is None:
        return

    application_process = dict(content.application_process or {})
    for field in (
        "checklist_title",
        "checklist",
        "cta_label",
        "cta_url",
        "email",
        "subject",
    ):
        application_process.pop(field, None)

    final_cta = dict(content.final_cta or {})
    final_cta.pop("secondary_cta_label", None)
    final_cta.pop("secondary_cta_url", None)

    content.application_process = application_process
    content.final_cta = final_cta
    content.save(update_fields=["application_process", "final_cta"])


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0012_update_scholarship_enquiry_ctas"),
    ]

    operations = [
        migrations.RunPython(
            remove_application_checklist_and_eligibility_cta,
            migrations.RunPython.noop,
        ),
    ]
