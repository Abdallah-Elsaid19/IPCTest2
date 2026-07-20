from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0010_eventpagecontent"),
    ]

    operations = [
        migrations.AddField(
            model_name="eventbriteattendeesnapshot",
            name="total_count",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
