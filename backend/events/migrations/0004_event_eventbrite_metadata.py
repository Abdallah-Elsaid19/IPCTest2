from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("events", "0003_eventbriteconnection_event_eventbrite_id_and_more")]

    operations = [
        migrations.AddField(
            model_name="event", name="status",
            field=models.CharField(blank=True, max_length=32),
        ),
        migrations.AddField(
            model_name="event", name="is_online_event",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="event", name="is_featured",
            field=models.BooleanField(default=False),
        ),
    ]
