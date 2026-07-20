from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0004_adminprofile_profile_image"),
    ]

    operations = [
        migrations.CreateModel(
            name="ApiIdempotencyRecord",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("key", models.CharField(max_length=72, unique=True)),
                ("method", models.CharField(max_length=8)),
                ("path", models.CharField(max_length=255)),
                ("fingerprint", models.CharField(max_length=128)),
                ("user_identifier", models.CharField(blank=True, max_length=64)),
                ("processing_status", models.CharField(choices=[("processing", "Processing"), ("completed", "Completed")], default="processing", max_length=16)),
                ("response_status", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("response_body", models.BinaryField(blank=True, default=bytes)),
                ("response_content_type", models.CharField(default="application/json", max_length=120)),
                ("expires_at", models.DateTimeField(db_index=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
