from django.db import migrations, models

import ipc_backend.validators


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0010_application_refusal_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name="application",
            name="phone",
            field=models.CharField(
                max_length=80,
                validators=[ipc_backend.validators.validate_uk_telephone],
            ),
        ),
    ]
