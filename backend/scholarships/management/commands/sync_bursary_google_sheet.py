from django.core.management.base import BaseCommand

from scholarships.google_sheets import bursary_google_sheet_url, sync_bursary_google_sheet


class Command(BaseCommand):
    help = "Synchronise all Bursary applications to the configured Google Sheet."

    def handle(self, *args, **options):
        count = sync_bursary_google_sheet()
        self.stdout.write(self.style.SUCCESS(
            f"Synced {count} Bursary applications to {bursary_google_sheet_url()}"
        ))
