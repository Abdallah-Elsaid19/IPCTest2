from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0039_expand_bursary_support_details"),
    ]

    operations = [
        migrations.AlterField(
            model_name="bursaryapplication",
            name="emergency_contact_relationship",
            field=models.CharField(blank=True, default="", max_length=120),
        ),
    ]
