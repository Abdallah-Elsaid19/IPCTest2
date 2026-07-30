import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
from django.utils import timezone
import clubs.dashboard_defaults
import ipc_backend.validators


def create_club_pages(apps, schema_editor):
    ClubPageContent = apps.get_model("clubs", "ClubPageContent")
    ClubPagesContent = apps.get_model("clubs", "ClubPagesContent")
    pages = clubs.dashboard_defaults.default_club_pages()
    pages_by_id = {page["id"]: page for page in pages}

    overview = ClubPageContent.objects.filter(key="main").first()
    for regional in overview.regional_clubs if overview else []:
        if not isinstance(regional, dict):
            continue
        page = pages_by_id.get(regional.get("id"))
        if page is None:
            continue
        if regional.get("name"):
            page["location"] = regional["name"]
        if regional.get("description"):
            page["summary"] = regional["description"]
            page["hero"]["summary"] = regional["description"]
        if regional.get("detail"):
            page["description"] = regional["detail"]
            page["about"]["description"] = regional["detail"]
        if regional.get("focus"):
            page["specialism"] = regional["focus"]
            page["about"]["specialism"] = regional["focus"]

    ClubPagesContent.objects.update_or_create(
        key="main",
        defaults={
            "pages": pages,
            "status": "published",
            "is_active": True,
            "published_at": timezone.now(),
        },
    )


class Migration(migrations.Migration):
    dependencies = [
        ("clubs", "0005_update_hero_sponsor_club_cta"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ClubPagesContent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.SlugField(default="main", max_length=40, unique=True)),
                ("pages", models.JSONField(default=clubs.dashboard_defaults.default_club_pages, validators=[ipc_backend.validators.validate_content_section])),
                ("status", models.CharField(choices=[("draft", "Draft"), ("published", "Published")], default="published", max_length=20)),
                ("is_active", models.BooleanField(default=True)),
                ("published_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("updated_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_club_pages_content", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "verbose_name": "Club pages content",
                "verbose_name_plural": "Club pages content",
                "db_table": "club_pages_content",
            },
        ),
        migrations.RunPython(create_club_pages, migrations.RunPython.noop),
    ]
