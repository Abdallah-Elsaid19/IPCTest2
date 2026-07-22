from django.core.exceptions import ValidationError
from django.db import migrations

from ipc_backend.validators import normalise_uk_telephone


def backfill_approved_member_telephones(apps, schema_editor):
    Application = apps.get_model("applications", "Application")
    AdminProfile = apps.get_model("accounts", "AdminProfile")

    applications = Application.objects.exclude(approved_user_id=None).exclude(phone="")
    for application in applications.iterator():
        try:
            telephone = normalise_uk_telephone(application.phone)
        except ValidationError:
            # Preserve legacy non-UK data on the application; it requires manual review.
            continue
        AdminProfile.objects.filter(
            user_id=application.approved_user_id,
            telephone="",
        ).update(telephone=telephone)


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0006_adminprofile_telephone"),
        ("applications", "0011_validate_uk_telephone"),
    ]

    operations = [
        migrations.RunPython(backfill_approved_member_telephones, migrations.RunPython.noop),
    ]
