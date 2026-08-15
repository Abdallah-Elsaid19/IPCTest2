import uuid

from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import ChatConversation, ChatMessage


CHAT_TEST_SETTINGS = {
    "EMAIL_BACKEND": "django.core.mail.backends.locmem.EmailBackend",
    "DEFAULT_FROM_EMAIL": "office@example.com",
    "SUPPORT_EMAIL": "support@example.com",
    "CHAT_INBOUND_DOMAIN": "replies.example.com",
    "CHAT_INBOUND_WEBHOOK_TOKEN": "test-webhook-token",
    "CHAT_INBOUND_WEBHOOK_SECRET": "",
    "CHAT_STAFF_EMAILS": ["agent@example.com"],
    "CHAT_STAFF_EMAIL_DOMAINS": [],
    "GRAPH_TENANT_ID": "",
    "GRAPH_CLIENT_ID": "",
    "GRAPH_CLIENT_SECRET": "",
    "GRAPH_SENDER": "",
}


@override_settings(**CHAT_TEST_SETTINGS)
class PublicChatAPITests(APITestCase):
    def setUp(self):
        cache.clear()

    def create_conversation(self):
        response = self.client.post(
            reverse("chat-conversation-create"),
            {"name": "Ada Lovelace", "email": "ada@example.net", "source": "membership"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        return response.data

    def test_conversation_token_is_returned_but_only_hash_is_stored(self):
        data = self.create_conversation()
        conversation = ChatConversation.objects.get(public_id=data["id"])
        self.assertTrue(conversation.verify_access_token(data["token"]))
        self.assertNotEqual(conversation.access_token_hash, data["token"])

    def test_messages_require_the_conversation_token(self):
        data = self.create_conversation()
        response = self.client.get(reverse("chat-conversation-messages", kwargs={"public_id": data["id"]}))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_message_is_saved_emailed_and_idempotent(self):
        data = self.create_conversation()
        url = reverse("chat-conversation-messages", kwargs={"public_id": data["id"]})
        client_message_id = str(uuid.uuid4())
        payload = {"message": "Could you explain the membership route?", "client_message_id": client_message_id}
        response = self.client.post(url, payload, format="json", HTTP_X_CHAT_TOKEN=data["token"])
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ChatMessage.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Reply directly", mail.outbox[0].body)

        retry = self.client.post(url, payload, format="json", HTTP_X_CHAT_TOKEN=data["token"])
        self.assertEqual(retry.status_code, status.HTTP_200_OK)
        self.assertEqual(ChatMessage.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    def test_authorised_inbound_reply_is_saved_emailed_and_visible(self):
        data = self.create_conversation()
        inbound_url = reverse("chat-inbound-reply", kwargs={"provider": "generic"})
        payload = {
            "from": "IPC Agent <agent@example.com>",
            "to": f"chat+{data['id']}@replies.example.com",
            "subject": f"Re: [IPC-CHAT:{data['id']}] Website message",
            "text": "Hello Ada, here is the answer.\n\nOn Sunday, Ada wrote:\n> old message",
            "message_id": "provider-123",
        }
        response = self.client.post(
            inbound_url,
            payload,
            format="json",
            HTTP_X_IPC_WEBHOOK_TOKEN="test-webhook-token",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        message = ChatMessage.objects.get(provider_message_id="provider-123")
        self.assertEqual(message.sender_type, ChatMessage.SenderType.STAFF)
        self.assertNotIn("old message", message.message)
        self.assertEqual(mail.outbox[-1].to, ["ada@example.net"])

        messages_url = reverse("chat-conversation-messages", kwargs={"public_id": data["id"]})
        visible = self.client.get(messages_url, HTTP_X_CHAT_TOKEN=data["token"])
        self.assertEqual(visible.data["messages"][0]["message"], "Hello Ada, here is the answer.")

    def test_postmark_html_only_reply_is_saved_and_emailed(self):
        data = self.create_conversation()
        inbound_url = reverse("chat-inbound-reply", kwargs={"provider": "postmark"})
        response = self.client.post(
            inbound_url,
            {
                "FromFull": {"Email": "agent@example.com"},
                "To": f"chat+{data['id']}@replies.example.com",
                "Subject": f"Re: [IPC-CHAT:{data['id']}] Website message",
                "TextBody": "",
                "StrippedTextReply": "",
                "HtmlBody": (
                    "<div>Hello from <strong>Hostinger</strong>.</div>"
                    "<div>On Sunday, Ada wrote:</div><blockquote>old message</blockquote>"
                ),
                "MessageID": "postmark-html-only-123",
            },
            format="json",
            HTTP_X_IPC_WEBHOOK_TOKEN="test-webhook-token",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        message = ChatMessage.objects.get(provider_message_id="postmark-html-only-123")
        self.assertEqual(message.sender_type, ChatMessage.SenderType.STAFF)
        self.assertEqual(message.message, "Hello from Hostinger.")
        self.assertEqual(mail.outbox[-1].to, ["ada@example.net"])

    def test_inbound_rejects_invalid_token_and_sender(self):
        data = self.create_conversation()
        url = reverse("chat-inbound-reply", kwargs={"provider": "generic"})
        payload = {"from": "attacker@example.net", "to": f"chat+{data['id']}@replies.example.com", "text": "spam"}
        no_token = self.client.post(url, payload, format="json")
        self.assertEqual(no_token.status_code, status.HTTP_403_FORBIDDEN)
        bad_sender = self.client.post(url, payload, format="json", HTTP_X_IPC_WEBHOOK_TOKEN="test-webhook-token")
        self.assertEqual(bad_sender.status_code, status.HTTP_403_FORBIDDEN)
