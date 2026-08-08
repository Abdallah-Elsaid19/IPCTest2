from django.db import migrations


EVENTS_TITLE = (
    "Learn what changed the decision not only what appeared on the dashboard."
)


def remove_events_title_dash(apps, schema_editor):
    HomeContent = apps.get_model("home", "HomeContent")
    content = HomeContent.objects.filter(key="main").first()
    if content is None:
        return

    events = dict(content.events or {})
    events["title"] = EVENTS_TITLE
    content.events = events
    content.save(update_fields=["events", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("home", "0005_home_hero_title_lines")]
    operations = [
        migrations.RunPython(remove_events_title_dash, migrations.RunPython.noop),
    ]
