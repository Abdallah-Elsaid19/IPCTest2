from django.db import migrations


MEMBER_VALUE = {
    "eyebrow": "Member Benefits",
    "title": (
        "A professional membership designed to create recognition, "
        "opportunity and community."
    ),
    "description": (
        "The Institute’s value is not limited to one certificate. Membership "
        "should support a member’s professional identity, learning, visibility, "
        "network, career progression and contribution to the discipline."
    ),
    "items": [
        {
            "id": "01",
            "title": "Recognition and affiliation",
            "description": (
                "Membership provides a clear professional link to a specialist "
                "institute focused on project controls, competence and "
                "professional development."
            ),
        },
        {
            "id": "02",
            "title": "Post-nominals",
            "description": (
                "Approved members may use the post-nominal relevant to their "
                "recognised grade, strengthening professional profiles and "
                "external credibility."
            ),
        },
        {
            "id": "03",
            "title": "Certificate and badge",
            "description": (
                "Members may receive confirmation of recognition, certificate "
                "and digital badge where available, supporting LinkedIn and CV "
                "presentation."
            ),
        },
        {
            "id": "04",
            "title": "London Master Class Events",
            "description": (
                "Membership includes access to selected London Master Class "
                "Events, subject to membership category, registration and "
                "capacity."
            ),
        },
        {
            "id": "05",
            "title": "Regional clubs",
            "description": (
                "Members can engage with the London, Nottingham, Manchester and "
                "Kent–Maidstone clubs for local networking and professional "
                "activities."
            ),
        },
        {
            "id": "06",
            "title": "Professional magazine",
            "description": (
                "Members may receive opportunities to read, contribute to or be "
                "profiled in the Institute’s professional magazine and sector "
                "insight publications."
            ),
        },
        {
            "id": "07",
            "title": "Academic journal papers",
            "description": (
                "Members and academic partners may engage with research, paper "
                "calls, academic journal activity and evidence-based project "
                "controls knowledge."
            ),
        },
        {
            "id": "08",
            "title": "Awards and prizes",
            "description": (
                "Members may be eligible for academic, commercial, professional "
                "and special recognition awards, subject to award criteria."
            ),
        },
        {
            "id": "09",
            "title": "Networking and profile",
            "description": (
                "Members can build relationships with professionals, employers, "
                "consultants, academics, training providers and sponsors across "
                "the project controls community."
            ),
        },
        {
            "id": "10",
            "title": "Speaking and mentoring",
            "description": (
                "Senior members may be invited to speak, mentor, judge awards, "
                "support clubs or contribute to standards, guidance and thought "
                "leadership."
            ),
        },
        {
            "id": "11",
            "title": "Scholarship awareness",
            "description": (
                "Members can learn about scholarship, bursary and learner "
                "support opportunities linked to project controls education and "
                "professional development."
            ),
        },
        {
            "id": "12",
            "title": "Career differentiation",
            "description": (
                "Membership helps professionals stand out in a competitive "
                "market by showing commitment to a specialist discipline and "
                "structured progression."
            ),
        },
    ],
}


def replace_member_value(apps, schema_editor):
    MembershipContent = apps.get_model("memberships", "MembershipContent")
    MembershipContent.objects.filter(key="main").update(member_value=MEMBER_VALUE)


class Migration(migrations.Migration):
    dependencies = [
        ("memberships", "0009_membershipcontent_competence_matrix"),
    ]

    operations = [
        migrations.RunPython(
            replace_member_value,
            migrations.RunPython.noop,
        ),
    ]
