from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import ipc_backend.validators
from django.utils import timezone


HERO = {
    "eyebrow": "Awards, prizes and recognition",
    "title": "Where achievement becomes professional distinction.",
    "description": "IPC awards and prizes recognise academic excellence, commercial innovation, professional contribution and emerging talent across the project-controls community.",
    "primary_cta_label": "Explore award categories",
    "primary_cta_url": "#featured",
    "secondary_cta_label": "Understand judging & integrity",
    "secondary_cta_url": "#awards-interest",
    "image_url": "https://readdy.ai/api/search-image?query=Close%20up%20of%20an%20elegant%20golden%20trophy%20and%20framed%20certificate%20on%20a%20dark%20polished%20wooden%20podium%2C%20soft%20dramatic%20spotlight%20from%20above%2C%20subtle%20laurel%20wreath%20motifs%20in%20background%20bokeh%2C%20deep%20charcoal%20backdrop%2C%20premium%20awards%20ceremony%20atmosphere%2C%20cinematic%20lighting%2C%20editorial%20photography%20quality&width=1600&height=900&seq=awards-hero-professional-03&orientation=landscape",
    "image_alt": "Prestigious awards trophy",
}

FRAMEWORK_INTRO = {
    "eyebrow": "Awards framework",
    "title": "Explore the main recognition routes within the awards programme.",
    "description": "Select a category to understand its purpose, likely nominations and professional value.",
}

FEATURED_INTRO = {
    "eyebrow": "Featured award routes",
    "title": "CMS-ready placeholders for key prizes and recognition lines.",
    "description": "These cards are designed for confirmed categories and nomination routes. Replace placeholder text only when the programme is approved.",
    "image_url": "https://readdy.ai/api/search-image?query=Elegant%20awards%20ceremony%20stage%20with%20golden%20spotlights%2C%20row%20of%20polished%20glass%20trophies%20lined%20up%20on%20a%20dark%20podium%2C%20floral%20arrangements%2C%20large%20projection%20screen%20with%20abstract%20geometric%20patterns%2C%20warm%20dramatic%20lighting%2C%20premium%20event%20production%2C%20editorial%20photography&width=700&height=900&seq=awards-featured-showcase-02&orientation=portrait",
    "image_alt": "Awards ceremony stage",
}

TIMELINE_INTRO = {
    "eyebrow": "Nomination approach",
    "title": "Keep the submission journey clear, rigorous and elegant.",
    "description": "A prestige awards experience depends on clarity: who can apply, what evidence is required, how judgement works and what happens next.",
    "image_url": "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/c6a7749b12aa41e28a14c438df0a7af0.png",
    "image_alt": "",
}

BENEFITS_INTRO = {
    "eyebrow": "Why awards matter",
    "title": "Why awards matter",
    "description": "Recognition should reflect evidence, contribution and value—not just visibility.",
}

BENEFICIARIES_INTRO = {
    "eyebrow": "Who benefits",
    "title": "Recognition creates value for people, teams, institutions and the profession itself.",
    "description": "A strong awards system should elevate achievement while encouraging fairness, access and contribution.",
    "image_url": FEATURED_INTRO["image_url"],
    "image_alt": "Professional awards ceremony",
}

BENEFICIARIES = [
    {"title": "Members & professionals", "description": "Build visibility, confidence and a stronger public profile through credible recognition.", "cta_label": "Explore professional routes", "cta_url": "#featured"},
    {"title": "Employers & consultancies", "description": "Celebrate teams, innovation and staff achievement while strengthening employer brand.", "cta_label": "Explore sponsor value", "cta_url": "#awards-partnerships"},
    {"title": "Academic partners", "description": "Connect education to employability through student prizes, papers and research visibility.", "cta_label": "View academic awards", "cta_url": "#featured"},
    {"title": "Sponsors & supporters", "description": "Support access, recognition and community impact with ethical visibility and clear safeguards.", "cta_label": "See governance safeguards", "cta_url": "#awards-partnerships"},
]

INTEGRITY_INTRO = {
    "eyebrow": "Judging and integrity",
    "title": "Prestige only matters when the process is trusted.",
    "description": "IPC should protect the awards programme through transparent criteria, independent judgement, evidence-based review and clear boundaries between sponsorship and decision-making.",
    "image_url": "https://readdy.ai/api/search-image?query=Subtle%20geometric%20shield%20and%20scale%20motifs%20in%20warm%20gold%20lines%20on%20clean%20light%20ivory%20background%2C%20minimal%20abstract%20governance%20pattern%2C%20professional%20institutional%20texture%2C%20very%20faint%20repeating%20design%2C%20no%20text%2C%20soft%20elegant%20aesthetic&width=1600&height=800&seq=awards-governance-bg-02&orientation=landscape",
    "image_alt": "",
}

PARTNERSHIPS_INTRO = {
    "eyebrow": "Sponsorship and partnership",
    "title": "Support recognition while protecting independence.",
    "description": "Sponsorship can fund awards, access, visibility, ceremonies and community value, but it should not influence judging decisions.",
    "disclaimer": "Sponsors should not gain automatic access to private member data, unpublished submissions or judging outcomes before formal release.",
}

