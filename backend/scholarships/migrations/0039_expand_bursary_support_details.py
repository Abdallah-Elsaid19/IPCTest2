from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0038_bursary_emergency_information_and_documents"),
    ]

    operations = [
        migrations.AlterField(
            model_name="bursaryapplication",
            name="primary_health_problem",
            field=models.TextField(blank=True),
        ),
    ]
