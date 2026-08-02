import ipc_backend.validators
from django.db import migrations, models


def preserve_existing_terms(apps, schema_editor):
    BursaryApplication = apps.get_model("scholarships", "BursaryApplication")
    BursaryApplication.objects.filter(
        linkedin_award_post_consent=True,
        second_progress_post_consent=True,
        tag_ipc_consent=True,
        reshare_and_quote_consent=True,
        professional_headshot_consent=True,
        participation_consent=True,
        approved_media_use_consent=True,
        report_restrictions_consent=True,
    ).update(mandatory_terms_accepted=True)


class Migration(migrations.Migration):
    dependencies = [("scholarships", "0037_store_drawn_bursary_signature")]

    operations = [
        migrations.AlterField(model_name="bursaryapplication", name="financial_circumstances", field=models.TextField(blank=True)),
        migrations.AlterField(model_name="bursaryapplication", name="scholarship_outcome", field=models.TextField(blank=True)),
        migrations.AlterField(model_name="bursaryapplication", name="measurable_result", field=models.TextField(blank=True)),
        migrations.AlterField(model_name="bursaryapplication", name="learning_application_and_contribution", field=models.TextField(blank=True)),
        migrations.AddField(model_name="bursaryapplication", name="emergency_contact_full_name", field=models.CharField(default="", max_length=180)),
        migrations.AddField(model_name="bursaryapplication", name="emergency_contact_relationship", field=models.CharField(default="", max_length=120)),
        migrations.AddField(model_name="bursaryapplication", name="emergency_contact_email", field=models.EmailField(blank=True, max_length=254)),
        migrations.AddField(model_name="bursaryapplication", name="emergency_contact_phone", field=models.CharField(default="", max_length=40)),
        migrations.AddField(model_name="bursaryapplication", name="has_disability_or_health_condition", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="bursaryapplication", name="health_problem_categories", field=models.JSONField(default=list)),
        migrations.AddField(model_name="bursaryapplication", name="primary_health_problem", field=models.CharField(blank=True, max_length=80)),
        migrations.AddField(model_name="bursaryapplication", name="identity_document", field=models.FileField(blank=True, upload_to=ipc_backend.validators.bursary_identity_upload_to, validators=[ipc_backend.validators.validate_identity_document])),
        migrations.AddField(model_name="bursaryapplication", name="applicant_photo", field=models.ImageField(blank=True, upload_to=ipc_backend.validators.bursary_photo_upload_to, validators=[ipc_backend.validators.validate_image])),
        migrations.AddField(model_name="bursaryapplication", name="mandatory_terms_accepted", field=models.BooleanField(default=False)),
        migrations.RunPython(preserve_existing_terms, migrations.RunPython.noop),
    ]
