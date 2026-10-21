from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("scholarships", "0056_bursarypaymentinstallment_stripe_hosted_invoice_url_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="bursarypaymentplan",
            name="billing_interval",
            field=models.CharField(
                choices=[
                    ("day", "Daily"),
                    ("week", "Weekly"),
                    ("month", "Monthly"),
                    ("year", "Yearly"),
                ],
                default="month",
                max_length=5,
            ),
        ),
    ]
