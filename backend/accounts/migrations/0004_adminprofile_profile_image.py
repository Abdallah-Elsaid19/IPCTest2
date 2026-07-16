import ipc_backend.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_user_email_ci_unique"),
    ]

    operations = [
        migrations.AddField(
            model_name="adminprofile",
            name="profile_image",
            field=models.ImageField(
                blank=True,
                upload_to=ipc_backend.validators.profile_image_upload_to,
                validators=[ipc_backend.validators.validate_image],
            ),
        ),
    ]
