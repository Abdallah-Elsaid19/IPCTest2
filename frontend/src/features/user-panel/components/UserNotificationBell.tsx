import {
  Award,
  Bell,
  CheckCheck,
  FileText,
  Headphones,
  LoaderCircle,
  MessageSquareText,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";

import { panelApi } from "../api";
import type { Notification, Page } from "../types";

type NotificationPage = Page<Notification> & { unread_count: number };

function iconFor(type: string): ComponentType<{ size?: number }> {
  if (type === "support") return Headphones;
  if (type.includes("award")) return Award;
  if (type.includes("application") || type.includes("membership")) return FileText;
  return MessageSquareText;
}

function formatDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const clock = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  return sameDay
    ? `Today - ${clock}`
    : `${new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(date)} - ${clock}`;
}

export default function UserNotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<NotificationPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      setData(await panelApi.notifications(signal));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).catch(() => undefined);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void load().catch(() => undefined);
    }, 30000);
    const onFocus = () => void load().catch(() => undefined);
    window.addEventListener("focus", onFocus);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  async function openNotification(item: Notification) {
    if (!item.is_read) {
      setData((current) => current ? {
        ...current,
        unread_count: Math.max(0, current.unread_count - 1),
        results: current.results.map((notification) =>
          notification.public_id === item.public_id
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification),
      } : current);
      await panelApi.markNotificationRead(item.public_id).catch(() => void load());
    }
    setOpen(false);
    navigate(item.target_url || "/user/notifications");
  }

  async function markAll() {
    if (!data?.unread_count || markingAll) return;
    setMarkingAll(true);
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
    } finally {
      setMarkingAll(false);
    }
  }

  const unread = data?.unread_count || 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) void load().catch(() => undefined);
        }}
        className="relative rounded-full p-2.5 hover:bg-background-100"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute right-0 top-0 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-[70] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-background-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-background-200 px-4 py-3.5">
            <div>
              <p className="text-sm font-bold">Notifications</p>
              <p className="mt-0.5 text-[10px] text-foreground-500">
                {unread ? `${unread} unread` : "You're all caught up"}
              </p>
            </div>
            {unread > 0 && (
              <button
                type="button"
                disabled={markingAll}
                onClick={() => void markAll()}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-bold text-primary-800 hover:bg-primary-50"
              >
                {markingAll ? <LoaderCircle className="animate-spin" size={13} /> : <CheckCheck size={13} />}
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-[min(32rem,70vh)] overflow-y-auto">
            {loading && !data ? (
              <div className="grid min-h-40 place-items-center"><LoaderCircle className="animate-spin" size={22} /></div>
            ) : !data?.results.length ? (
              <div className="p-8 text-center text-foreground-500">
                <Bell className="mx-auto" size={24} />
                <p className="mt-3 text-sm font-semibold">No notifications yet</p>
              </div>
            ) : data.results.map((item) => {
              const Icon = iconFor(item.notification_type);
              return (
                <button
                  key={item.public_id}
                  type="button"
                  onClick={() => void openNotification(item)}
                  className={`flex w-full gap-3 border-b border-background-200 px-4 py-4 text-left hover:bg-background-50 ${
                    item.is_read ? "bg-white" : "bg-primary-50/70"
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-800">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-3">
                      <span className={`text-xs ${item.is_read ? "font-semibold" : "font-bold"}`}>{item.title}</span>
                      {!item.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" />}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[11px] leading-relaxed text-foreground-600">{item.message}</span>
                    <span className="mt-2 block text-[9px] font-bold uppercase tracking-wide text-foreground-400">
                      {item.notification_type.replaceAll("_", " ")} · {formatDate(item.created_at)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/user/notifications");
            }}
            className="w-full border-t border-background-200 px-4 py-3 text-xs font-bold text-primary-800 hover:bg-background-50"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
