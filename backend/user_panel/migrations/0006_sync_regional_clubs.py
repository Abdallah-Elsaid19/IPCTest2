from django.db import migrations


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
        club, _ = Club.objects.update_or_create(
            slug=slug,
            defaults={
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
            },
        )
        for category_name, category_slug in DEFAULT_CATEGORIES:
            DiscussionCategory.objects.get_or_create(
                club=club,
                slug=category_slug,
                defaults={"name": category_name},
            )


class Migration(migrations.Migration):
    dependencies = [
        ("clubs", "0005_update_hero_sponsor_club_cta"),
        ("user_panel", "0005_supportmessage_read_at"),
    ]

    operations = [
        migrations.RunPython(sync_regional_clubs, migrations.RunPython.noop),
    ]
