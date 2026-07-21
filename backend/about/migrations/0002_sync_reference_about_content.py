from django.db import migrations


WHY_EXISTS = [
    {
        "title": "Evidence-led",
        "description": "Professional standing should be supported by competence, judgement and credible evidence.",
    },
    {
        "title": "Standards-informed",
        "description": "Recognition is grounded in recognised project-controls practice rather than generic titles.",
    },
    {
        "title": "Future-facing",
        "description": "Digital, AI, sustainability and public value sit alongside core controls capability.",
    },
]

VISION_PILLARS = [
    "A trusted professional home",
    "A stronger talent pipeline",
    "A more respected profession",
]

MISSIONS = [
    {
        "title": "Advance professional recognition",
        "description": "Create a structured route that allows professionals to demonstrate competence, integrity, development and contribution through clear membership and recognition grades.",
    },
    {
        "title": "Strengthen project delivery",
        "description": "Promote project controls as an integrated discipline that improves time, cost, risk, quality, safety, carbon, transparency and accountability.",
    },
    {
        "title": "Build a professional community",
        "description": "Bring together practitioners, employers, consultants, training providers, academics, sponsors and learners through events, clubs, awards and publications.",
    },
    {
        "title": "Open access to opportunity",
        "description": "Support learners and career changers through scholarships, bursaries, mentoring, Master Classes and employer partnerships.",
    },
]

CORE_VALUES = [
    {
        "title": "Integrity",
        "description": "Reports, forecasts and claims should not be shaped to satisfy pressure or hide material uncertainty.",
    },
    {
        "title": "Competence",
        "description": "Standing should reflect knowledge, skills, behaviours, judgement and evidence at the level of responsibility held.",
    },
    {
        "title": "Accountability",
        "description": "Professionals should own the quality, validity and timeliness of information and recommendations they influence.",
    },
    {
        "title": "Independence",
        "description": "Project controls should support delivery while retaining enough independence to challenge poor data and unrealistic baselines.",
    },
    {
        "title": "Collaboration",
        "description": "Strong controls depends on engineers, commercial teams, planners, PMO, finance, procurement, clients and contractors.",
    },
    {
        "title": "Growth",
        "description": "Members should maintain CPD, learn from projects, share lessons and improve professional standards.",
    },
    {
        "title": "Responsible technology",
        "description": "Digital tools should improve insight while protecting data quality, confidentiality, explainability and human accountability.",
    },
    {
        "title": "Public value",
        "description": "Professional judgement should consider safety, environmental impact, carbon, resilience and social value.",
    },
]


def merge_text(existing_items, replacements):
    merged = []
    for index, item in enumerate(existing_items):
        updated = dict(item)
        if index < len(replacements):
            replacement = replacements[index]
            if isinstance(replacement, str):
                updated["title"] = replacement
            else:
                updated.update(replacement)
        merged.append(updated)
    return merged


def sync_about_content(apps, schema_editor):
    AboutPageContent = apps.get_model("about", "AboutPageContent")
    content = AboutPageContent.objects.filter(key="main").first()
    if content is None:
        return

    content.why_exists = merge_text(content.why_exists, WHY_EXISTS)
    content.vision_pillars = merge_text(content.vision_pillars, VISION_PILLARS)
    content.missions = merge_text(content.missions, MISSIONS)
    content.core_values = merge_text(content.core_values, CORE_VALUES)
    content.save(update_fields=["why_exists", "vision_pillars", "missions", "core_values", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("about", "0001_initial")]
    operations = [migrations.RunPython(sync_about_content, migrations.RunPython.noop)]
