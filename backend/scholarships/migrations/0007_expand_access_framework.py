from django.db import migrations


def expand_framework(apps, schema_editor):
    Content = apps.get_model("scholarships", "ScholarshipContent")
    content = Content.objects.filter(key="main").first()
    if not content:
        return
    content.hero.update({
        "eyebrow": "Scholarships, bursaries and access pathways",
        "description": "IPC scholarship and bursary pathways connect eligible learners, career changers, returners and public-service professionals with learning, membership, mentoring, events, community and credible professional progression.",
    })
    content.audiences_intro = {
        "eyebrow": "Scholarship pathways",
        "title": "Seven access routes for different circumstances and potential.",
        "description": "IPC may support up to 40 places per intake across the scholarship framework, subject to application quality, available funding, programme eligibility and social-impact priorities. Allocation between categories may change.",
    }
    content.audiences = [
        {"id": "access-hardship", "icon": "ri-door-open-line", "title": "Access and Hardship", "description": "For people facing financial, social, geographic or opportunity barriers. Assessment considers genuine need, motivation, relevance, commitment and likely benefit."},
        {"id": "character-service", "icon": "ri-hand-heart-line", "title": "Character, Service and Community Impact", "description": "For people demonstrating service, resilience, leadership or positive contribution. Assessment considers character, evidence of service, intended impact and professional direction."},
        {"id": "charity-ngo", "icon": "ri-community-line", "title": "Charity, NGO and Social Good", "description": "For charity, NGO and social-impact workers who can apply project-controls capability to public benefit."},
        {"id": "service-transition", "icon": "ri-shield-star-line", "title": "Armed Forces, Veterans and Public Service Transition", "description": "For service leavers, veterans, reservists, affected families, emergency-services and public-service professionals moving into civilian project roles."},
        {"id": "second-chance", "icon": "ri-restart-line", "title": "Second Chance Career Repositioning", "description": "For people affected by redundancy, career disruption, long-term unemployment or a major professional reset."},
        {"id": "independent", "icon": "ri-briefcase-4-line", "title": "Self-Employed Professionals and Consultants", "description": "For independent professionals and consultants without employer-funded development."},
        {"id": "returners-talent", "icon": "ri-graduation-cap-line", "title": "Career Returners and Emerging Talent", "description": "For returners, leavers, graduates, apprentices, junior staff and early-career professionals without sufficient employer support."},
    ]
    content.values_intro = {"eyebrow": "What support may include", "title": "Support is tailored to the confirmed route.", "description": "The exact award is defined individually and may combine approved learning, membership, examination, event, mentoring, travel or related professional-development support. Each award is confirmed individually in writing."}
    content.values = [
        {"id": "fees", "icon": "ri-funds-line", "title": "Programme or learning fees", "description": "Approved fee support for the confirmed learning route."},
        {"id": "membership", "icon": "ri-user-star-line", "title": "Professional membership or affiliation", "description": "A defined relationship with IPC and the project-controls community."},
        {"id": "exam", "icon": "ri-file-list-3-line", "title": "Examination support", "description": "Examination support where relevant."},
        {"id": "masterclass", "icon": "ri-presentation-line", "title": "Selected London Master Class access", "description": "Selected access where approved."},
        {"id": "mentoring", "icon": "ri-team-line", "title": "Mentoring", "description": "Guidance where available."},
        {"id": "travel", "icon": "ri-train-line", "title": "Event or travel support", "description": "Support where specifically approved."},
        {"id": "development", "icon": "ri-route-line", "title": "Professional-development costs", "description": "Related costs confirmed as part of an individual award."},
    ]
    content.save(update_fields=["hero", "audiences_intro", "audiences", "values_intro", "values", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("scholarships", "0006_sync_current_scholarship_content")]
    operations = [migrations.RunPython(expand_framework, migrations.RunPython.noop)]
