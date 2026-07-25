from django.db import migrations
from django.utils import timezone


def active():
    return {"is_active": True}


def seed_content(apps, schema_editor):
    EmployerContent = apps.get_model("institutional", "EmployerContent")
    PartnershipContent = apps.get_model("institutional", "PartnershipContent")
    PublicationContent = apps.get_model("institutional", "PublicationContent")
    common = {"status": "published", "is_active": True, "published_at": timezone.now()}

    EmployerContent.objects.update_or_create(key="main", defaults={
        **common,
        "hero": {
            "is_active": True,
            "eyebrow": "For employers",
            "title": "Build project-controls capability that is visible, structured and credible.",
            "description": "IPC helps employers connect workforce development, professional recognition, learning and contribution so people can progress and organisations can strengthen project delivery confidence.",
            "primary_cta_label": "Discuss an organisational pathway",
            "primary_cta_url": "/information-session",
            "secondary_cta_label": "Explore membership grades",
            "secondary_cta_url": "/membership",
        },
        "value_intro": active(), "values": active(), "pathways_intro": active(),
        "pathways": active(), "capability_model": active(), "evidence": active(),
        "impact": active(), "faq": active(), "final_cta": active(),
        "seo": {
            "is_active": True,
            "title": "Employer Project Controls Capability",
            "description": "Build visible project-controls capability through workforce recognition, professional learning, employer engagement and structured progression with IPC.",
            "canonical_path": "/employers",
        },
    })

    PartnershipContent.objects.update_or_create(key="main", defaults={
        **common,
        "hero": {
            "is_active": True,
            "eyebrow": "Corporate and academic partnerships",
            "title": "Long-term collaboration for capability, access and professional impact.",
            "description": "IPC connects learning, practice, recognition and professional community through transparent collaboration.",
            "primary_cta_label": "Discuss a partnership",
            "primary_cta_url": "/information-session",
        },
        "partner_types": active(), "value": active(), "comparison": active(),
        "integrity": active(), "process": active(), "faq": active(), "final_cta": active(),
        "seo": {
            "is_active": True,
            "title": "Corporate and Academic Partnerships",
            "description": "Develop long-term corporate, academic and professional partnerships that strengthen project-controls capability, access, research and professional impact.",
            "canonical_path": "/partnerships",
        },
    })

    PublicationContent.objects.update_or_create(key="main", defaults={
        **common,
        "hero": {
            "is_active": True,
            "eyebrow": "Publications, journal and research",
            "title": "Where project-controls knowledge becomes useful professional practice.",
            "description": "IPC creates routes for practitioners, members, employers, academics and learners to share evidence-led insight, applied lessons and professional contribution.",
            "primary_cta_label": "Explore publication routes",
            "primary_cta_url": "#routes",
            "secondary_cta_label": "Propose an article or paper",
            "secondary_cta_url": "/information-session",
        },
        "routes": active(), "value": active(), "principles": active(),
        "process": active(), "faq": active(), "final_cta": active(),
        "seo": {
            "is_active": True,
            "title": "Publications, Journal and Research",
            "description": "Explore IPC professional magazine content, technical case studies, academic papers, research notes and evidence-led project-controls insight.",
            "canonical_path": "/publications",
        },
    })


class Migration(migrations.Migration):
    dependencies = [("institutional", "0001_initial")]
    operations = [migrations.RunPython(seed_content, migrations.RunPython.noop)]
