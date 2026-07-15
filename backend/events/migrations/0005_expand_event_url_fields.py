from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("events", "0004_event_eventbrite_metadata")]

    operations = [
        migrations.AlterField(
            model_name="event",
            name="image_url",
            field=models.URLField(blank=True, max_length=500),
        ),
        migrations.AlterField(
            model_name="event",
            name="eventbrite_url",
            field=models.URLField(blank=True, max_length=500),
        ),
    ]
