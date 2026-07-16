import django.db.models.deletion
from django.db import migrations, models


CATEGORIES = [
    {
        "title": "Academic Awards",
        "slug": "academic",
        "description": "Recognise dissertations, student research, emerging researchers, academic contribution and university project controls excellence.",
        "image_url": "https://readdy.ai/api/search-image?query=University%20graduation%20ceremony%20with%20academic%20regalia%20in%20a%20grand%20historic%20hall%2C%20warm%20golden%20lighting%2C%20scroll%20and%20certificate%20details%2C%20proud%20academic%20atmosphere%2C%20traditional%20yet%20modern%20setting%2C%20shallow%20depth%20of%20field%2C%20editorial%20quality&width=500&height=350&seq=awards-cat-academic-02&orientation=landscape",
        "icon_class": "ri-graduation-cap-line",
        "highlights": ["IPC Dissertation Prize", "Student Research Award", "Academic Contribution Award", "University Partnership Prize"],
        "sort_order": 10,
        "is_active": True,
    },
    {
        "title": "Commercial Awards",
        "slug": "commercial",
        "description": "Recognise project controls teams, innovation, digital transformation, risk and change management, and major project achievement.",
        "image_url": "https://readdy.ai/api/search-image?query=Professional%20team%20receiving%20an%20award%20on%20stage%20at%20a%20modern%20corporate%20ceremony%2C%20warm%20stage%20lighting%2C%20elegant%20glass%20trophy%2C%20confident%20professional%20expressions%2C%20large%20LED%20screen%20backdrop%2C%20premium%20event%20atmosphere%2C%20editorial%20photography%20style&width=500&height=350&seq=awards-cat-commercial-02&orientation=landscape",
        "icon_class": "ri-building-2-line",
        "highlights": ["Project Controls Team of the Year", "Digital Innovation Award", "Risk Management Excellence", "Major Project Achievement"],
        "sort_order": 20,
        "is_active": True,
    },
    {
        "title": "Professional Awards",
        "slug": "professional",
        "description": "Recognise individuals, young professionals, leaders, mentors, Fellows, women in project controls and lifetime contribution.",
        "image_url": "https://readdy.ai/api/search-image?query=Individual%20professional%20receiving%20a%20prestigious%20recognition%20award%20certificate%20in%20an%20elegant%20ceremony%20setting%2C%20warm%20spotlight%20effect%2C%20gold%20trophy%20on%20pedestal%2C%20professional%20handshake%2C%20refined%20corporate%20atmosphere%2C%20shallow%20depth%20of%20field%2C%20editorial%20quality&width=500&height=350&seq=awards-cat-professional-02&orientation=landscape",
        "icon_class": "ri-user-star-line",
        "highlights": ["Young Professional Award", "Mentor of the Year", "Women in Project Controls", "Lifetime Contribution Award"],
        "sort_order": 30,
        "is_active": True,
    },
    {
        "title": "Other Awards",
        "slug": "other",
        "description": "Other Institute awards and recognition programmes.",
        "image_url": "https://readdy.ai/api/search-image?query=Elegant%20gold%20award%20trophy%20on%20a%20dark%20ceremony%20stage%2C%20professional%20recognition%20event%2C%20warm%20lighting%2C%20editorial%20photography&width=500&height=350&seq=awards-cat-other-01&orientation=landscape",
        "icon_class": "ri-award-line",
        "highlights": ["Institute recognition programme"],
        "sort_order": 40,
        "is_active": False,
    },
]


def create_categories_and_link_programmes(apps, schema_editor):
    AwardCategory = apps.get_model("awards", "AwardCategory")
    AwardProgramme = apps.get_model("awards", "AwardProgramme")
    categories = {}
    for data in CATEGORIES:
        category, _created = AwardCategory.objects.get_or_create(
            slug=data["slug"],
            defaults=data,
        )
        categories[data["slug"]] = category
    fallback = categories["other"]
    for programme in AwardProgramme.objects.all():
        programme.category_ref = categories.get(programme.category, fallback)
        programme.save(update_fields=["category_ref"])


class Migration(migrations.Migration):
    dependencies = [("awards", "0003_awardprogramme_criteria_seed_programmes")]

    operations = [
        migrations.CreateModel(
            name="AwardCategory",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=120)),
                ("slug", models.SlugField(max_length=140, unique=True)),
                ("description", models.TextField()),
                ("image_url", models.URLField(max_length=1000)),
                ("icon_class", models.CharField(max_length=80)),
                ("highlights", models.JSONField(default=list)),
                ("is_active", models.BooleanField(default=True)),
                ("sort_order", models.PositiveSmallIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name_plural": "Award categories",
                "ordering": ["sort_order", "title"],
                "indexes": [models.Index(fields=["is_active", "sort_order"], name="awards_cat_active_order_idx")],
            },
        ),
        migrations.AddField(
            model_name="awardprogramme",
            name="category_ref",
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name="+", to="awards.awardcategory"),
        ),
        migrations.RunPython(create_categories_and_link_programmes, migrations.RunPython.noop),
        migrations.RemoveIndex(model_name="awardprogramme", name="awards_awar_categor_4f1292_idx"),
        migrations.RemoveField(model_name="awardprogramme", name="category"),
        migrations.RenameField(model_name="awardprogramme", old_name="category_ref", new_name="category"),
        migrations.AlterField(
            model_name="awardprogramme",
            name="category",
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="programmes", to="awards.awardcategory"),
        ),
        migrations.AddIndex(
            model_name="awardprogramme",
            index=models.Index(fields=["category", "is_active"], name="awards_prog_cat_active_idx"),
        ),
    ]
