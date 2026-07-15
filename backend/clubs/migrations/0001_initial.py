import uuid

from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name="ClubEnquiry",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("email", models.EmailField(max_length=254)),
                ("message", models.TextField(max_length=2000)),
                ("club_name", models.CharField(blank=True, max_length=200)),
                ("club_slug", models.SlugField(blank=True, max_length=200)),
                ("page_url", models.CharField(blank=True, max_length=500)),
                ("status", models.CharField(choices=[("new", "New"), ("contacted", "Contacted"), ("closed", "Closed"), ("spam", "Spam")], default="new", max_length=20)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-created_at"],
                "indexes": [
                    models.Index(fields=["status", "created_at"], name="clubs_clube_status_5f7ec9_idx"),
                    models.Index(fields=["email"], name="clubs_clube_email_538a91_idx"),
                    models.Index(fields=["club_slug"], name="clubs_clube_club_sl_29fb61_idx"),
                ],
            },
        ),
    ]
