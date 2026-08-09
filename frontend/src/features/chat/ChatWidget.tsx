import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useLocation } from "react-router-dom";
import { createChatConversation, getChatConversation, getChatMessages, sendChatMessage } from "./api";
import { useChat } from "./useChat";
import type { ChatConversation, ChatMessage, StoredChatSession } from "./types";

const STORAGE_KEY = "ipc-public-chat-v1";
const POLL_INTERVAL_MS = 5_000;

function readStoredSession(): StoredChatSession | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as Partial<StoredChatSession> | null;
    return parsed?.id && parsed?.token && parsed?.name && parsed?.email ? parsed as StoredChatSession : null;
  } catch {
    return null;
  }
}

function storeSession(session: StoredChatSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function clearStoredSession() {
  localStorage.removeItem(STORAGE_KEY);
}

function clientId() {
  return crypto.randomUUID?.() || `${Date.now()}-4000-4000-8000-${Math.random().toString(16).slice(2).padEnd(12, "0").slice(0, 12)}`;
}

function readableTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(value));
}

export default function ChatWidget() {
  const location = useLocation();
  const { isOpen, source, closeChat, toggleChat } = useChat();
  const hiddenRoute = !location.pathname.startsWith("/membership");
  const [session, setSession] = useState<StoredChatSession | null>(() => readStoredSession());
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [name, setName] = useState(() => readStoredSession()?.name || "");
  const [email, setEmail] = useState(() => readStoredSession()?.email || "");
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(readStoredSession()));
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const pendingId = useRef<string | null>(null);
  const messagesEnd = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const hasConversation = Boolean(conversation);

  const replaceMessages = useCallback((messages: ChatMessage[]) => {
    setConversation((current) => current ? { ...current, messages } : current);
  }, []);

  const restore = useCallback(async (current: StoredChatSession, signal?: AbortSignal) => {
    try {
      const result = await getChatConversation(current.id, current.token, signal);
      setConversation(result);
      setError("");
    } catch (restoreError) {
      if (restoreError instanceof DOMException && restoreError.name === "AbortError") return;
      clearStoredSession();
      setSession(null);
      setConversation(null);
      setError("Your previous chat could not be restored. Please start a new conversation.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session || conversation) {
      setIsLoading(false);
      return;
    }
    const controller = new AbortController();
    void restore(session, controller.signal);
    return () => controller.abort();
  }, [conversation, restore, session]);

  useEffect(() => {
    if (!isOpen || !session || !hasConversation) return;
    let active = true;
    const poll = async () => {
      try {
        const result = await getChatMessages(session.id, session.token);
        if (active) replaceMessages(result.messages);
      } catch {
        // Keep the existing history; the next poll will retry quietly.
      }
    };
    const timer = window.setInterval(() => void poll(), POLL_INTERVAL_MS);
    void poll();
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [hasConversation, isOpen, replaceMessages, session]);

  useEffect(() => {
    if (!isOpen) return;
    messagesEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (conversation) inputRef.current?.focus();
  }, [conversation, conversation?.messages.length, isOpen]);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;
    setIsSending(true);
    setError("");
    let activeSession = session;
    try {
      let activeConversation = conversation;
      if (!activeSession) {
        if (!name.trim() || !email.trim()) {
          setError("Enter your name and email before sending your first message.");
          return;
        }
        const created = await createChatConversation({ name: name.trim(), email: email.trim(), source });
        if (!created.token) throw new Error("The chat could not be started.");
        activeSession = { id: created.id, token: created.token, name: created.name, email: created.email };
        activeConversation = created;
        storeSession(activeSession);
        setSession(activeSession);
        setConversation(created);
      }
      const messageId = pendingId.current || clientId();
      pendingId.current = messageId;
      const sent = await sendChatMessage(activeSession.id, activeSession.token, text, messageId, source);
      setConversation((current) => ({ ...(current || activeConversation!), messages: [...(current || activeConversation!).messages.filter((item) => item.id !== sent.id), sent] }));
      pendingId.current = null;
      setDraft("");
    } catch (sendError) {
      const message = sendError instanceof Error ? sendError.message : "Your message could not be sent. Please try again.";
      setError(message);
      if (activeSession && pendingId.current) {
        try {
          const latest = await getChatMessages(activeSession.id, activeSession.token);
          replaceMessages(latest.messages);
          if (latest.messages.some((item) => item.client_message_id === pendingId.current)) {
            pendingId.current = null;
            setDraft("");
          }
        } catch {
          // Preserve the draft and id so the visitor can safely retry.
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  const onComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void submit();
    }
  };

  if (hiddenRoute) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[120] sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          role="dialog"
          aria-label="Chat with IPC"
          className="mb-3 flex h-[min(620px,calc(100svh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden border border-primary-500/60 bg-background-50 shadow-2xl"
        >
          <header className="flex items-center justify-between bg-background-950 px-5 py-4 text-background-50">
            <div>
              <p className="font-heading text-base font-semibold">Chat with IPC</p>
              <p className="mt-0.5 text-xs text-background-400">We usually reply by email and here.</p>
            </div>
            <button type="button" onClick={closeChat} className="grid h-9 w-9 place-items-center text-xl text-background-300 transition hover:bg-background-800 hover:text-white" aria-label="Close chat">
              <i className="ri-close-line" aria-hidden="true" />
            </button>
          </header>

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center gap-3 text-sm text-foreground-600" role="status">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-background-300 border-t-primary-600" /> Restoring your chat…
            </div>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto bg-background-100/70 p-4" aria-live="polite">
                {!conversation && (
                  <div className="border border-background-200 bg-background-50 p-4 text-sm leading-relaxed text-foreground-700">
                    Ask us about membership or any IPC service. Enter your details once, then continue the conversation here.
                  </div>
                )}
                {conversation?.messages.map((item) => (
                  <div key={item.id} className={`flex ${item.sender_type === "customer" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[86%] px-3.5 py-2.5 text-sm shadow-sm ${item.sender_type === "customer" ? "bg-primary-500 text-background-950" : "border border-background-200 bg-background-50 text-foreground-800"}`}>
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{item.message}</p>
                      <time className={`mt-1.5 block text-[10px] ${item.sender_type === "customer" ? "text-background-800" : "text-foreground-500"}`} dateTime={item.created_at}>{readableTime(item.created_at)}</time>
                    </div>
                  </div>
                ))}
                <div ref={messagesEnd} />
              </div>

              <form onSubmit={submit} className="border-t border-background-200 bg-background-50 p-4">
                {!session && (
                  <div className="mb-3 grid gap-2 sm:grid-cols-2">
                    <label className="text-xs font-medium text-foreground-700">Name
                      <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={160} autoComplete="name" className="mt-1 w-full border border-background-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500" />
                    </label>
                    <label className="text-xs font-medium text-foreground-700">Email
                      <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" maxLength={254} autoComplete="email" className="mt-1 w-full border border-background-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500" />
                    </label>
                  </div>
                )}
                <label className="sr-only" htmlFor="ipc-chat-message">Your message</label>
                <textarea
                  ref={inputRef}
                  id="ipc-chat-message"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={onComposerKeyDown}
                  required
                  maxLength={4000}
                  rows={3}
                  placeholder="Type your message…"
                  className="w-full resize-none border border-background-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500"
                />
                {error && <p className="mt-2 text-xs leading-relaxed text-red-700" role="alert">{error}</p>}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-foreground-500">Enter to send · Shift+Enter for a new line</span>
                  <button type="submit" disabled={isSending || !draft.trim()} className="inline-flex items-center gap-2 bg-primary-500 px-4 py-2 text-sm font-semibold text-background-950 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50">
                    {isSending ? <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-background-800 border-t-transparent" /> Sending</> : <>Send <i className="ri-send-plane-2-line" /></>}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>
      )}
      <button
        type="button"
        onClick={toggleChat}
        className="ml-auto grid h-14 w-14 place-items-center rounded-full bg-primary-500 text-2xl text-background-950 shadow-xl transition hover:scale-105 hover:bg-primary-600 focus:outline-none focus:ring-4 focus:ring-primary-300"
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
      >
        <i className={isOpen ? "ri-close-line" : "ri-chat-3-line"} aria-hidden="true" />
      </button>
    </div>
  );
}
