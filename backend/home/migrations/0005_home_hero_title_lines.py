from django.db import migrations


def add_title_lines(apps, schema_editor):
    Content = apps.get_model("home", "HomeContent")
    content = Content.objects.filter(key="main").first()
    if content is None:
        return
    hero = dict(content.hero or {})
    hero["title_lines"] = [
        "Professional recognition for",
        "the people behind credible",
        "project decisions.",
    ]
    content.hero = hero
    content.save(update_fields=["hero", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("home", "0004_preview_17_home_content")]
    operations = [migrations.RunPython(add_title_lines, migrations.RunPython.noop)]
