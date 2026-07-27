from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0012_strengthen_master_class_copy"),
    ]

    operations = [
        migrations.AddField(
            model_name="event",
            name="image_thumbnail_url",
            field=models.URLField(blank=True, max_length=500),
        ),
    ]
