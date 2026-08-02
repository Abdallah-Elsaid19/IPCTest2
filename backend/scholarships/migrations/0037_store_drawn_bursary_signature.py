from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0036_make_removed_bursary_funding_fields_optional"),
    ]

    operations = [
        migrations.AlterField(
            model_name="bursaryapplication",
            name="electronic_signature",
            field=models.TextField(blank=True),
        ),
    ]
