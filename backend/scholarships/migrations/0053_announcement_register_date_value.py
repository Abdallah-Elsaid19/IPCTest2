from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0052_announcement_recipient_register_content"),
    ]

    operations = [
        migrations.AddField(
            model_name="scholarshipannouncementcontent",
            name="register_date_value",
            field=models.CharField(default="10 September 2026", max_length=160),
        ),
    ]
