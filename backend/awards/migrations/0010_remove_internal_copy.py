from django.db import migrations


def remove_internal_copy(apps, schema_editor):
    Content = apps.get_model("awards", "AwardPageContent")
    content = Content.objects.filter(key="main").first()
    if not content:
        return
    content.featured_intro.update({
        "eyebrow": "Featured award routes",
        "title": "Recognition routes for achievement, contribution and emerging talent.",
        "description": "Explore confirmed awards and prize routes across academic excellence, commercial innovation, professional contribution and special recognition. Availability and nomination windows are published for each programme.",
    })
    for item in content.faq.get("items", []):
        if "CMS-ready" in item.get("answer", "") or "placeholders" in item.get("answer", ""):
            item.update({
                "question": "Where are confirmed categories and nomination windows published?",
                "answer": "Each active programme publishes its confirmed category, eligibility, evidence requirements and nomination window. If none are active, the programme will show as currently unavailable.",
            })
    content.save(update_fields=["featured_intro", "faq", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("awards", "0009_add_information_session_cta")]
    operations = [migrations.RunPython(remove_internal_copy, migrations.RunPython.noop)]
