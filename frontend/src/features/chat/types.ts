export type ChatSender = "customer" | "staff";

export interface ChatMessage {
  id: number;
  sender_type: ChatSender;
  message: string;
  client_message_id: string | null;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  name: string;
  email: string;
  source: string;
  status: "open" | "closed" | "spam";
  messages: ChatMessage[];
  token?: string;
}

export interface StoredChatSession {
  id: string;
  token: string;
  name: string;
  email: string;
}

