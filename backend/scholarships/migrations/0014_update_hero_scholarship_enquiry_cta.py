from django.db import migrations


def update_hero_scholarship_enquiry_cta(apps, schema_editor):
    ScholarshipContent = apps.get_model("scholarships", "ScholarshipContent")
    content = ScholarshipContent.objects.filter(key="main").first()
    if content is None:
        return

    hero = dict(content.hero or {})
    hero["primary_cta_label"] = "Enquire About Scholarships"
    hero["primary_cta_url"] = "/information-session"
    content.hero = hero
    content.save(update_fields=["hero"])


class Migration(migrations.Migration):
    dependencies = [
        ("scholarships", "0013_remove_application_checklist_and_eligibility_cta"),
    ]

    operations = [
        migrations.RunPython(
            update_hero_scholarship_enquiry_cta,
            migrations.RunPython.noop,
        ),
    ]
