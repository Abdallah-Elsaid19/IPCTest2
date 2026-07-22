from django.db import migrations


def add_information_session_cta(apps, schema_editor):
    Content = apps.get_model("awards", "AwardPageContent")
    content = Content.objects.filter(key="main").first()
    if content is None:
        return

    interest_intro = dict(content.interest_intro or {})
    interest_intro.setdefault("secondary_cta_label", "Book an information session")
    interest_intro.setdefault("secondary_cta_url", "/information-session")
    content.interest_intro = interest_intro
    content.save(update_fields=["interest_intro", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [("awards", "0008_expand_awards_page_content")]
    operations = [migrations.RunPython(add_information_session_cta, migrations.RunPython.noop)]
