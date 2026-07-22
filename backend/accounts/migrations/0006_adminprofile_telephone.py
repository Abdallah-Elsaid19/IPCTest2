from django.db import migrations, models

import ipc_backend.validators


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0005_apiidempotencyrecord"),
    ]

    operations = [
        migrations.AddField(
            model_name="adminprofile",
            name="telephone",
            field=models.CharField(
                blank=True,
                max_length=16,
                validators=[ipc_backend.validators.validate_uk_telephone],
            ),
        ),
    ]
