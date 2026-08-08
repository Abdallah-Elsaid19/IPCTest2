from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0043_sync_module_support_funding_content"),
    ]

    operations = [
        migrations.AlterField(
            model_name="bursaryapplication",
            name="linkedin_profile_url",
            field=models.URLField(blank=True, max_length=500),
        ),
    ]
