from django.db import migrations


def align_home(apps, schema_editor):
    Content = apps.get_model("home", "HomeContent")
    content = Content.objects.filter(key="main").first()
    if not content:
        return
    content.hero.update({
        "title": "The professional home for project controls",
        "description": "Professional recognition, learning and community for those who plan, cost, control, assure and improve complex project delivery across planning, schedule, cost, risk, change, data, commercial practice and leadership.",
        "cta_label": "Explore membership and recognition",
        "annotations": ["Schedule assurance", "Risk and uncertainty", "Cost baseline integrity", "Forecast judgement"],
    })
    for item in content.recognition_pathway.get("items", []):
        if item.get("id") == "professional":
            item.update({"label": "Professional Member", "level": "MIPC", "description": "Recognising active professional involvement and identity in project controls."})
    content.member_value["items"] = [
        {"id": "recognition", "icon": "ri-award-line", "title": "Recognition", "description": "Membership grade, certificate, digital credential, post-nominal and professional identity."},
        {"id": "cpd-development", "icon": "ri-book-open-line", "title": "CPD and development", "description": "Structured learning, reflection, evidence and progression."},
        {"id": "master-classes", "icon": "ri-presentation-line", "title": "London Master Class Series", "description": "Planning, schedule, cost, risk, change, delay, commercial practice, leadership, AI, data and sustainability."},
        {"id": "regional-clubs", "icon": "ri-community-line", "title": "Regional clubs", "description": "London, Nottingham, Manchester and Kent–Maidstone activity where available."},
        {"id": "mentoring", "icon": "ri-user-heart-line", "title": "Mentoring and contribution", "description": "Mentor, volunteer, speak, write and support the profession."},
        {"id": "awards-prizes", "icon": "ri-trophy-line", "title": "Awards and prizes", "description": "Academic, commercial, professional and special-recognition routes."},
        {"id": "publications", "icon": "ri-article-line", "title": "Publications", "description": "Professional magazine articles, interviews, event reflections, case studies and thought leadership.", "path": "/publications"},
        {"id": "research", "icon": "ri-flask-line", "title": "Journal and research", "description": "Academic papers, research notes and collaboration between education, employers and practice.", "path": "/publications"},
    ]
    content.organisational_value.update({
        "primary_cta_label": "Employers", "primary_cta_url": "/employers",
        "secondary_cta_label": "Partnerships", "secondary_cta_url": "/partnerships",
    })
    items = content.organisational_value.setdefault("items", [])
    if not any(item.get("id") == "public-social-impact" for item in items):
        items.append({"id": "public-social-impact", "audience": "Public and social-impact organisations", "icon": "ri-government-line", "title": "Connect capability with public value.", "description": "Support access, responsible development, regional capability and knowledge exchange."})
    content.save(update_fields=["hero", "recognition_pathway", "member_value", "organisational_value", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("home", "0002_seed_home_content")]
    operations = [migrations.RunPython(align_home, migrations.RunPython.noop)]
