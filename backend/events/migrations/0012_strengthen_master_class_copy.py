from django.db import migrations


def strengthen_copy(apps, schema_editor):
    Content = apps.get_model("events", "EventPageContent")
    content = Content.objects.filter(key="main").first()
    if not content:
        return
    content.featured_programme.update({
        "eyebrow": "Flagship practitioner programme",
        "title": "London Master Class Series",
        "description": "Flagship practitioner sessions connecting technical depth, professional judgement and cross-sector learning across planning and scheduling, cost and forecasting, risk and uncertainty, change and configuration control, delay and recovery, commercial practice, data and controls systems, AI and analytics, sustainability, productivity, leadership and assurance.",
    })
    content.save(update_fields=["featured_programme", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("events", "0011_eventbriteattendeesnapshot_total_count")]
    operations = [migrations.RunPython(strengthen_copy, migrations.RunPython.noop)]
