from django.db import migrations


PMP_DESCRIPTION = "The PMP is worth two credits and has an eight-month learning duration."
PMP_DETAIL = "The PMP is worth two credits."
APM_DETAIL = "APM combines the two-credit PMP with AI in Project Controls."
FUNDING_PROFILE = "For the PMP and the PMO / Chartered module package, subject to assessment."


def update_pmp_credit_wording(apps, schema_editor):
    ScholarshipPathwaysContent = apps.get_model(
        "scholarships",
        "ScholarshipPathwaysContent",
    )
    content = ScholarshipPathwaysContent.objects.filter(key="main").first()
    if content is not None:
        modules = []
        for module in content.modules or []:
            module = dict(module)
            if module.get("id") == "pmp-modules":
                module["label"] = "PMP credits"
                if module.get("title") == "PMP two-module programme":
                    module["title"] = "Project Management Professional"
                module["description"] = PMP_DESCRIPTION
                details = list(module.get("details") or [])
                if details:
                    details[0] = PMP_DETAIL
                else:
                    details.append(PMP_DETAIL)
                module["details"] = details
            elif module.get("id") == "apm-modules":
                details = list(module.get("details") or [])
                if details and details[0] == "APM combines the PMP two-module programme with AI in Project Controls.":
                    details[0] = APM_DETAIL
                    module["details"] = details
            modules.append(module)
        content.modules = modules
        content.save(update_fields=["modules", "updated_at"])

    ScholarshipGatewayContent = apps.get_model(
        "scholarships",
        "ScholarshipGatewayContent",
    )
    gateway = ScholarshipGatewayContent.objects.filter(key="main").first()
    if gateway is not None:
        funding = dict(gateway.funding or {})
        options = []
        for option in funding.get("options") or []:
            option = dict(option)
            if (
                option.get("percentage") == "75%"
                and option.get("profile")
                == "For PMP modules and the PMO / Chartered module package, subject to assessment."
            ):
                option["profile"] = FUNDING_PROFILE
            options.append(option)
        funding["options"] = options
        gateway.funding = funding
        gateway.save(update_fields=["funding", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0048_add_apm_module_offer"),
    ]

    operations = [
        migrations.RunPython(update_pmp_credit_wording, migrations.RunPython.noop),
    ]
