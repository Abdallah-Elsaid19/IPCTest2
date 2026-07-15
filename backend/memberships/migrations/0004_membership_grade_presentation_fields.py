from django.db import migrations, models


GRADE_PRESENTATION = {
    "AffIPC": {
        "slug": "affiliate",
        "image_url": "/images/membership/AFFIPC.png",
        "post_nominal": "AffIPC",
        "pathway_title": "Entry to the professional community for learners, new entrants and career changers",
        "pathway_description": "Entry to the Institute community and first visible professional affiliation. For students, graduates, career changers and junior staff.",
    },
    "MIPC": {
        "slug": "professional",
        "image_url": "/images/membership/Professional membership.png",
        "post_nominal": "MIPC",
        "pathway_title": "Professional membership for practitioners and related professionals active in project controls or project delivery",
        "pathway_description": "Professional membership identity for practitioners active in project controls or project delivery. Visible membership with CPD structure.",
    },
    "AFIPC_L3": {
        "slug": "associate-fellow-l3",
        "image_url": "/images/membership/Associate Fellow Level 3.png",
        "post_nominal": "AFIPC L3",
        "pathway_title": "Foundation practitioner recognition based on technician-level competence and evidence",
        "pathway_description": "Foundation practitioner recognition based on technician-level competence. The first competence-based recognition grade.",
    },
    "AFIPC_L4": {
        "slug": "associate-fellow-l4",
        "image_url": "/images/membership/Associate Fellow Level 4.png",
        "post_nominal": "AFIPC L4",
        "pathway_title": "Applied practitioner recognition for independent work on live projects and programmes",
        "pathway_description": "Applied practitioner recognition for professionals who can apply project controls independently on live projects or programmes.",
    },
    "FIPC": {
        "slug": "fellow",
        "image_url": "/images/membership/Fellow.png",
        "post_nominal": "FIPC",
        "pathway_title": "Senior professional recognition for strategic project controls leadership and contribution",
        "pathway_description": "Senior professional recognition for strategic project controls leadership. Aspirational, selective and respected.",
    },
}


def populate_presentation_fields(apps, schema_editor):
    MembershipGrade = apps.get_model("memberships", "MembershipGrade")
    for code, values in GRADE_PRESENTATION.items():
        MembershipGrade.objects.filter(code=code).update(**values)


class Migration(migrations.Migration):
    dependencies = [
        ("memberships", "0003_seed_membership_grades"),
    ]

    operations = [
        migrations.AddField(
            model_name="membershipgrade",
            name="slug",
            field=models.SlugField(max_length=80, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="membershipgrade",
            name="image_url",
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="membershipgrade",
            name="post_nominal",
            field=models.CharField(max_length=32, null=True),
        ),
        migrations.AddField(
            model_name="membershipgrade",
            name="pathway_title",
            field=models.CharField(max_length=255, null=True),
        ),
        migrations.AddField(
            model_name="membershipgrade",
            name="pathway_description",
            field=models.TextField(null=True),
        ),
        migrations.RunPython(populate_presentation_fields, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="membershipgrade",
            name="slug",
            field=models.SlugField(max_length=80, unique=True),
        ),
        migrations.AlterField(
            model_name="membershipgrade",
            name="image_url",
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name="membershipgrade",
            name="post_nominal",
            field=models.CharField(max_length=32),
        ),
        migrations.AlterField(
            model_name="membershipgrade",
            name="pathway_title",
            field=models.CharField(max_length=255),
        ),
        migrations.AlterField(
            model_name="membershipgrade",
            name="pathway_description",
            field=models.TextField(),
        ),
    ]
