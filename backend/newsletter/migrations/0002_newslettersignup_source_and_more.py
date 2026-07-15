from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("newsletter", "0001_initial")]
    operations = [
        migrations.AddField(
            model_name="newslettersignup",
            name="source",
            field=models.CharField(blank=True, max_length=120),
        ),
        migrations.AlterField(
            model_name="newslettersignup",
            name="name",
            field=models.CharField(blank=True, max_length=160),
        ),
        migrations.AddIndex(
            model_name="newslettersignup",
            index=models.Index(fields=["is_active", "created_at"], name="newsletter__is_acti_003fbe_idx"),
        ),
        migrations.AddIndex(
            model_name="newslettersignup",
            index=models.Index(fields=["source"], name="newsletter__source_7a4181_idx"),
        ),
    ]
