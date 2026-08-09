import { createContext } from "react";

export interface ChatContextValue {
  isOpen: boolean;
  source: string;
  openChat: (source?: string) => void;
  closeChat: () => void;
  toggleChat: () => void;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

