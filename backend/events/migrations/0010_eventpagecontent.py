from django.db import migrations, models

import events.models


FEATURED_PROGRAMME = {
    "eyebrow": "Featured Programme",
    "title": "London Master Class Events",
    "description": "Premium events covering planning, cost, risk, change, delay, AI, digital project controls, sustainability, leadership and commercial issues. These are major membership value drivers that bring together practitioners, employers, academics and sponsors.",
    "image_url": "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/64e5fe4de8a5414eb9307f7ebe36b446.jpg",
    "image_alt": "London Master Class venue",
    "highlights": [
        {
            "icon": "ri-map-pin-line",
            "title": "Venues",
            "description": "Premium central London venues including ICE, etc.venues and professional conference facilities.",
            "tone": "primary",
        },
        {
            "icon": "ri-group-line",
            "title": "Audience",
            "description": "Members, Fellows, employers and academic partners. Student places available through sponsorship.",
            "tone": "accent",
        },
        {
            "icon": "ri-time-line",
            "title": "Format",
            "description": "Full-day and half-day sessions with expert speakers, workshops, panels and networking.",
            "tone": "primary",
        },
        {
            "icon": "ri-award-line",
            "title": "CPD Value",
            "description": "Certificates of attendance provided for CPD portfolios and recognition applications.",
            "tone": "accent",
        },
    ],
}

FORMATS = [
    {
        "icon": "ri-slideshow-line",
        "title": "Technical Sessions",
        "description": "In-depth presentations on planning, cost, risk, change, delay analysis, AI, digital project controls, sustainability and commercial issues.",
        "image": "https://readdy.ai/api/search-image?query=Professional%20speaker%20presenting%20technical%20data%20on%20large%20screen%20in%20a%20modern%20conference%20room%2C%20audience%20taking%20notes%2C%20clean%20minimal%20aesthetic%2C%20warm%20lighting%2C%20corporate%20training%20atmosphere%2C%20shallow%20depth%20of%20field%2C%20editorial%20quality&width=500&height=350&seq=events-format-tech-01&orientation=landscape",
    },
    {
        "icon": "ri-discuss-line",
        "title": "Roundtables",
        "description": "Senior conversations on project controls challenges, industry trends, data, AI, governance and capability.",
        "image": "https://readdy.ai/api/search-image?query=Small%20group%20of%20senior%20executives%20in%20deep%20discussion%20around%20a%20polished%20wooden%20table%2C%20elegant%20boardroom%20with%20subtle%20gold%20accent%20lighting%2C%20notebooks%20and%20tablets%20on%20table%2C%20refined%20corporate%20atmosphere%2C%20warm%20ambient%20light%2C%20editorial%20style&width=500&height=350&seq=events-format-roundtable-01&orientation=landscape",
    },
    {
        "icon": "ri-user-follow-line",
        "title": "Mentoring Circles",
        "description": "Structured peer and senior mentoring opportunities for early-career members and Associate Fellows.",
        "image": "https://readdy.ai/api/search-image?query=Experienced%20professional%20mentoring%20a%20younger%20colleague%20in%20a%20bright%20modern%20office%20lounge%20area%2C%20natural%20daylight%2C%20comfortable%20armchairs%2C%20genuine%20engaged%20conversation%2C%20warm%20neutral%20tones%2C%20professional%20yet%20approachable%20atmosphere%2C%20editorial%20photography&width=500&height=350&seq=events-format-mentor-01&orientation=landscape",
    },
    {
        "icon": "ri-briefcase-line",
        "title": "Employer Engagement",
        "description": "Events where employers, recruiters, consultants and academic partners can meet talent and share industry needs.",
        "image": "https://readdy.ai/api/search-image?query=Professional%20networking%20event%20in%20a%20modern%20venue%20with%20standing%20tables%2C%20diverse%20professionals%20exchanging%20business%20cards%20and%20conversing%2C%20warm%20evening%20lighting%2C%20elegant%20corporate%20setting%2C%20name%20badges%2C%20drinks%20in%20hand%2C%20sophisticated%20atmosphere%2C%20editorial%20quality&width=500&height=350&seq=events-format-employer-01&orientation=landscape",
    },
]

AUDIENCES = [
    {
        "icon": "ri-seedling-line",
        "title": "Early-Career Members",
        "description": "Events reduce isolation and help new entrants understand the profession, build confidence and identify mentors.",
    },
    {
        "icon": "ri-vip-crown-line",
        "title": "Senior Professionals",
        "description": "Clubs and master classes create opportunities to speak, mentor, judge awards and influence the profession.",
    },
    {
        "icon": "ri-tools-line",
        "title": "Practitioners",
        "description": "Networking creates practical knowledge exchange across sectors and specialist disciplines.",
    },
    {
        "icon": "ri-building-2-line",
        "title": "Employers",
        "description": "Events help employers build brand, support CPD and connect with project controls talent.",
    },
]


def seed_event_page_content(apps, schema_editor):
    EventPageContent = apps.get_model("events", "EventPageContent")
    EventPageContent.objects.update_or_create(
        key="main",
        defaults={
            "featured_programme": FEATURED_PROGRAMME,
            "formats": FORMATS,
            "audiences": AUDIENCES,
            "is_active": True,
        },
    )


class Migration(migrations.Migration):
    dependencies = [("events", "0009_eventbriteattendeesnapshot")]

    operations = [
        migrations.CreateModel(
            name="EventPageContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.SlugField(default="main", max_length=40, unique=True)),
                ("featured_programme", models.JSONField(validators=[events.models.validate_featured_programme])),
                ("formats", models.JSONField(validators=[events.models.validate_event_formats])),
                ("audiences", models.JSONField(validators=[events.models.validate_event_cards])),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Events page content",
                "verbose_name_plural": "Events page content",
                "db_table": "events_content",
            },
        ),
        migrations.RunPython(seed_event_page_content, migrations.RunPython.noop),
    ]
