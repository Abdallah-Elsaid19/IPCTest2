from django.db import migrations, models
import ipc_backend.validators
import scholarships.dashboard_defaults


SECTION_FIELDS = (
    "hero",
    "partnership",
    "process",
    "funding",
    "government_funding",
    "funding_figures",
    "pathways_intro",
    "learning",
    "ai_spotlight",
    "comparison",
    "all_inclusive",
    "audiences",
    "eligibility",
    "commitment",
    "faq",
    "final_cta",
)


def split_gateway_sections(apps, schema_editor):
    GatewayContent = apps.get_model("scholarships", "ScholarshipGatewayContent")
    defaults = scholarships.dashboard_defaults.default_gateway_content()

    for record in GatewayContent.objects.all():
        gateway = record.gateway if isinstance(record.gateway, dict) else {}
        for field in SECTION_FIELDS:
            setattr(record, field, gateway.get(field, defaults[field]))
        record.save(update_fields=list(SECTION_FIELDS))


def release_legacy_index_name(apps, schema_editor):
    """Avoid a stale legacy index name colliding with the renamed live table."""
    index_name = schema_editor.quote_name(
        "scholarships_content_updated_by_id_8fe8e2e5"
    )
    schema_editor.execute(f"DROP INDEX IF EXISTS {index_name}")


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0025_merge_pathway_page_content"),
    ]

    operations = [
        migrations.AlterModelTable(
            name="scholarshipcontent",
            table="scholarships_legacy_content",
        ),
        migrations.RunPython(
            release_legacy_index_name,
            migrations.RunPython.noop,
        ),
        migrations.AlterModelTable(
            name="scholarshipgatewaycontent",
            table="scholarships_content",
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="hero",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_hero,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="partnership",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_partnership,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="process",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_process,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="funding",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_funding,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="government_funding",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_government_funding,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="funding_figures",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_funding_figures,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="pathways_intro",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_pathways_intro,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="learning",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_learning,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="ai_spotlight",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_ai_spotlight,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="comparison",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_comparison,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="all_inclusive",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_all_inclusive,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="audiences",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_audiences,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="eligibility",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_eligibility,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="commitment",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_commitment,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="faq",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_faq,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.AddField(
            model_name="scholarshipgatewaycontent",
            name="final_cta",
            field=models.JSONField(
                default=scholarships.dashboard_defaults.default_gateway_final_cta,
                validators=[ipc_backend.validators.validate_content_section],
            ),
        ),
        migrations.RunPython(
            split_gateway_sections,
            migrations.RunPython.noop,
        ),
        migrations.RemoveField(
            model_name="scholarshipgatewaycontent",
            name="gateway",
        ),
    ]
