from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("newsletter", "0002_newslettersignup_source_and_more")]

    operations = [
        migrations.CreateModel(
            name="ScholarshipAnnouncementReminder",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("consent", models.BooleanField(default=True)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("last_email_sent_at", models.DateTimeField(blank=True, editable=False, null=True)),
                ("email_send_count", models.PositiveIntegerField(default=0, editable=False)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="scholarshipannouncementreminder",
            index=models.Index(fields=["is_active", "created_at"], name="schrem_active_created_idx"),
        ),
        migrations.AddIndex(
            model_name="scholarshipannouncementreminder",
            index=models.Index(fields=["last_email_sent_at"], name="schrem_last_sent_idx"),
        ),
    ]
