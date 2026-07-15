import applications.models
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


FORM_DEFINITIONS = {
    "AffIPC": {
        "name": "Affiliate Member Application",
        "required": ["professional_status", "statement_of_interest", "code_of_conduct"],
        "properties": {
            "professional_status": {"type": "string"},
            "statement_of_interest": {"type": "string", "maxLength": 500},
            "background_summary": {"type": "string", "maxLength": 500},
            "areas_of_interest": {"type": "array"},
        },
    },
    "MIPC": {
        "name": "Professional Member Application",
        "required": ["role_summary", "years_in_controls", "professional_statement", "disciplines", "cpd_record"],
        "properties": {
            "role_summary": {"type": "string", "minLength": 20, "maxLength": 1000},
            "years_in_controls": {"type": "string"},
            "professional_statement": {"type": "string", "minLength": 20, "maxLength": 1000},
            "disciplines": {"type": "array"},
            "cpd_record": {"type": "string", "maxLength": 1500},
        },
    },
    "AFIPC_L3": {
        "name": "Associate Fellow Level 3 Application",
        "required": ["professional_statement", "training_summary", "competence_areas", "work_examples", "reference_contact"],
        "properties": {
            "professional_statement": {"type": "string", "minLength": 100, "maxLength": 7000},
            "training_summary": {"type": "string", "maxLength": 2000},
            "competence_areas": {"type": "array"},
            "work_examples": {"type": "string", "maxLength": 3500},
            "reference_contact": {"type": "string", "maxLength": 750},
        },
    },
    "AFIPC_L4": {
        "name": "Associate Fellow Level 4 Application",
        "required": ["professional_statement", "case_study", "competence_areas", "cpd_record", "reference_contact", "discussion_availability"],
        "properties": {
            "professional_statement": {"type": "string", "minLength": 100, "maxLength": 11000},
            "case_study": {"type": "string", "minLength": 100, "maxLength": 8000},
            "competence_areas": {"type": "array"},
            "cpd_record": {"type": "string", "maxLength": 2500},
            "reference_contact": {"type": "string", "maxLength": 750},
            "discussion_availability": {"type": "string", "maxLength": 500},
        },
    },
    "FIPC": {
        "name": "Fellow Application",
        "required": ["professional_statement", "leadership_summary", "case_studies", "competence_domains", "cpd_contribution", "references", "discussion_confirmation"],
        "properties": {
            "professional_statement": {"type": "string", "minLength": 100, "maxLength": 18000},
            "leadership_summary": {"type": "string", "maxLength": 5000},
            "case_studies": {"type": "string", "minLength": 100, "maxLength": 12000},
            "competence_domains": {"type": "array"},
            "cpd_contribution": {"type": "string", "maxLength": 4000},
            "references": {"type": "string", "maxLength": 1500},
        },
    },
}

LEGACY_DETAIL_FIELDS = (
    "job_title",
    "years_experience",
    "professional_background",
    "professional_statement",
    "cpd_evidence",
    "work_evidence",
    "references_text",
)


def migrate_legacy_applications(apps, schema_editor):
    Application = apps.get_model("applications", "Application")
    FormDefinition = apps.get_model("applications", "FormDefinition")
    MembershipGrade = apps.get_model("memberships", "MembershipGrade")

    definitions = {}
    for code, definition in FORM_DEFINITIONS.items():
        form, _ = FormDefinition.objects.update_or_create(
            code=code,
            version=1,
            defaults={
                "name": definition["name"],
                "validation_schema": {
                    "type": "object",
                    "required": definition["required"],
                    "properties": definition["properties"],
                },
                "is_active": True,
            },
        )
        definitions[code] = form

    grades = {grade.code: grade for grade in MembershipGrade.objects.all()}
    for application in Application.objects.all().iterator():
        grade_code = application.grade or getattr(application.membership_grade, "code", None)
        if grade_code not in grades or grade_code not in definitions:
            raise RuntimeError(f"Cannot migrate application {application.pk}: unknown membership grade {grade_code!r}.")

        detail_data = {
            field: getattr(application, field)
            for field in LEGACY_DETAIL_FIELDS
            if getattr(application, field, "") not in (None, "")
        }
        application.membership_grade = grades[grade_code]
        application.form_definition = definitions[grade_code]
        application.form_version = 1
        application.grade_specific_data = detail_data
        application.contact_preference = "email"
        application.submitted_at = application.created_at
        application.save(update_fields=[
            "membership_grade",
            "form_definition",
            "form_version",
            "grade_specific_data",
            "contact_preference",
            "submitted_at",
        ])


