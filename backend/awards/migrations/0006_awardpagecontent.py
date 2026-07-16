from django.db import migrations, models

import awards.models


NOMINATION_TIMELINE = [
    {
        "phase": "Call for Nominations",
        "period": "January – March",
        "description": "Submission window opens. Nominations accepted from members, employers, academic partners and sponsors. Self-nomination permitted for professional categories.",
    },
    {
        "phase": "Evidence Submission",
        "period": "April – May",
        "description": "Nominees submit supporting portfolios, case studies, references and documented evidence against published award criteria.",
    },
    {
        "phase": "Independent Review",
        "period": "June – August",
        "description": "Fellows and senior professionals review submissions against criteria. Shortlisting panels convene. Additional evidence may be requested.",
    },
    {
        "phase": "Award Decisions",
        "period": "September",
        "description": "Final panels make award determinations. All nominees receive feedback. Winners and commendations confirmed.",
    },
    {
        "phase": "Recognition Event",
        "period": "October – November",
        "description": "Awards presented at the annual London ceremony. Winners profiled in the professional magazine, website and LinkedIn.",
    },
]

IMPACT_BENEFITS = [
    {
        "icon": "ri-trophy-line",
        "title": "For Members",
        "description": "Awards and publications create a public platform for achievement, contribution and professional visibility.",
    },
    {
        "icon": "ri-school-line",
        "title": "For Academic Partners",
        "description": "Student prizes and papers help connect education to industry needs and professional identity.",
    },
    {
        "icon": "ri-building-line",
        "title": "For Employers",
        "description": "Awards help recognise team excellence, strengthen employer brand and celebrate staff achievement.",
    },
    {
        "icon": "ri-hand-heart-line",
        "title": "For Sponsors",
        "description": "Sponsorship creates ethical visibility and supports social impact, access and professional development.",
    },
]

INTEGRITY_PRINCIPLES = [
    {
        "icon": "ri-shield-check-line",
        "title": "Independent Judging",
        "description": "Awards are judged by Fellows and senior professionals with no conflict of interest.",
    },
    {
        "icon": "ri-file-shield-line",
        "title": "Evidence Required",
        "description": "Submissions must include supporting evidence, case studies or documented contribution.",
    },
    {
        "icon": "ri-eye-off-line",
        "title": "Confidentiality",
        "description": "Sensitive project information should be anonymised. Commercial details remain protected.",
    },
]


def seed_award_page_content(apps, schema_editor):
    AwardPageContent = apps.get_model("awards", "AwardPageContent")
    AwardPageContent.objects.update_or_create(
        key="main",
        defaults={
            "nomination_timeline": NOMINATION_TIMELINE,
            "impact_benefits": IMPACT_BENEFITS,
            "integrity_principles": INTEGRITY_PRINCIPLES,
            "is_active": True,
        },
    )


class Migration(migrations.Migration):
    dependencies = [("awards", "0005_deactivate_fallback_category")]

    operations = [
        migrations.CreateModel(
            name="AwardPageContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.SlugField(default="main", max_length=40, unique=True)),
                ("nomination_timeline", models.JSONField(validators=[awards.models.validate_award_timeline])),
                ("impact_benefits", models.JSONField(validators=[awards.models.validate_award_cards])),
                ("integrity_principles", models.JSONField(validators=[awards.models.validate_award_cards])),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Awards page content",
                "verbose_name_plural": "Awards page content",
                "db_table": "awards_content",
            },
        ),
        migrations.RunPython(seed_award_page_content, migrations.RunPython.noop),
    ]
