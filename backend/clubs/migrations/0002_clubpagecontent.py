from django.db import migrations, models

import clubs.models


REGIONAL_CLUBS = [
    {
        "icon": "ri-map-pin-2-line",
        "name": "London",
        "description": "The capital's professional club hosts master classes, technical talks, employer engagement events and mentoring circles. A hub for senior professionals and emerging talent.",
        "label": "Capital",
    },
    {
        "icon": "ri-map-pin-2-line",
        "name": "Nottingham",
        "description": "A regional community connecting East Midlands professionals through talks, networking and student engagement with local universities and employers.",
        "label": "Regional",
    },
    {
        "icon": "ri-map-pin-2-line",
        "name": "Manchester",
        "description": "Serving the North West with regular meetings, site visits, technical sessions and career support for project controls professionals across sectors.",
        "label": "Regional",
    },
    {
        "icon": "ri-map-pin-2-line",
        "name": "Kent – Maidstone",
        "description": "Based at the Maidstone Innovation Centre, this club supports local practitioners, connects with the Institute office and hosts regular professional development events.",
        "label": "Headquarters",
    },
]

ACTIVITIES = [
    {
        "icon": "ri-slideshow-line",
        "title": "Technical Talks",
        "description": "Practical sessions on planning, cost, risk, AI, sustainability, delay analysis and emerging controls methods.",
    },
    {
        "icon": "ri-team-line",
        "title": "Networking",
        "description": "Meet professionals from different sectors, compare methods, hear lessons learned and build your professional network.",
    },
    {
        "icon": "ri-user-follow-line",
        "title": "Mentoring",
        "description": "Structured peer and senior mentoring for early-career members, Associate Fellows and those preparing for higher grades.",
    },
    {
        "icon": "ri-building-line",
        "title": "Site Visits",
        "description": "Visit live projects to understand how controls are applied in practice across construction, infrastructure and engineering.",
    },
    {
        "icon": "ri-briefcase-line",
        "title": "Career Support",
        "description": "Guidance on progression, evidence preparation, CPD planning and professional identity building.",
    },
]

AUDIENCE_VALUES = [
    {
        "icon": "ri-seedling-line",
        "title": "Early-Career Members",
        "description": "Clubs reduce isolation and help new entrants understand the profession, meet employers and identify mentors.",
    },
    {
        "icon": "ri-user-star-line",
        "title": "Senior Professionals",
        "description": "Create opportunities to speak, mentor, judge awards and influence the future direction of the profession.",
    },
    {
        "icon": "ri-tools-line",
        "title": "Practitioners",
        "description": "Practical knowledge exchange across sectors and specialist disciplines that improves day-to-day practice.",
    },
    {
        "icon": "ri-building-2-line",
        "title": "Employers",
        "description": "Build brand presence, support CPD for staff and connect with project controls talent in your region.",
    },
]


def seed_club_content(apps, schema_editor):
    ClubPageContent = apps.get_model("clubs", "ClubPageContent")
    ClubPageContent.objects.update_or_create(
        key="main",
        defaults={
            "regional_clubs": REGIONAL_CLUBS,
            "activities": ACTIVITIES,
            "audience_values": AUDIENCE_VALUES,
            "is_active": True,
        },
    )


class Migration(migrations.Migration):
    dependencies = [("clubs", "0001_initial")]

    operations = [
        migrations.CreateModel(
            name="ClubPageContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.SlugField(default="main", max_length=40, unique=True)),
                ("regional_clubs", models.JSONField(validators=[clubs.models.validate_regional_clubs])),
                ("activities", models.JSONField(validators=[clubs.models.validate_club_cards])),
                ("audience_values", models.JSONField(validators=[clubs.models.validate_club_cards])),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Club page content",
                "verbose_name_plural": "Club page content",
                "db_table": "clubs_content",
            },
        ),
        migrations.RunPython(seed_club_content, migrations.RunPython.noop),
    ]
