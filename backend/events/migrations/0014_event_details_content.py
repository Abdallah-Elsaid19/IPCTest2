from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0013_event_image_thumbnail_url"),
    ]

    operations = [
        migrations.AddField(
            model_name="event",
            name="details_content",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
