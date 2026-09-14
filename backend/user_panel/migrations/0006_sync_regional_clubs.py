import uuid

from django.db import migrations
from django.utils import timezone


DEFAULT_CATEGORIES = (
    ("General", "general"),
    ("Events and CPD", "events-cpd"),
    ("Professional practice", "professional-practice"),
)


def sync_regional_clubs(apps, schema_editor):
    ClubPageContent = apps.get_model("clubs", "ClubPageContent")
    Club = apps.get_model("user_panel", "Club")
    DiscussionCategory = apps.get_model("user_panel", "DiscussionCategory")

    content = ClubPageContent.objects.filter(
        key="main",
        is_active=True,
    ).first()
    if content is None:
        return

    connection = schema_editor.connection
    club_table = Club._meta.db_table
    with connection.cursor() as cursor:
        club_columns = {
            column.name
            for column in connection.introspection.get_table_description(
                cursor,
                club_table,
            )
        }
    has_legacy_private_column = (
        connection.vendor == "sqlite" and "is_private" in club_columns
    )
    category_table = DiscussionCategory._meta.db_table
    with connection.cursor() as cursor:
        category_columns = {
            column.name
            for column in connection.introspection.get_table_description(
                cursor,
                category_table,
            )
        }
    legacy_category_columns = {
        column
        for column in ("created_at", "updated_at", "display_order")
        if column in category_columns
    }

    for item in content.regional_clubs or []:
        slug = str(item.get("id") or "").strip()
        name = str(item.get("name") or "").strip()
        if not slug or not name:
            continue
        description = str(
            item.get("detail")
            or item.get("description")
            or f"IPC regional professional community in {name}."
        ).strip()
        defaults = {
            "name": f"{name} Club",
            "summary": str(
                item.get("description")
                or item.get("label")
                or description
            ).strip(),
            "description": description,
            "location": name,
            "specialism": str(item.get("focus") or item.get("label") or "").strip(),
            "is_active": True,
        }
        club = Club.objects.filter(slug=slug).first()
        if club is not None:
            for field, value in defaults.items():
                setattr(club, field, value)
            club.save(update_fields=[*defaults, "updated_at"])
        elif has_legacy_private_column:
            # Early SQLite development databases retained this unmanaged,
            # required prototype column. Insert it explicitly because SQLite
            # cannot add a default to the existing column in place.
            now = timezone.now()
            fields = [
                "created_at",
                "updated_at",
                "public_id",
                "slug",
                *defaults,
                "is_private",
            ]
            values = [
                now,
                now,
                uuid.uuid4().hex,
                slug,
                *defaults.values(),
                False,
            ]
            quote = schema_editor.quote_name
            placeholders = ", ".join(["%s"] * len(fields))
            schema_editor.execute(
                f"INSERT INTO {quote(club_table)} "
                f"({', '.join(quote(field) for field in fields)}) "
                f"VALUES ({placeholders})",
                values,
            )
            club = Club.objects.get(slug=slug)
        else:
            club = Club.objects.create(slug=slug, **defaults)
        for display_order, (category_name, category_slug) in enumerate(
            DEFAULT_CATEGORIES,
            start=1,
        ):
            category = DiscussionCategory.objects.filter(
                club=club,
                slug=category_slug,
            ).first()
            if category is not None:
                if category.name != category_name:
                    category.name = category_name
                    category.save(update_fields=["name"])
                continue
            if connection.vendor == "sqlite" and legacy_category_columns:
                fields = ["club_id", "name", "slug"]
                values = [club.pk, category_name, category_slug]
                now = timezone.now()
                if "created_at" in legacy_category_columns:
                    fields.append("created_at")
                    values.append(now)
                if "updated_at" in legacy_category_columns:
                    fields.append("updated_at")
                    values.append(now)
                if "display_order" in legacy_category_columns:
                    fields.append("display_order")
                    values.append(display_order)
                quote = schema_editor.quote_name
                placeholders = ", ".join(["%s"] * len(fields))
                schema_editor.execute(
                    f"INSERT INTO {quote(category_table)} "
                    f"({', '.join(quote(field) for field in fields)}) "
                    f"VALUES ({placeholders})",
                    values,
                )
            else:
                DiscussionCategory.objects.create(
                    club=club,
                    slug=category_slug,
                    name=category_name,
                )


class Migration(migrations.Migration):
    dependencies = [
        ("clubs", "0005_update_hero_sponsor_club_cta"),
        ("user_panel", "0005_supportmessage_read_at"),
    ]

    operations = [
        migrations.RunPython(sync_regional_clubs, migrations.RunPython.noop),
    ]
