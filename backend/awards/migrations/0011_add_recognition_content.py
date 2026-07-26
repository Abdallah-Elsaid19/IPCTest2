from django.db import migrations, models
import ipc_backend.validators


class Migration(migrations.Migration):
    dependencies = [
        ("awards", "0010_remove_internal_copy"),
    ]

    operations = [
        migrations.AddField(
            model_name="awardpagecontent",
            name="recognition_intro",
            field=models.JSONField(
                default=dict,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="awardpagecontent",
            name="recognition_benefits",
            field=models.JSONField(
                default=list,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
    ]
