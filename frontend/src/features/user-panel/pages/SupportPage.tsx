import { Plus, X } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";

import { notifications } from "@/lib/notifications";
import { panelApi, rows } from "../api";
import { Card, ErrorState, inputClass, Loading, PageHeading } from "../components/PanelUI";
import SupportConversation from "../components/SupportConversation";
import type { SupportMessage, SupportTicket } from "../types";

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newRequest, setNewRequest] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    const result = await panelApi.list<SupportTicket>("support", signal);
    const next = rows(result);
    setTickets(next);
    setSelectedId((current) =>
      current && next.some((ticket) => ticket.public_id === current)
        ? current
        : next[0]?.public_id || null,
    );
    setError("");
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).catch((reason: unknown) => {
      if (!controller.signal.aborted) {
        setError(reason instanceof Error ? reason.message : "Support conversations could not be loaded.");
      }
    });
    const timer = window.setInterval(() => void load().catch(() => undefined), 10000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [load]);

  const selectedTicket = tickets?.find((ticket) => ticket.public_id === selectedId);
  useEffect(() => {
    if (!selectedTicket?.unread_count) return;
    void panelApi.action<{ updated: number }>(
      `support/${selectedTicket.public_id}/read`,
    ).then(() => load()).catch(() => undefined);
  }, [load, selectedTicket?.public_id, selectedTicket?.unread_count]);

  async function send(ticket: SupportTicket, body: string) {
    setSending(true);
    try {
      await panelApi.create<SupportMessage>(`support/${ticket.public_id}/reply`, { body });
      await load();
    } catch (reason) {
      notifications.error(reason instanceof Error ? reason.message : "Message could not be sent.");
      throw reason;
    } finally {
      setSending(false);
    }
  }

  async function createRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSending(true);
    try {
      const ticket = await panelApi.create<SupportTicket>("support", {
        category: form.get("category"),
        subject: form.get("subject"),
        initial_message: form.get("message"),
      });
      await load();
      setSelectedId(ticket.public_id);
      setNewRequest(false);
      notifications.success("Your support conversation is ready.");
    } catch (reason) {
      notifications.error(reason instanceof Error ? reason.message : "Support request could not be created.");
    } finally {
      setSending(false);
    }
  }

  if (!tickets && !error) return <Loading />;
  if (error && !tickets) return <ErrorState message={error} retry={() => void load()} />;

  return (
    <>
      <PageHeading
        title="Support chat"
        description="Chat securely with the IPC support team and keep every reply in one place."
        action={
          <button className="btn-primary" onClick={() => setNewRequest((value) => !value)}>
            {newRequest ? <X size={17} /> : <Plus size={17} />}
            {newRequest ? "Cancel" : "New conversation"}
          </button>
        }
      />
      {newRequest && (
        <Card className="mb-6">
          <form onSubmit={(event) => void createRequest(event)} className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="text-sm font-medium">Category</span>
              <select name="category" className={inputClass}>
                <option value="account">Account</option>
                <option value="membership">Membership</option>
                <option value="events">Events</option>
                <option value="awards">Awards</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              <span className="text-sm font-medium">Subject</span>
              <input required maxLength={180} name="subject" className={inputClass} />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-medium">How can we help?</span>
              <textarea required minLength={10} maxLength={8000} name="message" rows={4} className={inputClass} />
            </label>
            <button disabled={sending} className="btn-primary sm:col-span-2 sm:justify-self-start">
              {sending ? "Starting..." : "Start conversation"}
            </button>
          </form>
        </Card>
      )}
      <SupportConversation
        tickets={tickets || []}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onSend={send}
        sending={sending}
        emptyText="Start a conversation and the IPC support team will reply here."
      />
    </>
  );
}
