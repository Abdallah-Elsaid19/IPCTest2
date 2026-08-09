import { useCallback, useMemo, useState, type ReactNode } from "react";
import { ChatContext } from "./chat-context";

export default function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [source, setSource] = useState("general");
  const openChat = useCallback((nextSource = "general") => {
    setSource(nextSource);
    setIsOpen(true);
  }, []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((current) => !current), []);
  const value = useMemo(() => ({ isOpen, source, openChat, closeChat, toggleChat }), [closeChat, isOpen, openChat, source, toggleChat]);
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

