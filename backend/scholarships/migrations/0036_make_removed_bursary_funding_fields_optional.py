from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0035_make_removed_bursary_form_fields_optional"),
    ]

    operations = [
        migrations.AlterField(
            model_name="bursaryapplication",
            name="bursary_amount_requested_gbp",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True),
        ),
        migrations.AlterField(
            model_name="bursaryapplication",
            name="requested_bursary_percentage",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
        migrations.AlterField(
            model_name="bursaryapplication",
            name="proceed_with_lower_bursary",
            field=models.CharField(
                blank=True,
                choices=[
                    ("yes", "Yes"),
                    ("no", "No"),
                    ("discuss", "I would need to discuss the offer"),
                ],
                max_length=16,
            ),
        ),
    ]