def restore_legacy_applications(apps, schema_editor):
    Application = apps.get_model("applications", "Application")
    for application in Application.objects.select_related("membership_grade").all().iterator():
        detail_data = application.grade_specific_data or {}
        application.application_id = application.pk
        application.grade = application.membership_grade.code
        for field in LEGACY_DETAIL_FIELDS:
            setattr(application, field, detail_data.get(field, ""))
        application.save(update_fields=["application_id", "grade", *LEGACY_DETAIL_FIELDS])


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0004_membershipapplication_application_id"),
        ("memberships", "0003_seed_membership_grades"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameModel(old_name="MembershipApplication", new_name="Application"),
        migrations.CreateModel(
            name="FormDefinition",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(max_length=32)),
                ("name", models.CharField(max_length=160)),
                ("version", models.PositiveSmallIntegerField(default=1)),
                ("validation_schema", models.JSONField(blank=True, default=dict)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["code", "-version"],
                "indexes": [models.Index(fields=["code", "is_active"], name="form_code_active_idx")],
                "constraints": [models.UniqueConstraint(fields=("code", "version"), name="uniq_form_code_version")],
            },
        ),
        migrations.AddField(
            model_name="application",
            name="contact_preference",
            field=models.CharField(choices=[("email", "Email"), ("phone", "Phone"), ("either", "Either email or phone")], default="email", max_length=16),
        ),
        migrations.AddField(
            model_name="application",
            name="form_definition",
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name="applications", to="applications.formdefinition"),
        ),
        migrations.AddField(
            model_name="application",
            name="form_version",
            field=models.PositiveSmallIntegerField(default=1, editable=False),
        ),
        migrations.AddField(
            model_name="application",
            name="grade_specific_data",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="application",
            name="submitted_at",
            field=models.DateTimeField(editable=False, null=True),
        ),
        migrations.AlterField(
            model_name="application",
            name="professional_background",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="application",
            name="professional_statement",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.RunPython(migrate_legacy_applications, restore_legacy_applications),
        migrations.RemoveIndex(model_name="application", name="application_status_0c2cae_idx"),
        migrations.RemoveIndex(model_name="application", name="application_email_3716f4_idx"),
        migrations.RemoveIndex(model_name="application", name="application_applica_074bae_idx"),
        migrations.RemoveIndex(model_name="application", name="application_reviewe_e1b2dd_idx"),
        migrations.RemoveField(model_name="application", name="application_id"),
        migrations.RemoveField(model_name="application", name="grade"),
        migrations.RemoveField(model_name="application", name="job_title"),
        migrations.RemoveField(model_name="application", name="years_experience"),
        migrations.RemoveField(model_name="application", name="professional_background"),
        migrations.RemoveField(model_name="application", name="professional_statement"),
        migrations.RemoveField(model_name="application", name="cpd_evidence"),
        migrations.RemoveField(model_name="application", name="work_evidence"),
        migrations.RemoveField(model_name="application", name="references_text"),
        migrations.AlterField(
            model_name="application",
            name="application_reference",
            field=models.CharField(default=applications.models.generate_application_reference, editable=False, max_length=32, unique=True),
        ),
        migrations.AlterField(
            model_name="application",
            name="form_definition",
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="applications", to="applications.formdefinition"),
        ),
        migrations.AlterField(
            model_name="application",
            name="membership_grade",
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="applications", to="memberships.membershipgrade"),
        ),
        migrations.AlterField(
            model_name="application",
            name="submitted_at",
            field=models.DateTimeField(default=django.utils.timezone.now, editable=False),
        ),
        migrations.AlterModelTable(name="application", table="applications_application"),
        migrations.AlterModelOptions(name="application", options={"ordering": ["-created_at"]}),
        migrations.AddIndex(model_name="application", index=models.Index(fields=["status", "membership_grade", "created_at"], name="app_status_grade_created_idx")),
        migrations.AddIndex(model_name="application", index=models.Index(fields=["email"], name="app_email_idx")),
        migrations.AddIndex(model_name="application", index=models.Index(fields=["reviewed_by"], name="app_reviewer_idx")),
        migrations.AddIndex(model_name="application", index=models.Index(fields=["form_definition", "form_version"], name="app_form_version_idx")),
        migrations.AddIndex(model_name="application", index=models.Index(fields=["submitted_at"], name="app_submitted_idx")),
    ]
