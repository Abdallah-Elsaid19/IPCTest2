from django.db import migrations, models


def assign_existing_award_rounds(apps, schema_editor):
    BursaryApplication = apps.get_model("scholarships", "BursaryApplication")
    phillip = BursaryApplication.objects.filter(
        first_name__iexact="Phillip",
        last_name__iexact="Gwenhure",
    ).order_by("submitted_at", "pk").first()

    if phillip is None:
        return

    earlier_applications = BursaryApplication.objects.filter(
        submitted_at__lt=phillip.submitted_at,
    ) | BursaryApplication.objects.filter(
        submitted_at=phillip.submitted_at,
        pk__lt=phillip.pk,
    )
    earlier_applications.update(award_round=1)


class Migration(migrations.Migration):
    dependencies = [("scholarships", "0049_correct_pmp_credit_wording")]

    operations = [
        migrations.AddField(
            model_name="bursaryapplication",
            name="award_round",
            field=models.PositiveSmallIntegerField(
                choices=[(1, "Round 1"), (2, "Round 2")],
                db_index=True,
                default=2,
            ),
        ),
        migrations.RunPython(assign_existing_award_rounds, migrations.RunPython.noop),
    ]
