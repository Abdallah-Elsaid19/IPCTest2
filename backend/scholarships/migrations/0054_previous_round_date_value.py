from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0053_announcement_register_date_value"),
    ]

    operations = [
        migrations.AddField(
            model_name="scholarshipannouncementcontent",
            name="previous_round_date_value",
            field=models.CharField(default="12 August 2026", max_length=160),
        ),
    ]
