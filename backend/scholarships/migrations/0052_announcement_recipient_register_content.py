from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0051_scholarship_announcement_content_and_winners"),
    ]

    operations = [
        migrations.AddField(
            model_name="scholarshipannouncementcontent",
            name="register_title",
            field=models.CharField(default="Official 2026 Recipient Register", max_length=240),
        ),
        migrations.AddField(
            model_name="scholarshipannouncementcontent",
            name="register_description",
            field=models.TextField(
                default=(
                    "This page is the approved public record of IPC scholarship and bursary "
                    "recipients. Details appear only where publication consent has been confirmed."
                )
            ),
        ),
        migrations.AddField(
            model_name="scholarshipannouncementcontent",
            name="register_date_label",
            field=models.CharField(default="Announcement date", max_length=100),
        ),
        migrations.AddField(
            model_name="scholarshipannouncementcontent",
            name="register_intake_label",
            field=models.CharField(default="Academic intake", max_length=100),
        ),
        migrations.AddField(
            model_name="scholarshipannouncementcontent",
            name="register_intake_value",
            field=models.CharField(default="2026 programme year", max_length=160),
        ),
        migrations.AddField(
            model_name="scholarshipannouncementcontent",
            name="register_total_label",
            field=models.CharField(default="Total 2026 recipients", max_length=120),
        ),
        migrations.AddField(
            model_name="scholarshipannouncementcontent",
            name="register_status_label",
            field=models.CharField(default="Record status", max_length=100),
        ),
        migrations.AddField(
            model_name="scholarshipannouncementcontent",
            name="register_status_value",
            field=models.CharField(default="Official announcement", max_length=160),
        ),
    ]
