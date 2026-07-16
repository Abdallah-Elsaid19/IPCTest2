from django.db import migrations, models

import scholarships.models


AUDIENCES = [
    {
        "icon": "ri-graduation-cap-line",
        "title": "Full-time Students",
        "description": "Students on project controls, construction, engineering, quantity surveying, PMO and related programmes who want professional affiliation while studying.",
    },
    {
        "icon": "ri-exchange-line",
        "title": "Career Changers",
        "description": "Professionals from engineering, quantity surveying, estimating, finance, military service, PMO, procurement and business analysis seeking to enter project controls.",
    },
    {
        "icon": "ri-heart-line",
        "title": "Underrepresented Groups",
        "description": "Values-based access routes for learners who may not otherwise have opportunity, supporting diversity and social mobility in the profession.",
    },
    {
        "icon": "ri-user-star-line",
        "title": "Emerging Professionals",
        "description": "Early-career practitioners, apprentices and junior staff who need support to develop foundation competence and build evidence for recognition.",
    },
]

VALUES = [
    {
        "icon": "ri-wallet-3-line",
        "title": "Access to Recognition",
        "description": "Scholarships fund access to project controls education and professional recognition for those who need support.",
    },
    {
        "icon": "ri-links-line",
        "title": "Professional Community",
        "description": "Scholarship recipients join the Institute community, attend events, access clubs and build their professional network from day one.",
    },
    {
        "icon": "ri-book-open-line",
        "title": "Learning Resources",
        "description": "Access to professional magazine content, master classes, CPD activity and thought leadership materials.",
    },
    {
        "icon": "ri-award-line",
        "title": "Career Visibility",
        "description": "Post-nominal use, LinkedIn value, CV strengthening and professional identity that signals commitment to the discipline.",
    },
    {
        "icon": "ri-user-follow-line",
        "title": "Mentoring Support",
        "description": "Structured peer and senior mentoring opportunities through mentoring circles and regional clubs.",
    },
    {
        "icon": "ri-building-2-line",
        "title": "Employer Connections",
        "description": "Events where employers, recruiters and consultants can meet talent and share industry needs.",
    },
]


def seed_scholarship_content(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")
    ScholarshipContent.objects.update_or_create(
        key="main",
        defaults={"audiences": AUDIENCES, "values": VALUES, "is_active": True},
    )


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ScholarshipContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.SlugField(default="main", max_length=40, unique=True)),
                ("audiences", models.JSONField(validators=[scholarships.models.validate_card_collection])),
                ("values", models.JSONField(validators=[scholarships.models.validate_card_collection])),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Scholarship page content",
                "verbose_name_plural": "Scholarship page content",
                "db_table": "scholarships_content",
            },
        ),
        migrations.RunPython(seed_scholarship_content, migrations.RunPython.noop),
    ]

