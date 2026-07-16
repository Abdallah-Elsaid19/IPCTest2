from django.db import migrations, models


PROGRAMMES = [
    {
        "title": "IPC Project Controls Team of the Year",
        "slug": "ipc-project-controls-team-of-the-year",
        "category": "commercial",
        "description": "Recognises a project controls team that has made an exceptional contribution to project delivery through integrated planning, cost control, risk management and performance reporting. Open to teams from any sector, project size or geography.",
        "criteria": [
            "Demonstrated integration of multiple controls disciplines",
            "Measurable improvement in project outcomes",
            "Evidence of innovation or practice development",
            "Professional conduct and collaboration",
        ],
    },
    {
        "title": "IPC Young Professional Award",
        "slug": "ipc-young-professional-award",
        "category": "professional",
        "description": "Celebrates an emerging project controls professional under 30 who has made a notable contribution to their project, organisation or the wider profession. Candidates may self-nominate or be nominated by employers or mentors.",
        "criteria": [
            "Evidence of professional growth and learning",
            "Contribution to project or team outcomes",
            "Commitment to CPD and development",
            "Potential for future leadership",
        ],
    },
    {
        "title": "IPC Dissertation Prize",
        "slug": "ipc-dissertation-prize",
        "category": "academic",
        "description": "Awarded for outstanding undergraduate or postgraduate dissertation research in project controls, planning, cost engineering, risk management or related fields. Open to students from any recognised university programme worldwide.",
        "criteria": [
            "Originality and relevance of research",
            "Methodological rigour",
            "Practical applicability to project controls",
            "Quality of written presentation",
        ],
    },
    {
        "title": "IPC Lifetime Contribution Award",
        "slug": "ipc-lifetime-contribution-award",
        "category": "professional",
        "description": "The Institute's highest honour, recognising a career of distinguished contribution to project controls practice, education, standards development or professional leadership. Awarded at the discretion of the Fellowship panel.",
        "criteria": [
            "Sustained contribution over 20+ years",
            "Influence on the profession or discipline",
            "Mentoring and development of others",
            "Demonstrated integrity and professional conduct",
        ],
    },
]


def seed_programmes(apps, schema_editor):
    AwardProgramme = apps.get_model("awards", "AwardProgramme")
    for data in PROGRAMMES:
        programme, created = AwardProgramme.objects.get_or_create(
            slug=data["slug"],
            defaults={**data, "is_active": True},
        )
        if not created:
            changed = []
            for field in ("description", "criteria"):
                if not getattr(programme, field):
                    setattr(programme, field, data[field])
                    changed.append(field)
            if changed:
                programme.save(update_fields=changed)


class Migration(migrations.Migration):
    dependencies = [("awards", "0002_awardsinterest_status_awardprogramme_and_more")]

    operations = [
        migrations.AddField(
            model_name="awardprogramme",
            name="criteria",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.RunPython(seed_programmes, migrations.RunPython.noop),
    ]
