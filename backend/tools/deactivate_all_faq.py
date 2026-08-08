import os

import django


os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ipc_backend.settings")
django.setup()

from ipc_backend.content_management import CONTENT_TABLES


def main():
    updated = []
    for slug, config in CONTENT_TABLES.items():
        section = "questions" if slug == "membership" else "faq"
        if section not in config["fields"]:
            continue

        instance = config["model"].objects.filter(key="main").first()
        if instance is None:
            continue

        value = dict(getattr(instance, section) or {})
        value["is_active"] = False
        setattr(instance, section, value)
        instance.save(update_fields=[section, "updated_at"])
        updated.append(slug)

    print(f"Deactivated FAQ sections: {', '.join(updated)}")


if __name__ == "__main__":
    main()
