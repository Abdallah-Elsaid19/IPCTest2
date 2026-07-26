from django.db import migrations


def update_hero_sponsor_cta(apps, schema_editor):
    ClubPageContent = apps.get_model("clubs", "ClubPageContent")
    content = ClubPageContent.objects.filter(key="main").first()
    if content is None:
        return

    hero = dict(content.hero or {})
    hero["secondary_cta_label"] = "Sponsor a Club"
    hero["secondary_cta_url"] = "/information-session"
    content.hero = hero
    content.save(update_fields=["hero", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("clubs", "0004_sync_current_clubs_content"),
    ]

    operations = [
        migrations.RunPython(
            update_hero_sponsor_cta,
            migrations.RunPython.noop,
        ),
    ]
