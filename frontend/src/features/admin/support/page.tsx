import { Lock, LockOpen } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { adminApi } from "@/features/admin/adminApi";
import { AdminPageHeader, AdminPageState } from "@/features/admin/components/AdminPage";
import SupportConversation from "@/features/user-panel/components/SupportConversation";
import type { SupportTicket } from "@/features/user-panel/types";
import { notifications } from "@/lib/notifications";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    const next = await adminApi.supportTickets(signal);
    setTickets(next);
    setSelectedId((current) =>
      current && next.some((ticket) => ticket.public_id === current)
        ? current
        : next[0]?.public_id || null,
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).catch((reason: unknown) => {
      if (!controller.signal.aborted) {
        notifications.error(reason instanceof Error ? reason.message : "Support conversations could not be loaded.");
        setTickets([]);
      }
    });
    const timer = window.setInterval(() => void load().catch(() => undefined), 10000);
    return () => {
      controller.abort();
      window.clearInterval(timer);
    };
  }, [load]);

  const selected = useMemo(
    () => tickets?.find((ticket) => ticket.public_id === selectedId) || tickets?.[0],
    [selectedId, tickets],
  );

  useEffect(() => {
    if (!selected?.unread_count) return;
    void adminApi.markSupportRead(selected.public_id)
      .then(() => load())
      .catch(() => undefined);
  }, [load, selected?.public_id, selected?.unread_count]);

  async function send(ticket: SupportTicket, body: string) {
    setSending(true);
    try {
      await adminApi.replyToSupport(ticket.public_id, body);
      await load();
    } catch (reason) {
      notifications.error(reason instanceof Error ? reason.message : "Reply could not be sent.");
      throw reason;
    } finally {
      setSending(false);
    }
  }

  async function toggleState() {
    if (!selected) return;
    setSending(true);
    try {
      const nextStatus = selected.status === "closed" ? "open" : "closed";
      await adminApi.updateSupportState(selected.public_id, nextStatus);
      await load();
      notifications.success(nextStatus === "closed" ? "Conversation closed." : "Conversation reopened.");
    } catch (reason) {
      notifications.error(reason instanceof Error ? reason.message : "Conversation status could not be changed.");
    } finally {
      setSending(false);
    }
  }

  return (
    <AdminPageState isLoading={tickets === null} hasData={tickets !== null}>
      <AdminPageHeader
        eyebrow="Member communications"
        title="Support chat"
        description="Read member requests and reply from the IPC administration panel."
      />
      <div className="mt-8">
        <SupportConversation
          tickets={tickets || []}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onSend={send}
          sending={sending}
          adminView
          emptyText="There are no support conversations yet."
          actions={
            selected ? (
              <button
                type="button"
                disabled={sending}
                onClick={() => void toggleState()}
                className="inline-flex items-center gap-2 rounded-xl border border-background-300 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50"
              >
                {selected.status === "closed" ? <LockOpen size={15} /> : <Lock size={15} />}
                {selected.status === "closed" ? "Reopen" : "Close"}
              </button>
            ) : null
          }
        />
      </div>
    </AdminPageState>
  );
}
