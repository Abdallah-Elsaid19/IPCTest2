from django.db import migrations
from django.utils.text import slugify


INTERESTS = [
    "Project Controls",
    "Planning and Scheduling",
    "Cost Control",
    "Risk Management",
    "Earned Value Management",
    "Statistics",
    "Data and Analytics",
    "Artificial Intelligence",
    "Digital Transformation",
    "Sustainability",
    "Net Zero",
    "Carbon Management",
    "Leadership",
    "Commercial Management",
    "Programme Management",
]


TABLE_RENAMES = (
    ("user_panel_competenceinterest", "user_panel_professionalinterest"),
    ("user_panel_programmeopportunity", "user_panel_programme"),
    ("user_panel_clubdiscussioncategory", "user_panel_discussioncategory"),
    ("user_panel_clubdiscussionthread", "user_panel_discussionthread"),
    ("user_panel_clubdiscussionpost", "user_panel_discussionpost"),
    ("user_panel_supportticketmessage", "user_panel_supportmessage"),
    ("user_panel_usercompetenceinterest", "user_panel_userprofile_interests"),
)

COLUMN_RENAMES = (
    ("user_panel_scholarship", "eligibility_criteria", "eligibility"),
    ("user_panel_scholarship", "application_fields", "form_fields"),
    ("user_panel_scholarshipapplication", "personal_statement", "statement"),
)

# Columns from the first User Panel prototype are deliberately retained on
# PostgreSQL so existing data is not discarded. Database defaults prevent
# those now-unmanaged NOT NULL columns from blocking writes by the new models.
LEGACY_DEFAULTS = (
    ("user_panel_userprofile", "professional_interests", "''"),
    ("user_panel_userprofile", "specialisms", "''"),
    ("user_panel_club", "is_private", "FALSE"),
    ("user_panel_discussioncategory", "created_at", "CURRENT_TIMESTAMP"),
    ("user_panel_discussioncategory", "updated_at", "CURRENT_TIMESTAMP"),
    ("user_panel_discussioncategory", "display_order", "0"),
    ("user_panel_discussionthread", "is_deleted", "FALSE"),
    ("user_panel_discussionpost", "public_id", "gen_random_uuid()"),
    ("user_panel_discussionpost", "is_deleted", "FALSE"),
    ("user_panel_clubmessage", "is_deleted", "FALSE"),
    ("user_panel_programme", "public_id", "gen_random_uuid()"),
    ("user_panel_scholarshipapplication", "decision_note", "''"),
    ("user_panel_usernotification", "is_archived", "FALSE"),
    ("user_panel_userprofile_interests", "created_at", "CURRENT_TIMESTAMP"),
)


def _tables(connection):
    return set(connection.introspection.table_names())


def _columns(connection, table):
    with connection.cursor() as cursor:
        return {
            column.name
            for column in connection.introspection.get_table_description(cursor, table)
        }


def reconcile_legacy_schema(apps, schema_editor):
    connection = schema_editor.connection
    tables = _tables(connection)
    legacy_schema = "user_panel_competenceinterest" in tables
    if not legacy_schema:
        return

    quote = schema_editor.quote_name
    for old, new in TABLE_RENAMES:
        if old in tables and new not in tables:
            schema_editor.execute(
                f"ALTER TABLE {quote(old)} RENAME TO {quote(new)}"
            )
            tables.remove(old)
            tables.add(new)

    for table, old, new in COLUMN_RENAMES:
        if table not in tables:
            continue
        columns = _columns(connection, table)
        if old in columns and new not in columns:
            schema_editor.execute(
                f"ALTER TABLE {quote(table)} "
                f"RENAME COLUMN {quote(old)} TO {quote(new)}"
            )

    if connection.vendor == "postgresql":
        for table, column, default in LEGACY_DEFAULTS:
            if table in tables and column in _columns(connection, table):
                schema_editor.execute(
                    f"ALTER TABLE {quote(table)} "
                    f"ALTER COLUMN {quote(column)} SET DEFAULT {default}"
                )


def reverse_legacy_schema(apps, schema_editor):
    connection = schema_editor.connection
    tables = _tables(connection)
    # This marker exists only on a reconciled legacy PostgreSQL schema.
    if (
        "user_panel_userprofile" not in tables
        or "professional_interests"
        not in _columns(connection, "user_panel_userprofile")
    ):
        return

    quote = schema_editor.quote_name
    for table, old, new in reversed(COLUMN_RENAMES):
        if table not in tables:
            continue
        columns = _columns(connection, table)
        if new in columns and old not in columns:
            schema_editor.execute(
                f"ALTER TABLE {quote(table)} "
                f"RENAME COLUMN {quote(new)} TO {quote(old)}"
            )
    for old, new in reversed(TABLE_RENAMES):
        if new in tables and old not in tables:
            schema_editor.execute(
                f"ALTER TABLE {quote(new)} RENAME TO {quote(old)}"
            )
            tables.remove(new)
            tables.add(old)


def seed_interests(apps, schema_editor):
    interest = apps.get_model("user_panel", "ProfessionalInterest")
    for display_order, name in enumerate(INTERESTS, start=1):
        interest.objects.get_or_create(
            slug=slugify(name),
            defaults={"name": name, "display_order": display_order, "is_active": True},
        )


def remove_seeded_interests(apps, schema_editor):
    interest = apps.get_model("user_panel", "ProfessionalInterest")
    interest.objects.filter(slug__in=[slugify(name) for name in INTERESTS]).delete()


class Migration(migrations.Migration):
    dependencies = [("user_panel", "0001_initial")]
    operations = [
        migrations.RunPython(reconcile_legacy_schema, reverse_legacy_schema),
        migrations.RunPython(seed_interests, remove_seeded_interests),
    ]
