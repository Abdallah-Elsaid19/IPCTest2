from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("scholarships", "0032_bursaryapplication_approval_email_sent_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="bursaryapplication",
            name="rejection_email_sent_at",
            field=models.DateTimeField(blank=True, editable=False, null=True),
        ),
    ]
