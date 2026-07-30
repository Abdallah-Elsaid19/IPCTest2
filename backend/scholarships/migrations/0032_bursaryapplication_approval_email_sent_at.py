from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0031_use_ipc_bursary_comparison_heading"),
    ]

    operations = [
        migrations.AddField(
            model_name="bursaryapplication",
            name="approval_email_sent_at",
            field=models.DateTimeField(blank=True, editable=False, null=True),
        ),
    ]
