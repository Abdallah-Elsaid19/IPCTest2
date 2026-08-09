from django.contrib import admin

from .models import ChatConversation, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    fields = ("sender_type", "message", "created_at", "email_sent_at", "email_error")
    readonly_fields = ("sender_type", "message", "created_at", "email_sent_at", "email_error")
    can_delete = False
    ordering = ("created_at",)


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ("customer_name", "customer_email", "source", "status", "last_message_at")
    list_filter = ("status", "source")
    search_fields = ("customer_name", "customer_email", "public_id", "messages__message")
    readonly_fields = ("public_id", "access_token_hash", "last_message_at", "created_at", "updated_at")
    inlines = (ChatMessageInline,)


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("conversation", "sender_type", "created_at", "email_sent_at")
    list_filter = ("sender_type", "email_sent_at")
    search_fields = ("conversation__customer_email", "conversation__public_id", "message", "provider_message_id")
    readonly_fields = ("created_at", "email_sent_at", "email_error", "outbound_email_id")

