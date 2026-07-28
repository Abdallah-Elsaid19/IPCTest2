from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0008_adminnotification"),
    ]

    operations = [
        migrations.AlterField(
            model_name="adminnotification",
            name="notification_type",
            field=models.CharField(
                choices=[
                    ("contact", "Contact"),
                    ("application", "Application"),
                    ("subscriber", "Subscriber"),
                    ("support", "Support"),
                ],
                db_index=True,
                max_length=24,
            ),
        ),
    ]
