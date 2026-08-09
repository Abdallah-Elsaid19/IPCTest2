from rest_framework import serializers

from .models import ChatConversation, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ("id", "sender_type", "message", "client_message_id", "created_at")
        read_only_fields = fields


class ConversationCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=160, trim_whitespace=True)
    email = serializers.EmailField(max_length=254)
    source = serializers.CharField(max_length=80, required=False, default="general", trim_whitespace=True)
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate_website(self, value):
        if value:
            raise serializers.ValidationError("Unable to create this conversation.")
        return value

    def validate_source(self, value):
        return value or "general"


class CustomerMessageCreateSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000, trim_whitespace=True)
    client_message_id = serializers.UUIDField()
    source = serializers.CharField(max_length=80, required=False, allow_blank=True, trim_whitespace=True)
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate_message(self, value):
        if not value.strip():
            raise serializers.ValidationError("Enter a message.")
        return value.strip()

    def validate_website(self, value):
        if value:
            raise serializers.ValidationError("Unable to send this message.")
        return value
