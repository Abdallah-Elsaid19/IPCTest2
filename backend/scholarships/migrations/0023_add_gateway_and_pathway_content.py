import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
import ipc_backend.validators
import scholarships.dashboard_defaults


def create_gateway_content(apps, schema_editor):
    GatewayContent = apps.get_model("scholarships", "ScholarshipGatewayContent")
    GatewayContent.objects.get_or_create(
        key="main",
        defaults={
            "gateway": scholarships.dashboard_defaults.default_gateway_content(),
            "pathways": scholarships.dashboard_defaults.default_pathways(),
            "pathway_details": scholarships.dashboard_defaults.default_pathway_details(),
            "seo": scholarships.dashboard_defaults.default_gateway_seo(),
            "status": "published",
            "is_active": True,
        },
    )


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0022_use_desktop_mail_for_scholarship_ctas"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ScholarshipGatewayContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.SlugField(default="main", max_length=40, unique=True)),
                ("gateway", models.JSONField(default=scholarships.dashboard_defaults.default_gateway_content, validators=[ipc_backend.validators.validate_content_section])),
                ("pathways", models.JSONField(default=scholarships.dashboard_defaults.default_pathways, validators=[ipc_backend.validators.validate_content_section])),
                ("pathway_details", models.JSONField(default=scholarships.dashboard_defaults.default_pathway_details, validators=[ipc_backend.validators.validate_content_section])),
                ("seo", models.JSONField(default=scholarships.dashboard_defaults.default_gateway_seo, validators=[ipc_backend.validators.validate_content_section])),
                ("status", models.CharField(choices=[("draft", "Draft"), ("published", "Published")], default="published", max_length=16)),
                ("is_active", models.BooleanField(default=True)),
                ("published_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_scholarship_gateway_content", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "verbose_name": "Scholarship gateway content",
                "verbose_name_plural": "Scholarship gateway content",
                "db_table": "scholarships_gateway_content",
            },
        ),
        migrations.RunPython(create_gateway_content, migrations.RunPython.noop),
    ]
