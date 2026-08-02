from django.db import migrations, models

import ipc_backend.validators


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0012_application_applicant_application_current_step_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="application",
            name="phone",
            field=models.CharField(
                max_length=80,
                validators=[ipc_backend.validators.validate_international_telephone],
            ),
        ),
    ]
