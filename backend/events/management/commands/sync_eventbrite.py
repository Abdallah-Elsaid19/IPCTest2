from django.core.management.base import BaseCommand, CommandError

from events.services.eventbrite import EventbriteError
from events.services.sync_eventbrite import sync_eventbrite_events


class Command(BaseCommand):
    help = "Fetch Eventbrite organization events and sync them to the local database (read-only upstream)."

    def handle(self, *args, **options):
        try:
            result = sync_eventbrite_events()
        except EventbriteError as exc:
            raise CommandError(str(exc)) from exc
        self.stdout.write(self.style.SUCCESS(
            f"Eventbrite sync complete: total={result['total']}, created={result['created']}, "
            f"updated={result['updated']}, skipped={result['skipped']}"
        ))
