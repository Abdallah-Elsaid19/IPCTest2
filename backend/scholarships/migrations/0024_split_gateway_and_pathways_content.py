import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
import ipc_backend.validators
import scholarships.dashboard_defaults


def copy_pathway_content(apps, schema_editor):
    GatewayContent = apps.get_model("scholarships", "ScholarshipGatewayContent")
    PathwaysContent = apps.get_model("scholarships", "ScholarshipPathwaysContent")

    for source in GatewayContent.objects.all():
        PathwaysContent.objects.update_or_create(
            key=source.key,
            defaults={
                "pathways": source.pathways,
                "pathway_details": source.pathway_details,
                "status": source.status,
                "is_active": source.is_active,
                "published_at": source.published_at,
                "updated_by_id": source.updated_by_id,
            },
        )


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0023_add_gateway_and_pathway_content"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ScholarshipPathwaysContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.SlugField(default="main", max_length=40, unique=True)),
                ("pathways", models.JSONField(default=scholarships.dashboard_defaults.default_pathways, validators=[ipc_backend.validators.validate_content_section])),
                ("pathway_details", models.JSONField(default=scholarships.dashboard_defaults.default_pathway_details, validators=[ipc_backend.validators.validate_content_section])),
                ("status", models.CharField(choices=[("draft", "Draft"), ("published", "Published")], default="published", max_length=16)),
                ("is_active", models.BooleanField(default=True)),
                ("published_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_scholarship_pathways_content", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "verbose_name": "Scholarship pathways content",
                "verbose_name_plural": "Scholarship pathways content",
                "db_table": "scholarships_pathways_content",
            },
        ),
        migrations.RunPython(copy_pathway_content, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="scholarshipgatewaycontent",
            name="pathway_details",
        ),
        migrations.RemoveField(
            model_name="scholarshipgatewaycontent",
            name="pathways",
        ),
    ]
