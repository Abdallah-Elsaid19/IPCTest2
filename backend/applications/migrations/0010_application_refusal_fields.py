from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0009_application_username_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name="application",
            name="status",
            field=models.CharField(
                choices=[
                    ("submitted", "Submitted"),
                    ("under_review", "Under Review"),
                    ("approved", "Approved"),
                    ("refused", "Refused"),
                ],
                default="submitted",
                max_length=32,
            ),
        ),
        migrations.AlterField(
            model_name="applicationstatushistory",
            name="from_status",
            field=models.CharField(
                blank=True,
                choices=[
                    ("submitted", "Submitted"),
                    ("under_review", "Under Review"),
                    ("approved", "Approved"),
                    ("refused", "Refused"),
                ],
                max_length=32,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name="applicationstatushistory",
            name="to_status",
            field=models.CharField(
                choices=[
                    ("submitted", "Submitted"),
                    ("under_review", "Under Review"),
                    ("approved", "Approved"),
                    ("refused", "Refused"),
                ],
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name="application",
            name="refusal_reason",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="application",
            name="refused_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="application",
            name="refusal_email_sent_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="application",
            name="refused_by",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="refused_membership_applications",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
