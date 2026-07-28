from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("user_panel", "0004_awardnominationdocument"),
    ]

    operations = [
        migrations.AddField(
            model_name="supportmessage",
            name="read_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
