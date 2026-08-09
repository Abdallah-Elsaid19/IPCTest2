from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from events.models import Event
from events.services.eventbrite import EventbriteError, get_configured_client


class Command(BaseCommand):
    help = (
        "Delete local Eventbrite events that do not belong to the currently "
        "configured Eventbrite organization. Manual events are never deleted."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--execute",
            action="store_true",
            help="Perform the deletion. Without this flag the command is a dry run.",
        )
        parser.add_argument(
            "--organization-id",
            default="",
            help=(
                "Organization to keep. Defaults to EVENTBRITE_ORGANIZATION_ID. "
                "The configured API token must have access to it."
            ),
        )

    def handle(self, *args, **options):
        organization_id = (
            options["organization_id"] or settings.EVENTBRITE_ORGANIZATION_ID
        ).strip()
        if not organization_id:
            raise CommandError(
                "EVENTBRITE_ORGANIZATION_ID is not configured and "
                "--organization-id was not supplied."
            )

        try:
            remote_events = get_configured_client().get_organization_events(
                organization_id=organization_id,
                status=None,
            )
        except EventbriteError as exc:
            raise CommandError(
                f"Could not verify organization {organization_id} with Eventbrite: {exc}"
            ) from exc

        current_ids = {
            str(event.get("id")).strip()
            for event in remote_events
            if event.get("id")
        }
        if not current_ids:
            raise CommandError(
                "Eventbrite returned no events for the organization. Refusing to "
                "delete anything; verify the token and organization ID first."
            )

        eventbrite_events = (
            Event.objects.exclude(eventbrite_id__isnull=True)
            .exclude(eventbrite_id="")
        )
        candidates = eventbrite_events.exclude(eventbrite_id__in=current_ids)
        candidate_rows = list(
            candidates.order_by("id").values_list("id", "eventbrite_id", "title")
        )

        self.stdout.write(f"Organization kept: {organization_id}")
        self.stdout.write(f"Eventbrite events verified remotely: {len(current_ids)}")
        self.stdout.write(f"Old local Eventbrite events found: {len(candidate_rows)}")
        for database_id, eventbrite_id, title in candidate_rows:
            self.stdout.write(
                f"  DB {database_id} | Eventbrite {eventbrite_id} | {title}"
            )

        if not candidate_rows:
            self.stdout.write(self.style.SUCCESS("Nothing needs to be deleted."))
            return

        if not options["execute"]:
            self.stdout.write(
                self.style.WARNING(
                    "Dry run only. Re-run with --execute after reviewing this list."
                )
            )
            return

        candidate_ids = [row[0] for row in candidate_rows]
        try:
            with transaction.atomic():
                deleted_count, deleted_by_model = Event.objects.filter(
                    id__in=candidate_ids
                ).delete()
        except Exception as exc:
            raise CommandError(
                "Deletion was rolled back. One or more old events may have protected "
                f"related records: {exc}"
            ) from exc

        event_count = deleted_by_model.get(Event._meta.label, 0)
        self.stdout.write(
            self.style.SUCCESS(
                f"Deleted {event_count} old Eventbrite event(s) "
                f"({deleted_count} records including dependent rows)."
            )
        )
