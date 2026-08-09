from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("events", "0015_eventregistration_unique_active_user_event_booking"),
    ]

    operations = [
        migrations.AddField(
            model_name="eventregistration",
            name="account_invite_sent_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