PARTNERSHIPS = [
    {"title": "Corporate & employer sponsors", "items": ["Support categories or ceremonies", "Recognise capability and innovation", "Strengthen employer brand", "Support learner or student access", "Maintain judging independence"], "cta_label": "Discuss corporate sponsorship", "cta_url": "#awards-interest"},
    {"title": "Academic & training partners", "items": ["Support student prizes", "Promote research visibility", "Connect employability and industry", "Encourage papers and applied studies", "Strengthen academic-professional links"], "cta_label": "Discuss academic partnership", "cta_url": "#awards-interest"},
    {"title": "Ethical sponsors & service providers", "items": ["Enable visibility and access", "Support category operations", "Back social-impact routes", "Protect confidentiality and fairness", "Respect editorial and judging safeguards"], "cta_label": "Discuss award support", "cta_url": "#awards-interest"},
]

FAQ = {
    "eyebrow": "Awards questions",
    "title": "Clear guidance before nominating, judging or sponsoring.",
    "description": "Understand categories, evidence, judging, sponsors and announcement safeguards.",
    "items": [
        {"question": "Are categories and nomination windows confirmed on this page?", "answer": "This page contains a professional structure and CMS-ready placeholders. Confirmed categories, deadlines, judges, finalists and winners should be published only after approval."},
        {"question": "Who can be nominated for IPC awards?", "answer": "Eligibility should be defined for each award route and may include members, non-members, students, teams, universities, employers, partners or specific groups depending on the category."},
        {"question": "What evidence should a nomination include?", "answer": "Strong nominations usually combine a concise narrative, supporting evidence, measurable outcomes, endorsements and clear explanation of relevance to project controls."},
        {"question": "Can sponsors influence the judging process?", "answer": "No. Sponsorship should be transparent and supportive, but judging should remain independent, evidence-led and safeguarded from commercial influence."},
        {"question": "Can awards support students and emerging professionals?", "answer": "Yes. Student prizes, academic recognition and emerging-talent routes can help connect education, confidence and professional identity."},
        {"question": "How should winners and finalists be announced?", "answer": "Announcements should follow a clear approval and communications process so that finalists and winners are informed appropriately and public claims remain accurate."},
    ],
}

INTEREST_INTRO = {
    "eyebrow": "Nomination route builder",
    "title": "What kind of recognition are you exploring?",
    "description": "Select the route that best matches your interest to create an indicative enquiry.",
}

FINAL_CTA = {
    "eyebrow": "Celebrate excellence",
    "title": "Celebrate excellence",
    "description": "Register your interest in awards, nominations, judging or sponsorship. Share your role, organisation, category interest and the type of recognition route you want to explore.",
    "cta_label": "Register awards interest",
    "cta_url": "#awards-interest",
    "items": [
        {"title": "Academic nomination", "description": "Research, dissertation or student route"},
        {"title": "Award sponsorship", "description": "Category support or ceremony backing"},
        {"title": "Judging interest", "description": "Reviewer, panellist or assessor support"},
    ],
}

SEO = {
    "title": "Awards & Prizes",
    "description": "IPC awards and prizes recognise academic excellence, commercial innovation, professional contribution and emerging talent across project controls.",
    "canonical_path": "/awards",
    "noindex": False,
    "nofollow": False,
}


def seed_awards_content(apps, schema_editor):
    Content = apps.get_model("awards", "AwardPageContent")
    content = Content.objects.filter(key="main").first()
    if content is None:
        return

    if not content.legacy_content:
        content.legacy_content = {
            "nomination_timeline": content.nomination_timeline,
            "impact_benefits": content.impact_benefits,
            "integrity_principles": content.integrity_principles,
        }

    content.hero = HERO
    content.framework_intro = FRAMEWORK_INTRO
    content.featured_intro = FEATURED_INTRO
    content.timeline_intro = TIMELINE_INTRO
    content.benefits_intro = BENEFITS_INTRO
    content.beneficiaries_intro = BENEFICIARIES_INTRO
    content.beneficiaries = BENEFICIARIES
    content.integrity_intro = INTEGRITY_INTRO
    content.partnerships_intro = PARTNERSHIPS_INTRO
    content.partnerships = PARTNERSHIPS
    content.faq = FAQ
    content.interest_intro = INTEREST_INTRO
    content.final_cta = FINAL_CTA
    content.seo = SEO
    content.status = "published"
    content.is_active = True
    if content.published_at is None:
        content.published_at = timezone.now()
    content.save()


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("awards", "0007_sync_reference_awards_content"),
    ]

    operations = [
        migrations.AddField(model_name="awardpagecontent", name="hero", field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="framework_intro", field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="featured_intro", field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="timeline_intro", field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="benefits_intro", field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="beneficiaries_intro", field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="beneficiaries", field=models.JSONField(default=list, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="integrity_intro", field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="partnerships_intro", field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="partnerships", field=models.JSONField(default=list, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="faq", field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="interest_intro", field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="final_cta", field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="seo", field=models.JSONField(default=dict, validators=[ipc_backend.validators.validate_content_section])),
        migrations.AddField(model_name="awardpagecontent", name="legacy_content", field=models.JSONField(blank=True, default=dict)),
        migrations.AddField(model_name="awardpagecontent", name="status", field=models.CharField(choices=[("draft", "Draft"), ("published", "Published")], default="published", max_length=16)),
        migrations.AddField(model_name="awardpagecontent", name="published_at", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="awardpagecontent", name="updated_by", field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="updated_awards_content", to=settings.AUTH_USER_MODEL)),
        migrations.RunPython(seed_awards_content, migrations.RunPython.noop),
    ]
