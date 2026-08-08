from django.db import migrations


FUNDING_CONTENT = {
    "eyebrow": "Funding options",
    "title": "Two module-support options. One careful assessment.",
    "description": "Compare the potential IPC contribution and the remaining module cost before requesting a formal assessment.",
    "options": [
        {
            "percentage": "50%",
            "title": "Individual module support",
            "profile": "For AI, PMI SP, EVM, Risk, PPC, MSP, Managing Portfolios and PMO modules, subject to assessment.",
            "detail": "A £4,000 individual module may receive a 50% IPC contribution, leaving £2,000 to pay.",
            "decision": "For a 4-month module, the £2,000 remaining balance may be paid in 8 monthly installments of £250 by Direct Debit, subject to approval.",
        },
        {
            "percentage": "75%",
            "title": "Enhanced module support",
            "profile": "For PMP modules and the PMO / Chartered module package, subject to assessment.",
            "detail": "PMP: £8,000 cost, 75% IPC support and £2,000 to pay. PMO / Chartered modules: £16,000 cost, 75% IPC support and £4,000 to pay.",
            "decision": "For PMO / Chartered modules: £400 non-refundable deposit, followed by 24 monthly installments of £150 by Direct Debit.",
        },
    ],
    "notice": "Module costs, IPC support and installment arrangements are subject to assessment, approval, available funds and written confirmation.",
}


def sync_funding_content(apps, schema_editor):
    ScholarshipGatewayContent = apps.get_model(
        "scholarships",
        "ScholarshipGatewayContent",
    )
    ScholarshipGatewayContent.objects.filter(key="main").update(
        funding=FUNDING_CONTENT,
    )


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0042_use_modules_for_bursary_selection"),
    ]

    operations = [
        migrations.RunPython(sync_funding_content, migrations.RunPython.noop),
    ]
