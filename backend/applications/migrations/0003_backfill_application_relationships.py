from uuid import uuid4
from django.db import migrations


def backfill_applications(apps, schema_editor):
    MembershipApplication = apps.get_model("applications", "MembershipApplication")
    MembershipGrade = apps.get_model("memberships", "MembershipGrade")
    ApplicationStatusHistory = apps.get_model("applications", "ApplicationStatusHistory")
    grades = {grade.code: grade for grade in MembershipGrade.objects.all()}

    for application in MembershipApplication.objects.all().iterator():
        changed = False
        if not application.application_reference:
            application.application_reference = f"IPC-{uuid4().hex[:10].upper()}"
            changed = True
        if application.grade and not application.membership_grade_id and application.grade in grades:
            application.membership_grade = grades[application.grade]
            changed = True
        if changed:
            application.save(update_fields=["application_reference", "membership_grade"])
        if not ApplicationStatusHistory.objects.filter(application=application).exists():
            ApplicationStatusHistory.objects.create(
                application=application,
                from_status=None,
                to_status=application.status,
                note="Existing application backfilled during database migration.",
            )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("memberships", "0003_seed_membership_grades"),
        ("applications", "0002_applicationreference_applicationstatushistory_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_applications, noop_reverse),
    ]