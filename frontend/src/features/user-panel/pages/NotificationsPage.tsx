import { Award, Bell, CheckCheck, FileText, Headphones, MessageSquareText } from "lucide-react";
import { useCallback, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { panelApi } from "../api";
import { Empty, ErrorState, Loading, PageHeading } from "../components/PanelUI";
import { useLoad } from "../hooks";
import type { Notification, Page } from "../types";

type NotificationPage = Page<Notification> & { unread_count: number };

function iconFor(type: string): ComponentType<{ size?: number }> {
  if (type === "support") return Headphones;
  if (type.includes("award")) return Award;
  if (type.includes("application") || type.includes("membership")) return FileText;
  return MessageSquareText;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function NotificationsPage() {
  const load = useCallback((signal: AbortSignal) => panelApi.notifications(signal), []);
  const { data, loading, error, reload, setData } = useLoad<NotificationPage>(load);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function open(item: Notification) {
    if (!item.is_read) {
      try {
        const updated = await panelApi.markNotificationRead(item.public_id);
        setData((current) => current ? {
          ...current,
          unread_count: Math.max(0, current.unread_count - 1),
          results: current.results.map((entry) =>
            entry.public_id === item.public_id ? updated : entry),
        } : current);
      } catch (reason) {
        toast.error(reason instanceof Error ? reason.message : "Notification could not be updated.");
        return;
      }
    }
    navigate(item.target_url || "/user/notifications");
  }

  async function markAll() {
    if (!data?.unread_count) return;
    setBusy(true);
    try {
      await panelApi.markAllNotificationsRead();
      const readAt = new Date().toISOString();
      setData((current) => current ? {
        ...current,
        unread_count: 0,
        results: current.results.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at || readAt,
        })),
      } : current);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Notifications could not be updated.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error} retry={reload} />;

  return (
    <>
      <PageHeading
        title="Notifications"
        description="Important account, application, awards and support updates."
        action={data.unread_count > 0 ? (
          <button disabled={busy} onClick={() => void markAll()} className="btn-secondary">
            <CheckCheck size={17} />
            Mark all read
          </button>
        ) : undefined}
      />
      {!data.results.length ? (
        <Empty title="No notifications yet" text="New account and support updates will appear here." />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-background-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-background-200 bg-background-50 px-5 py-4">
            <div>
              <h2 className="font-semibold">Your updates</h2>
              <p className="mt-1 text-xs text-foreground-500">
                {data.unread_count ? `${data.unread_count} unread` : "You're all caught up"}
              </p>
            </div>
            <Bell size={20} className="text-primary-700" />
          </div>
          <div className="divide-y divide-background-200">
            {data.results.map((item) => {
              const Icon = iconFor(item.notification_type);
              return (
                <button
                  key={item.public_id}
                  type="button"
                  onClick={() => void open(item)}
                  className={`flex w-full items-start gap-4 px-5 py-5 text-left transition hover:bg-background-50 ${
                    item.is_read ? "bg-white" : "bg-primary-50/60"
                  }`}
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-800">
                    <Icon size={19} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-4">
                      <span className={item.is_read ? "font-semibold" : "font-bold"}>{item.title}</span>
                      {!item.is_read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary-600" aria-label="Unread" />}
                    </span>
                    <span className="mt-1.5 block text-sm leading-6 text-foreground-600">{item.message}</span>
                    <span className="mt-3 block text-[10px] font-bold uppercase tracking-wider text-foreground-400">
                      {item.notification_type.replaceAll("_", " ")} · {formatDate(item.created_at)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
