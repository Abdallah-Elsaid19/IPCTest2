from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("events", "0005_expand_event_url_fields")]

    operations = [
        migrations.AddField(
            model_name="event",
            name="is_hidden_on_site",
            field=models.BooleanField(default=False),
        ),
    ]
