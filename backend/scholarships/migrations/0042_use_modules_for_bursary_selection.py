from django.db import migrations, models


MODULE_VALUES = {
    "ai",
    "pmi_sp",
    "evm",
    "risk",
    "ppc",
    "msp",
    "managing_portfolios",
    "stakeholder_management",
    "pmp",
    "pmo",
}


def move_module_selections(apps, schema_editor):
    BursaryApplication = apps.get_model("scholarships", "BursaryApplication")
    for application in BursaryApplication.objects.all().iterator():
        if application.preferred_pathway in MODULE_VALUES:
            application.preferred_modules = [application.preferred_pathway]
            application.preferred_pathway = ""
            application.save(
                update_fields=["preferred_modules", "preferred_pathway"],
            )


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0041_link_bursary_to_submitting_account"),
    ]

    operations = [
        migrations.AddField(
            model_name="bursaryapplication",
            name="preferred_modules",
            field=models.JSONField(default=list),
        ),
        migrations.AlterField(
            model_name="bursaryapplication",
            name="preferred_pathway",
            field=models.CharField(
                blank=True,
                choices=[
                    ("operational", "Operational Pathway"),
                    ("strategic", "Strategic Pathway"),
                    ("chartered", "Chartered Pathway"),
                    ("certified_pmo_professional", "Certified PMO Professional"),
                    ("apm", "APM Pathway"),
                ],
                default="",
                max_length=40,
                verbose_name="legacy preferred pathway",
            ),
        ),
        migrations.RunPython(move_module_selections, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="bursaryapplication",
            name="pathway_fit_reason",
            field=models.TextField(
                verbose_name="reason for requesting an IPC bursary",
            ),
        ),
    ]
