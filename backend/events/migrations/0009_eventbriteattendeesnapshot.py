from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("events", "0008_eventregistration_payment_provider_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="EventbriteAttendeeSnapshot",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("organization_id", models.CharField(max_length=128, unique=True)),
                ("payload", models.JSONField(default=list)),
                ("synced_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-synced_at"]},
        ),
    ]
