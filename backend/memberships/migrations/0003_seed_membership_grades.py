from django.db import migrations


GRADES = [
    ("AffIPC", "Affiliate Member / AffIPC", "Affiliate", 1),
    ("MIPC", "Professional Member / MIPC", "Professional", 2),
    ("AFIPC_L3", "Associate Fellow Level 3 / AFIPC L3", "Associate Fellow L3", 3),
    ("AFIPC_L4", "Associate Fellow Level 4 / AFIPC L4", "Associate Fellow L4", 4),
    ("FIPC", "Fellow / FIPC", "Fellow", 5),
]


def seed_membership_grades(apps, schema_editor):
    MembershipGrade = apps.get_model("memberships", "MembershipGrade")
    for code, title, short_title, display_order in GRADES:
        MembershipGrade.objects.update_or_create(
            code=code,
            defaults={
                "title": title,
                "short_title": short_title,
                "display_order": display_order,
                "is_active": True,
            },
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ("memberships", "0002_membershipgradebenefit_membershipgraderequirement_and_more"),
    ]

    operations = [
        migrations.RunPython(seed_membership_grades, noop_reverse),
    ]