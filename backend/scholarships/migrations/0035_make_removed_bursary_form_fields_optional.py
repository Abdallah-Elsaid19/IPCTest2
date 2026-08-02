from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0034_update_ipc_bursary_fund_eligibility"),
    ]

    operations = [
        migrations.AlterField(
            model_name="bursaryapplication",
            name="preferred_start_month_or_intake",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AlterField(
            model_name="bursaryapplication",
            name="full_legal_name",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AlterField(
            model_name="bursaryapplication",
            name="date_signed",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="bursaryapplication",
            name="electronic_signature",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AlterField(
            model_name="bursaryapplication",
            name="signature_place",
            field=models.CharField(blank=True, max_length=180),
        ),
    ]
