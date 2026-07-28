import { Check, CheckCheck, Headphones, MessageCircle, Search, Send, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import type { SupportTicket } from "../types";

type Props = {
  tickets: SupportTicket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSend: (ticket: SupportTicket, body: string) => Promise<void>;
  emptyText: string;
  adminView?: boolean;
  sending?: boolean;
  actions?: ReactNode;
};

function time(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function day(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function SupportConversation({
  tickets,
  selectedId,
  onSelect,
  onSend,
  emptyText,
  adminView = false,
  sending = false,
  actions,
}: Props) {
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const selected = tickets.find((ticket) => ticket.public_id === selectedId) || tickets[0];
  const visibleTickets = tickets.filter((ticket) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [
      ticket.requester_name,
      ticket.requester_email,
      ticket.subject,
      ticket.last_message?.body,
    ].some((value) => value?.toLowerCase().includes(query));
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "nearest" });
  }, [selected?.messages.length, selected?.public_id]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = body.trim();
    if (!selected || !message || selected.status === "closed") return;
    await onSend(selected, message);
    setBody("");
  }

  if (!selected) {
    return (
      <div className="grid min-h-[520px] place-items-center rounded-2xl border border-background-200 bg-white p-8 text-center">
        <div>
          <MessageCircle className="mx-auto text-primary-600" size={42} />
          <p className="mt-4 font-semibold text-foreground-900">{emptyText}</p>
        </div>
      </div>
    );
  }

  const personName = adminView
    ? selected.requester_name || selected.requester_email || "IPC member"
    : "IPC Support";

  return (
    <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-background-200 bg-white shadow-sm lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b border-background-200 bg-background-50 lg:border-b-0 lg:border-r">
        <div className="border-b border-background-200 px-5 py-4">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-foreground-500">
            {adminView ? "Members" : "Conversations"}
          </p>
          {adminView && (
            <label className="relative mt-3 block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400" size={15} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="h-10 w-full rounded-xl border border-background-300 bg-white pl-9 pr-3 text-xs outline-none focus:border-primary-500"
              />
            </label>
          )}
        </div>
        <div className="max-h-56 overflow-y-auto p-2 lg:max-h-[560px]">
          {visibleTickets.map((ticket) => {
            const active = ticket.public_id === selected.public_id;
            return (
              <button
                key={ticket.public_id}
                type="button"
                onClick={() => onSelect(ticket.public_id)}
                className={`mb-1 w-full rounded-xl p-3 text-left transition ${
                  active
                    ? "bg-primary-500 text-background-950"
                    : "hover:bg-background-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${active ? "bg-background-950 text-white" : "bg-background-200 text-foreground-700"}`}>
                    {(ticket.requester_name || ticket.subject || "U").charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">
                        {adminView ? ticket.requester_name || ticket.requester_email : ticket.subject}
                      </span>
                      {ticket.unread_count > 0 && (
                        <span className="grid min-h-5 min-w-5 shrink-0 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                          {ticket.unread_count}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block truncate text-xs opacity-70">
                      {ticket.last_message?.body || ticket.subject}
                    </span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        <header className="flex min-h-[76px] items-center justify-between gap-4 border-b border-background-200 px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-background-200 text-foreground-600">
              {adminView ? <UserRound size={23} /> : <Headphones size={22} />}
            </span>
            <div className="min-w-0">
              <h2 className="truncate font-semibold">{personName}</h2>
              <p className="truncate text-xs text-foreground-500">{selected.subject}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">{actions}</div>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto bg-white px-4 py-6 sm:px-6">
          {selected.messages.map((message, index) => {
            const previous = selected.messages[index - 1];
            const showDay = !previous || day(previous.created_at) !== day(message.created_at);
            const staff = message.is_staff_reply;
            return (
              <div key={message.id}>
                {showDay && (
                  <div className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-wider text-foreground-400">
                    <span className="h-px flex-1 bg-background-200" />
                    {day(message.created_at)}
                    <span className="h-px flex-1 bg-background-200" />
                  </div>
                )}
                <div className={`flex items-end gap-2 ${staff ? "justify-end" : "justify-start"}`}>
                  {!staff && (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-background-200 text-foreground-600">
                      <UserRound size={19} />
                    </span>
                  )}
                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                      staff
                        ? "rounded-br-sm bg-primary-600 text-background-950"
                        : "rounded-bl-sm bg-background-100 text-foreground-900"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>
                    <p className={`mt-1 flex items-center gap-1 text-[10px] ${staff ? "justify-end text-background-800" : "text-foreground-500"}`}>
                      <span>{message.author_name} · {time(message.created_at)}</span>
                      {((adminView && staff) || (!adminView && !staff)) && (
                        message.is_read
                          ? <CheckCheck size={14} aria-label="Read" />
                          : <Check size={14} aria-label="Sent" />
                      )}
                    </p>
                  </div>
                  {staff && (
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-background-950 text-primary-500">
                      <Headphones size={18} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {selected.status === "closed" ? (
          <div className="border-t border-background-200 bg-background-50 px-5 py-4 text-center text-sm text-foreground-600">
            This conversation is closed.
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="flex items-end gap-3 border-t border-background-200 bg-white p-4">
            <textarea
              rows={1}
              maxLength={8000}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Type a message..."
              aria-label="Message"
              className="max-h-36 min-h-12 flex-1 resize-y rounded-xl border border-background-300 px-4 py-3 text-sm outline-none focus:border-primary-500"
            />
            <button
              disabled={sending || !body.trim()}
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-600 text-background-950 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send size={19} />
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
