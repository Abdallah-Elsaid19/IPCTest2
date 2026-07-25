from django.db import migrations


def update_links(apps, schema_editor):
    Content = apps.get_model("services", "ServiceContent")
    content = Content.objects.filter(key="main").first()
    if not content:
        return
    links = {
        "Employers": ("/employers", "Explore employer capability"),
        "Consultancies": ("/partnerships", "Explore partnerships"),
        "Academic & training partners": ("/partnerships", "Explore academic partnership"),
    }
    for item in content.audiences.get("items", []):
        if item.get("title") in links:
            item["cta_url"], item["cta_label"] = links[item["title"]]
    items = content.audiences.setdefault("items", [])
    if not any(item.get("id") == "authors" for item in items):
        items.append({"id": "authors", "icon": "ri-article-line", "title": "Authors & researchers", "description": "Magazine articles, technical cases, papers and research notes subject to editorial review.", "cta_label": "Explore publication routes", "cta_url": "/publications"})
    content.save(update_fields=["audiences", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("services", "0002_seed_service_content")]
    operations = [migrations.RunPython(update_links, migrations.RunPython.noop)]
