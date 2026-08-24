import django.db.models.deletion
import scholarships.models
from django.conf import settings
from django.db import migrations, models


MODULE_LABELS = {
    "ai": "AI",
    "pmi_sp": "PMI-SP",
    "evm": "EVM",
    "risk": "Risk",
    "ppc": "PPC",
    "msp": "MSP",
    "managing_portfolios": "Managing Portfolios",
    "stakeholder_management": "Stakeholder",
    "pmo_module": "PMO",
    "pmp": "PMP",
    "pmo": "Certified PMO",
    "mba_level_7": "MBA Level 7",
}


def seed_announcement_and_winners(apps, schema_editor):
    AnnouncementContent = apps.get_model("scholarships", "ScholarshipAnnouncementContent")
    BursaryApplication = apps.get_model("scholarships", "BursaryApplication")
    ScholarshipWinner = apps.get_model("scholarships", "ScholarshipWinner")

    AnnouncementContent.objects.get_or_create(key="main")
    applications = BursaryApplication.objects.filter(status="approved").order_by(
        "award_round", "submitted_at", "pk"
    )
    for display_order, application in enumerate(applications, start=1):
        module_values = application.preferred_modules or []
        modules = [MODULE_LABELS[value] for value in module_values if value in MODULE_LABELS]
        first_name = (application.preferred_name or application.first_name or "").strip()
        name = f"{first_name} {(application.last_name or '').strip()}".strip()
        ScholarshipWinner.objects.get_or_create(
            application_id=application.pk,
            defaults={
                "name": name,
                "award": ", ".join(modules),
                "country": application.country,
                "modules": modules,
                "category": "IPC Scholarship Fund",
                "award_year": 2026,
                "award_round": application.award_round,
                "display_order": display_order,
                "is_published": application.approved_media_use_consent,
            },
        )


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("scholarships", "0050_bursary_application_award_round"),
    ]

    operations = [
        migrations.CreateModel(
            name="ScholarshipAnnouncementContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.SlugField(default="main", max_length=40, unique=True)),
                ("announcement_at", models.DateTimeField(default=scholarships.models.default_scholarship_announcement_at)),
                ("announcement_round", models.PositiveSmallIntegerField(default=2)),
                ("is_active", models.BooleanField(default=True)),
                ("fund_label", models.CharField(default="IPC Scholarship Fund · 2026", max_length=180)),
                ("announcement_button_label", models.CharField(default="Scholarship Announcement", max_length=100)),
                ("countdown_eyebrow", models.CharField(default="Announcement countdown", max_length=120)),
                ("countdown_title", models.CharField(default="The next chapter is almost here.", max_length=240)),
                ("countdown_description", models.TextField(default="Approved Round Two IPC scholarship and bursary applicants will be announced on 10 September 2026 at 2:00 PM London time and contacted directly using the details in their application.")),
                ("reminder_button_label", models.CharField(default="Remind me", max_length=80)),
                ("reminder_disclaimer", models.TextField(default="By requesting a reminder, you agree to receive IPC scholarship announcement updates at this email address.")),
                ("previous_round_button_label", models.CharField(default="Scholarship Awardees", max_length=100)),
                ("recipients_eyebrow", models.CharField(default="Official recipient announcement", max_length=160)),
                ("recipients_title", models.CharField(default="2026 IPC Scholarship & Bursary Recipients", max_length=240)),
                ("recipients_description", models.TextField(default="The Institute of Project Controls is pleased to recognise the professionals selected for support through the IPC Scholarship and Bursary Fund.")),
                ("recipients_highlight", models.TextField(default="These are the approved Round Two recipients. Only applications approved for public release are included in this register.")),
                ("empty_title", models.CharField(default="Recipients will be published shortly.", max_length=180)),
                ("empty_description", models.TextField(default="Approved recipient profiles will appear here as soon as they are available.")),
                ("publication_notice", models.TextField(default="Only information approved for public release is shown. Financial values, personal contact details and private circumstances are intentionally excluded.")),
                ("apply_button_label", models.CharField(default="Apply for IPC support", max_length=100)),
                ("seo_title", models.CharField(default="IPC Scholarship Announcement Countdown", max_length=180)),
                ("seo_description", models.TextField(default="Countdown to the Institute of Project Controls Round Two scholarship and bursary announcement on 10 September 2026.")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_scholarship_announcement_content", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "verbose_name": "Scholarship announcement content",
                "verbose_name_plural": "Scholarship announcement content",
                "db_table": "scholarship_announcement_content",
            },
        ),
        migrations.CreateModel(
            name="ScholarshipWinner",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("award", models.TextField(blank=True)),
                ("country", models.CharField(blank=True, max_length=120)),
                ("modules", models.JSONField(blank=True, default=list)),
                ("category", models.CharField(default="IPC Scholarship Fund", max_length=120)),
                ("award_year", models.PositiveSmallIntegerField(default=2026)),
                ("award_round", models.PositiveSmallIntegerField(choices=[(1, "Round 1"), (2, "Round 2")], db_index=True, default=2)),
                ("photo_url", models.URLField(blank=True, max_length=500)),
                ("display_order", models.PositiveIntegerField(db_index=True, default=0)),
                ("is_published", models.BooleanField(db_index=True, default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("application", models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="winner_record", to="scholarships.bursaryapplication")),
            ],
            options={
                "db_table": "scholarship_winners",
                "ordering": ["award_round", "display_order", "name", "pk"],
            },
        ),
        migrations.AddIndex(
            model_name="scholarshipwinner",
            index=models.Index(fields=["award_round", "is_published", "display_order"], name="winner_round_public_order_idx"),
        ),
        migrations.RunPython(seed_announcement_and_winners, migrations.RunPython.noop),
    ]
