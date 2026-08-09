import uuid

from django.conf import settings
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.crypto import constant_time_compare
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import ChatConversation, ChatMessage
from .serializers import ChatMessageSerializer, ConversationCreateSerializer, CustomerMessageCreateSerializer
from .services import (
    ChatEmailError,
    email_customer_message_to_support,
    email_staff_reply_to_customer,
    extract_conversation_id,
    fallback_provider_message_id,
    mark_email_result,
    normalise_inbound_payload,
    staff_sender_is_allowed,
    valid_webhook_signature,
)


class PublicChatAPIView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]


def _token_from_request(request):
    return request.headers.get("X-Chat-Token", "")


def _authorised_conversation(request, public_id):
    conversation = get_object_or_404(ChatConversation, public_id=public_id)
    if not conversation.verify_access_token(_token_from_request(request)):
        return None
    return conversation


def _conversation_payload(conversation, token=None):
    payload = {
        "id": str(conversation.public_id),
        "name": conversation.customer_name,
        "email": conversation.customer_email,
        "source": conversation.source,
        "status": conversation.status,
        "messages": ChatMessageSerializer(conversation.messages.all(), many=True).data,
    }
    if token:
        payload["token"] = token
    return payload


class ConversationCreateView(PublicChatAPIView):
    throttle_scope = "chat_conversation"

    def post(self, request):
        serializer = ConversationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        conversation, token = ChatConversation.create_with_token(
            customer_name=data["name"],
            customer_email=data["email"].lower(),
            source=data.get("source", "general"),
        )
        return Response(_conversation_payload(conversation, token), status=status.HTTP_201_CREATED)


class ConversationDetailView(PublicChatAPIView):
    throttle_scope = "chat_poll"

    def get(self, request, public_id):
        conversation = _authorised_conversation(request, public_id)
        if conversation is None:
            return Response({"detail": "Invalid conversation token."}, status=status.HTTP_403_FORBIDDEN)
        return Response(_conversation_payload(conversation))


class ConversationMessagesView(PublicChatAPIView):
    def get_throttles(self):
        self.throttle_scope = "chat_poll" if self.request.method == "GET" else "chat_message"
        return super().get_throttles()

    def get(self, request, public_id):
        conversation = _authorised_conversation(request, public_id)
        if conversation is None:
            return Response({"detail": "Invalid conversation token."}, status=status.HTTP_403_FORBIDDEN)
        return Response({"messages": ChatMessageSerializer(conversation.messages.all(), many=True).data})

    def post(self, request, public_id):
        conversation = _authorised_conversation(request, public_id)
        if conversation is None:
            return Response({"detail": "Invalid conversation token."}, status=status.HTTP_403_FORBIDDEN)
        if conversation.status != ChatConversation.Status.OPEN:
            return Response({"detail": "This conversation is closed."}, status=status.HTTP_409_CONFLICT)
        serializer = CustomerMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        with transaction.atomic():
            message, created = ChatMessage.objects.get_or_create(
                conversation=conversation,
                client_message_id=data["client_message_id"],
                defaults={"sender_type": ChatMessage.SenderType.CUSTOMER, "message": data["message"]},
            )
            if created:
                conversation.last_message_at = timezone.now()
                if data.get("source"):
                    conversation.source = data["source"]
                conversation.save(update_fields=("source", "last_message_at", "updated_at"))
        if not message.email_sent_at:
            try:
                email_id = email_customer_message_to_support(message)
                mark_email_result(message, email_id=email_id)
            except ChatEmailError as exc:
                mark_email_result(message, error=str(exc))
                return Response(
                    {"detail": "Your message was saved, but email delivery failed. Please retry.", "message": ChatMessageSerializer(message).data},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )
        return Response(ChatMessageSerializer(message).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class InboundStaffReplyView(PublicChatAPIView):
    throttle_scope = "chat_inbound"

    def post(self, request, provider="generic"):
        raw_body = request.body
        configured_token = settings.CHAT_INBOUND_WEBHOOK_TOKEN
        auth_header = request.headers.get("Authorization", "")
        supplied_token = request.headers.get("X-IPC-Webhook-Token", "")
        if auth_header.lower().startswith("bearer "):
            supplied_token = auth_header[7:].strip()
        elif auth_header.lower().startswith("basic ") and not supplied_token:
            import base64
            try:
                credentials = base64.b64decode(auth_header[6:]).decode("utf-8")
                supplied_token = credentials.partition(":")[2]
            except Exception:
                supplied_token = ""
        if not configured_token or not constant_time_compare(configured_token, supplied_token):
            return Response({"detail": "Invalid webhook token."}, status=status.HTTP_403_FORBIDDEN)
        if not valid_webhook_signature(raw_body, request.headers.get("X-IPC-Webhook-Signature", "")):
            return Response({"detail": "Invalid webhook signature."}, status=status.HTTP_403_FORBIDDEN)

        payload = request.data
        if hasattr(payload, "dict"):
            payload = payload.dict()
        normalised = normalise_inbound_payload(provider, payload)
        if not staff_sender_is_allowed(normalised["sender"]):
            return Response({"detail": "Sender is not authorised."}, status=status.HTTP_403_FORBIDDEN)
        if not normalised["body"]:
            return Response({"detail": "No reply text was found."}, status=status.HTTP_400_BAD_REQUEST)
        conversation_id = extract_conversation_id(normalised)
        try:
            public_id = uuid.UUID(conversation_id)
        except (ValueError, TypeError, AttributeError):
            return Response({"detail": "Conversation reference was not found."}, status=status.HTTP_400_BAD_REQUEST)
        conversation = get_object_or_404(ChatConversation, public_id=public_id)
        provider_message_id = fallback_provider_message_id(raw_body, normalised)
        with transaction.atomic():
            message, created = ChatMessage.objects.get_or_create(
                provider_message_id=provider_message_id,
                defaults={
                    "conversation": conversation,
                    "sender_type": ChatMessage.SenderType.STAFF,
                    "message": normalised["body"],
                },
            )
            if created:
                conversation.status = ChatConversation.Status.OPEN
                conversation.last_message_at = timezone.now()
                conversation.save(update_fields=("status", "last_message_at", "updated_at"))
        if not message.email_sent_at:
            try:
                email_id = email_staff_reply_to_customer(message)
                mark_email_result(message, email_id=email_id)
            except ChatEmailError as exc:
                mark_email_result(message, error=str(exc))
                return Response({"detail": "Reply saved but customer email failed."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({"received": True, "duplicate": not created, "message_id": message.id})
