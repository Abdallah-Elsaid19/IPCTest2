from django.db import migrations


CTA_LABEL = "Enquire About Scholarships"
CTA_URL = "/information-session"


def update_scholarship_enquiry_ctas(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")
    content = ScholarshipContent.objects.filter(key="main").first()
    if content is None:
        return

    audiences_intro = dict(content.audiences_intro or {})
    audiences_intro["open_cta_label"] = CTA_LABEL
    audiences_intro["open_cta_url"] = CTA_URL

    application_process = dict(content.application_process or {})
    application_process["cta_label"] = CTA_LABEL
    application_process["cta_url"] = CTA_URL

    final_cta = dict(content.final_cta or {})
    final_cta["primary_cta_label"] = CTA_LABEL
    final_cta["primary_cta_url"] = CTA_URL

    content.audiences_intro = audiences_intro
    content.application_process = application_process
    content.final_cta = final_cta
    content.save(
        update_fields=[
            "audiences_intro",
            "application_process",
            "final_cta",
        ]
    )


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0011_update_ipc_partner_label"),
    ]

    operations = [
        migrations.RunPython(update_scholarship_enquiry_ctas, migrations.RunPython.noop),
    ]
