from django.db import migrations


IPC_BURSARY_FUND_ELIGIBILITY = {
    "eyebrow": "IPC Bursary Fund eligibility",
    "title": "Could the IPC Bursary Fund support your pathway?",
    "description": (
        "IPC assesses every bursary application individually. Support depends on "
        "pathway fit, demonstrated financial need, expected professional benefit, "
        "applicant commitment and available IPC Bursary Fund resources."
    ),
    "criteria": [
        "A valid IPC membership reference linked to your account",
        "A selected IPC pathway that fits your experience and professional goals",
        "Evidence that you cannot reasonably meet the full pathway cost without support",
        "A clear explanation of the career or professional outcome the bursary would enable",
        "A measurable benefit for your role, organisation, sector or professional community",
        "The ability to commit the time required to complete the selected pathway",
        "Disclosure of any employer sponsorship, personal contribution or other available funding",
        "Relevant qualifications, memberships, certifications or professional experience",
        "Acceptance of the bursary participation, progress and publicity terms",
        "Final IPC assessment, approval and availability of bursary funds",
    ],
    "documents_title": "Information IPC may request",
    "documents": [
        "Your valid IPC membership reference",
        "The quoted cost for your selected pathway",
        "Information supporting your financial circumstances",
        "Employer sponsorship or contribution details, where applicable",
        "Relevant qualifications, memberships or certifications",
        "Additional evidence needed to assess pathway fit or financial need",
    ],
    "documents_notice": (
        "IPC will confirm any supporting evidence required during review. "
        "Do not send sensitive documents by unsecured email."
    ),
    "notes": [
        {
            "title": "Individual assessment",
            "description": (
                "Submitting an application does not guarantee an award or a particular "
                "contribution. IPC confirms any approved amount in writing."
            ),
        },
        {
            "title": "Different employment circumstances",
            "description": (
                "Employed, self-employed and unemployed IPC members may be considered "
                "where the pathway, need and intended outcome meet the bursary criteria."
            ),
        },
    ],
}


def update_eligibility(apps, schema_editor):
    ScholarshipGatewayContent = apps.get_model(
        "scholarships",
        "ScholarshipGatewayContent",
    )
    ScholarshipGatewayContent.objects.filter(key="main").update(
        eligibility=IPC_BURSARY_FUND_ELIGIBILITY,
    )


class Migration(migrations.Migration):

    dependencies = [
        ("scholarships", "0033_bursaryapplication_rejection_email_sent_at"),
    ]

    operations = [
        migrations.RunPython(update_eligibility, migrations.RunPython.noop),
    ]
