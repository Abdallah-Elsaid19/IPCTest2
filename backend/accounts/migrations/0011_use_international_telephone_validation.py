from django.db import migrations, models

import ipc_backend.validators


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0010_alter_adminnotification_notification_type"),
    ]

    operations = [
        migrations.AlterField(
            model_name="adminprofile",
            name="telephone",
            field=models.CharField(
                blank=True,
                max_length=16,
                validators=[ipc_backend.validators.validate_international_telephone],
            ),
        ),
    ]
