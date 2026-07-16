from django.db import migrations, models

import sponsorship.models


ROUTES = [
    {
        "icon": "ri-graduation-cap-line",
        "title": "Sponsor Learners",
        "description": "Fund access to project controls education and professional recognition. Support learners, career changers, apprentices and students entering the profession.",
    },
    {
        "icon": "ri-calendar-event-line",
        "title": "Sponsor Events",
        "description": "Support master classes, venues, speakers, student places or regional clubs. Create spaces where professionals meet, learn and exchange practice.",
    },
    {
        "icon": "ri-award-line",
        "title": "Sponsor Awards",
        "description": "Support academic, commercial, professional and special recognition prizes without influencing outcome. Celebrate excellence and contribution.",
    },
    {
        "icon": "ri-team-line",
        "title": "Sponsor Clubs",
        "description": "Support London, Nottingham, Manchester or Kent – Maidstone professional clubs. Help build local communities for talks, networking and student engagement.",
    },
    {
        "icon": "ri-book-2-line",
        "title": "Sponsor Publications",
        "description": "Support the professional magazine or research activity with transparent editorial independence. Help the Institute become a knowledge-producing body.",
    },
]

PARTNER_TYPES = [
    {
        "type": "Training Providers",
        "benefits": "Align courses to IPC competence domains, support learners into membership, sponsor events and contribute technical content.",
    },
    {
        "type": "NGOs and Charities",
        "benefits": "Sponsor learners, support second-chance career pathways, veterans, community leaders and people facing barriers to employment.",
    },
    {
        "type": "Recruitment Companies",
        "benefits": "Sponsor career workshops, regional clubs, magazine career pages, emerging talent awards and ethical networking events.",
    },
    {
        "type": "Public Bodies",
        "benefits": "Support professional capability, regional skills development, scholarships and public value through project controls education.",
    },
]

INTEGRITY_PRINCIPLES = [
    {
        "icon": "ri-shield-check-line",
        "title": "Ethical Alignment",
        "description": "Sponsorship must align with the Institute's values of integrity, competence, accountability and professional growth.",
    },
    {
        "icon": "ri-hand-heart-line",
        "title": "No Quid Pro Quo",
        "description": "Sponsors do not receive automatic influence over recognition decisions, award outcomes or editorial content.",
    },
    {
        "icon": "ri-eye-line",
        "title": "Transparency",
        "description": "Sponsorship arrangements are transparent. The Institute publishes sponsor involvement and maintains clear boundaries.",
    },
    {
        "icon": "ri-government-line",
        "title": "Governance",
        "description": "Sponsorship and partnership should not give organisations automatic access to private member data. Engagement is consent-based.",
    },
    {
        "icon": "ri-file-list-3-line",
        "title": "Reporting",
        "description": "The Institute reports on how sponsorship funds are used and the impact on learners, events, awards and community activities.",
    },
]


def seed_sponsorship_content(apps, schema_editor):
    SponsorshipContent = apps.get_model("sponsorship", "SponsorshipContent")
    SponsorshipContent.objects.update_or_create(
        key="main",
        defaults={
            "routes": ROUTES,
            "partner_types": PARTNER_TYPES,
            "integrity_principles": INTEGRITY_PRINCIPLES,
            "is_active": True,
        },
    )


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="SponsorshipContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.SlugField(default="main", max_length=40, unique=True)),
                ("routes", models.JSONField(validators=[sponsorship.models.validate_sponsorship_cards])),
                ("partner_types", models.JSONField(validators=[sponsorship.models.validate_partner_types])),
                ("integrity_principles", models.JSONField(validators=[sponsorship.models.validate_sponsorship_cards])),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Sponsorship page content",
                "verbose_name_plural": "Sponsorship page content",
                "db_table": "sponsorship_content",
            },
        ),
        migrations.RunPython(seed_sponsorship_content, migrations.RunPython.noop),
    ]

