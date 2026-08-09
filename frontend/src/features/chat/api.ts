import { apiJson } from "../../lib/api";
import type { ChatConversation, ChatMessage } from "./types";

const tokenHeaders = (token: string) => ({ "X-Chat-Token": token });

export function createChatConversation(input: { name: string; email: string; source: string }) {
  return apiJson<ChatConversation>("/api/chat/conversations", { ...input, website: "" }, {
    method: "POST",
    dedupe: false,
    requestSource: "public-chat-create",
  });
}

export function getChatConversation(id: string, token: string, signal?: AbortSignal) {
  return apiJson<ChatConversation>(`/api/chat/conversations/${id}`, undefined, {
    headers: tokenHeaders(token),
    signal,
    dedupe: false,
    requestSource: "public-chat-restore",
  });
}

export function getChatMessages(id: string, token: string, signal?: AbortSignal) {
  return apiJson<{ messages: ChatMessage[] }>(`/api/chat/conversations/${id}/messages`, undefined, {
    headers: tokenHeaders(token),
    signal,
    dedupe: false,
    requestSource: "public-chat-poll",
  });
}

export function sendChatMessage(id: string, token: string, message: string, clientMessageId: string, source: string) {
  return apiJson<ChatMessage>(`/api/chat/conversations/${id}/messages`, {
    message,
    client_message_id: clientMessageId,
    source,
    website: "",
  }, {
    method: "POST",
    headers: tokenHeaders(token),
    dedupe: false,
    idempotencyKey: clientMessageId,
    requestSource: "public-chat-message",
  });
}
