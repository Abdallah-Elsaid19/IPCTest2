from django.db import migrations, models

import ipc_backend.validators


FUND_CONTENT = {
    "eyebrow": "The IPC Funding Model",
    "title": (
        "IPC contributes 50%–70%. The remaining contribution completes "
        "the scholarship package."
    ),
    "description": (
        "The exact percentage is determined after reviewing applicant need, "
        "circumstances, potential, programme route and available scholarship funds."
    ),
    "secondary_description": (
        "A stronger need-based application may be considered for the higher end of "
        "the funding range. An applicant who has access to employer support, personal "
        "contribution or another sponsor may receive a lower percentage so that the "
        "Fund can support more people."
    ),
    "final_description": (
        "IPC scholarship support is normally applied towards an eligible Kent Business "
        "College programme cost. It is not normally paid to the applicant as an "
        "unrestricted cash award."
    ),
    "ipc_percentage": "50%–70%",
    "ipc_label": "IPC scholarship contribution",
    "cofunding_percentage": "30%–50%",
    "cofunding_label": "Learner, employer, sponsor or approved co-funding",
    "notice_title": "Illustrative funding split only.",
    "notice_description": (
        "The final percentage, eligible cost, payment route and conditions are stated "
        "in the written IPC scholarship award."
    ),
    "is_active": True,
}


def populate_fund_content(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")
    ScholarshipContent.objects.filter(fund={}).update(fund=FUND_CONTENT)


def clear_fund_content(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")
    ScholarshipContent.objects.update(fund={})


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0014_update_hero_scholarship_enquiry_cta"),
    ]

    operations = [
        migrations.AddField(
            model_name="scholarshipcontent",
            name="fund",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.RunPython(populate_fund_content, clear_fund_content),
    ]
