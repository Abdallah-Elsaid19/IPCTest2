from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(
            name="NewsletterSignup",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("name", models.CharField(max_length=160)),
                ("consent", models.BooleanField(default=True)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
