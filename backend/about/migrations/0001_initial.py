from django.db import migrations, models

import about.models


STATISTICS = [
    {"number": "5", "label": "Membership Grades"},
    {"number": "35+", "label": "Countries"},
    {"number": "8", "label": "Competence Domains"},
    {"number": "12", "label": "Years"},
]

WHY_EXISTS = [
    {"icon": "ri-search-eye-line", "title": "Foresight", "description": "Project controls professionals see ahead — identifying risks, modelling outcomes and enabling informed choices before commitments are made."},
    {"icon": "ri-bar-chart-grouped-line", "title": "Evidence", "description": "Every recommendation, forecast and assessment is grounded in data, analysis and professional judgement — not assumption or optimism."},
    {"icon": "ri-scales-3-line", "title": "Accountability", "description": "Controls professionals take responsibility for the quality, validity and timeliness of the information that shapes major decisions."},
]

VISION_PILLARS = [
    {"icon": "ri-home-smile-line", "title": "Trusted Professional Home"},
    {"icon": "ri-seedling-line", "title": "Stronger Talent Pipeline"},
    {"icon": "ri-vip-crown-line", "title": "A Respected Profession"},
]

MISSIONS = [
    {"icon": "ri-award-line", "title": "Advance Professional Recognition", "description": "A structured route for professionals to demonstrate competence, integrity, development and contribution through clear membership grades."},
    {"icon": "ri-bar-chart-grouped-line", "title": "Strengthen Project Delivery", "description": "Promote project controls as an integrated discipline that improves time, cost, risk, quality, safety, carbon, transparency and accountability."},
    {"icon": "ri-team-line", "title": "Build Professional Community", "description": "Bring together practitioners, employers, consultants, training providers, academics and learners through events, clubs, awards and publications."},
    {"icon": "ri-door-open-line", "title": "Open Access to Opportunity", "description": "Support learners and career changers through scholarships, bursaries, mentoring, master classes and employer partnerships."},
]

CORE_VALUES = [
    {"icon": "ri-shield-check-line", "title": "Integrity", "description": "Present data and professional standing honestly. Reports, forecasts and claims should be evidence-led."},
    {"icon": "ri-brain-line", "title": "Competence", "description": "Recognition based on relevant knowledge, skills, behaviours, judgement and evidence."},
    {"icon": "ri-hand-heart-line", "title": "Accountability", "description": "Take responsibility for the quality, validity and timeliness of project information."},
    {"icon": "ri-lightbulb-flash-line", "title": "Independence", "description": "Support project management while retaining independence to challenge weak assumptions."},
    {"icon": "ri-group-line", "title": "Collaboration", "description": "Work with engineers, commercial teams, planners, PMO, finance and clients."},
    {"icon": "ri-arrow-up-circle-line", "title": "Growth", "description": "Maintain CPD, learn from projects, share lessons and improve tools and standards."},
    {"icon": "ri-cpu-line", "title": "Technology", "description": "Use AI, digital systems and analytics to improve insight while protecting data quality."},
    {"icon": "ri-leaf-line", "title": "Sustainability", "description": "Help projects understand environmental impact, carbon consequences and responsible delivery."},
]

IDENTITY_SYMBOLS = [
    {"icon": "ri-eye-line", "title": "Wisdom & Judgement", "description": "The owl represents the professional insight and calm authority that project controls brings to complex decisions."},
    {"icon": "ri-focus-3-line", "title": "Insight & Foresight", "description": "The eye represents the analytical clarity and forward-looking perspective that defines the discipline."},
    {"icon": "ri-donut-chart-line", "title": "Control & Evidence", "description": "The circles represent the structured frameworks, data integrity and evidence-based approach of professional controls."},
    {"icon": "ri-flight-takeoff-line", "title": "Progression & Ambition", "description": "The wings represent professional growth, institutional ambition and the career pathway that IPC provides."},
    {"icon": "ri-share-line", "title": "Connection & Contribution", "description": "The dot patterns represent the global community of professionals connected through shared standards and purpose."},
]


def seed_about_content(apps, schema_editor):
    AboutPageContent = apps.get_model("about", "AboutPageContent")
    AboutPageContent.objects.update_or_create(
        key="main",
        defaults={
            "statistics": STATISTICS,
            "why_exists": WHY_EXISTS,
            "vision_pillars": VISION_PILLARS,
            "missions": MISSIONS,
            "core_values": CORE_VALUES,
            "identity_symbols": IDENTITY_SYMBOLS,
            "is_active": True,
        },
    )


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="AboutPageContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.SlugField(default="main", max_length=40, unique=True)),
                ("statistics", models.JSONField(validators=[about.models.validate_statistics])),
                ("why_exists", models.JSONField(validators=[about.models.validate_titled_cards])),
                ("vision_pillars", models.JSONField(validators=[about.models.validate_vision_pillars])),
                ("missions", models.JSONField(validators=[about.models.validate_titled_cards])),
                ("core_values", models.JSONField(validators=[about.models.validate_titled_cards])),
                ("identity_symbols", models.JSONField(validators=[about.models.validate_titled_cards])),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"verbose_name": "About page content", "verbose_name_plural": "About page content", "db_table": "about_content"},
        ),
        migrations.RunPython(seed_about_content, migrations.RunPython.noop),
    ]
