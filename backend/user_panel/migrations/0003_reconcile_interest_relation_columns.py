from django.db import migrations


COLUMN_RENAMES = (
    ("profile_id", "userprofile_id"),
    ("interest_id", "professionalinterest_id"),
)


def reconcile_columns(apps, schema_editor):
    connection = schema_editor.connection
    table = "user_panel_userprofile_interests"
    if table not in connection.introspection.table_names():
        return
    with connection.cursor() as cursor:
        columns = {
            column.name
            for column in connection.introspection.get_table_description(cursor, table)
        }
    quote = schema_editor.quote_name
    for old, new in COLUMN_RENAMES:
        if old in columns and new not in columns:
            schema_editor.execute(
                f"ALTER TABLE {quote(table)} "
                f"RENAME COLUMN {quote(old)} TO {quote(new)}"
            )
            columns.remove(old)
            columns.add(new)


def reverse_columns(apps, schema_editor):
    connection = schema_editor.connection
    table = "user_panel_userprofile_interests"
    if table not in connection.introspection.table_names():
        return
    with connection.cursor() as cursor:
        columns = {
            column.name
            for column in connection.introspection.get_table_description(cursor, table)
        }
    # A legacy-only column retained by 0002 marks a reconciled old schema.
    with connection.cursor() as cursor:
        profile_columns = {
            column.name
            for column in connection.introspection.get_table_description(
                cursor, "user_panel_userprofile"
            )
        }
    if "professional_interests" not in profile_columns:
        return
    quote = schema_editor.quote_name
    for old, new in reversed(COLUMN_RENAMES):
        if new in columns and old not in columns:
            schema_editor.execute(
                f"ALTER TABLE {quote(table)} "
                f"RENAME COLUMN {quote(new)} TO {quote(old)}"
            )
            columns.remove(new)
            columns.add(old)


class Migration(migrations.Migration):
    dependencies = [("user_panel", "0002_seed_professional_interests")]
    operations = [migrations.RunPython(reconcile_columns, reverse_columns)]
