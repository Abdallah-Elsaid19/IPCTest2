from io import StringIO
from unittest.mock import Mock, patch

from django.core.management import call_command
from django.test import TestCase, override_settings

from events.models import Event


@override_settings(EVENTBRITE_ORGANIZATION_ID="3010182182667")
class PruneOldEventbriteEventsCommandTests(TestCase):
    def setUp(self):
        self.current_event = Event.objects.create(
            title="Current IPC event",
            slug="current-ipc-event",
            event_type=Event.EventType.OTHER,
            eventbrite_id="new-event-1",
        )
        self.old_event = Event.objects.create(
            title="Old organization event",
            slug="old-organization-event",
            event_type=Event.EventType.OTHER,
            eventbrite_id="old-event-1",
        )
        self.manual_event = Event.objects.create(
            title="Manual IPC event",
            slug="manual-ipc-event",
            event_type=Event.EventType.OTHER,
            eventbrite_id=None,
        )

    @patch("events.management.commands.prune_old_eventbrite_events.get_configured_client")
    def test_dry_run_does_not_delete_events(self, get_client):
        client = Mock()
        client.get_organization_events.return_value = [{"id": "new-event-1"}]
        get_client.return_value = client
        stdout = StringIO()

        call_command("prune_old_eventbrite_events", stdout=stdout)

        self.assertTrue(Event.objects.filter(pk=self.old_event.pk).exists())
        self.assertIn("Dry run only", stdout.getvalue())
        client.get_organization_events.assert_called_once_with(
            organization_id="3010182182667",
            status=None,
        )

    @patch("events.management.commands.prune_old_eventbrite_events.get_configured_client")
    def test_execute_deletes_only_events_outside_current_organization(self, get_client):
        client = Mock()
        client.get_organization_events.return_value = [{"id": "new-event-1"}]
        get_client.return_value = client

        call_command("prune_old_eventbrite_events", execute=True, stdout=StringIO())

        self.assertFalse(Event.objects.filter(pk=self.old_event.pk).exists())
        self.assertTrue(Event.objects.filter(pk=self.current_event.pk).exists())
        self.assertTrue(Event.objects.filter(pk=self.manual_event.pk).exists())

