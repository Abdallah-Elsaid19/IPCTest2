from django.db import migrations


INDIVIDUAL_PROFILE = (
    "For AI, PMI SP, EVM, Risk, PPC, MSP, Managing Portfolios and PMO "
    "modules, subject to assessment."
)


def add_individual_pmo_module(apps, schema_editor):
    ScholarshipPathwaysContent = apps.get_model(
        "scholarships",
        "ScholarshipPathwaysContent",
    )
    pathways_content = ScholarshipPathwaysContent.objects.filter(key="main").first()
    if pathways_content is not None:
        modules = []
        for offer in pathways_content.modules or []:
            offer = dict(offer)
            if offer.get("id") == "individual-module":
                included = list(offer.get("modules") or [])
                if "PMO" not in included:
                    included.append("PMO")
                offer["modules"] = included
            modules.append(offer)
        pathways_content.modules = modules
        pathways_content.save(update_fields=["modules", "updated_at"])

    ScholarshipGatewayContent = apps.get_model(
        "scholarships",
        "ScholarshipGatewayContent",
    )
    gateway_content = ScholarshipGatewayContent.objects.filter(key="main").first()
    if gateway_content is not None:
        funding = dict(gateway_content.funding or {})
        options = []
        for option in funding.get("options") or []:
            option = dict(option)
            if option.get("percentage") == "50%":
                option["profile"] = INDIVIDUAL_PROFILE
            options.append(option)
        funding["options"] = options
        gateway_content.funding = funding
        gateway_content.save(update_fields=["funding", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0046_scholarship_modules_content"),
    ]

    operations = [
        migrations.RunPython(add_individual_pmo_module, migrations.RunPython.noop),
    ]
