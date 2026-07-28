import {
  Bell,
  CheckCheck,
  FileText,
  Headphones,
  LoaderCircle,
  Mail,
  MessageSquareText,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { useNavigate } from "react-router-dom";

import { adminApi } from "@/features/admin/adminApi";
import type {
  AdminNotification,
  AdminNotificationType,
  PaginatedAdminNotifications,
} from "@/features/admin/types";
import { adminUrl } from "@/features/admin/utils";

const typeStyles: Record<
  AdminNotificationType,
  { icon: ComponentType<{ size?: number }>; iconClass: string; label: string }
> = {
  contact: {
    icon: MessageSquareText,
    iconClass: "bg-blue-100 text-blue-700",
    label: "Contact",
  },
  application: {
    icon: FileText,
    iconClass: "bg-primary-100 text-primary-800",
    label: "Application",
  },
  subscriber: {
    icon: Mail,
    iconClass: "bg-emerald-100 text-emerald-700",
    label: "Subscriber",
  },
  support: {
    icon: Headphones,
    iconClass: "bg-violet-100 text-violet-700",
    label: "Support",
  },
};

function formatNotificationDate(value: string) {
  const date = new Date(value);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const notificationDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const dayDifference = Math.round(
    (today.getTime() - notificationDay.getTime()) / 86_400_000,
  );
  const time = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  if (dayDifference === 0) return `Today - ${time}`;
  if (dayDifference === 1) return `Yesterday - ${time}`;
  return `${new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)} - ${time}`;
}

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<PaginatedAdminNotifications | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadNotifications = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await adminApi.notifications(signal);
      setData(response);
      setError("");
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError("Notifications could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadNotifications(controller.signal);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadNotifications();
    }, 30_000);
    const onFocus = () => void loadNotifications();
    window.addEventListener("focus", onFocus);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const markLocallyRead = (notificationId: number) => {
    setData((current) => {
      if (!current) return current;
      const notification = current.results.find((item) => item.id === notificationId);
      if (!notification || notification.is_read) return current;
      return {
        ...current,
        unread_count: Math.max(0, current.unread_count - 1),
        results: current.results.map((item) =>
          item.id === notificationId
            ? { ...item, is_read: true, read_at: new Date().toISOString() }
            : item,
        ),
      };
    });
  };

  const openNotification = async (notification: AdminNotification) => {
    if (!notification.is_read) {
      markLocallyRead(notification.id);
      try {
        await adminApi.markNotificationRead(notification.id);
      } catch {
        void loadNotifications();
      }
    }
    setOpen(false);
    if (notification.notification_type === "subscriber") {
      window.location.assign(
        `${adminUrl}newsletter/newslettersignup/${notification.source_id}/change/`,
      );
      return;
    }
    navigate(notification.target_url);
  };

  const markAllRead = async () => {
    if (!data?.unread_count || isMarkingAll) return;
    setIsMarkingAll(true);
    try {
      await adminApi.markAllNotificationsRead();
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
      setError("");
    } catch {
      setError("Notifications could not be updated.");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const unreadCount = data?.unread_count ?? 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          if (!open) void loadNotifications();
        }}
        className="relative grid h-10 w-10 place-items-center rounded-xl text-[#61584F] transition-colors hover:bg-[#F4ECE1] hover:text-primary-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-primary-600 px-1 text-[9px] font-black leading-none text-white ring-2 ring-[#FFFDF9]"
            aria-hidden="true"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Admin notifications"
          className="absolute right-0 top-12 z-[70] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_24px_70px_rgba(33,27,21,0.22)]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-[#E8DED2] px-4 py-3.5">
            <div>
              <p className="text-sm font-black text-[#171411]">Notifications</p>
              <p className="mt-0.5 text-[10px] text-[#7A7066]">
                {unreadCount ? `${unreadCount} unread` : "You're all caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void markAllRead()}
                disabled={isMarkingAll}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-bold text-primary-800 transition-colors hover:bg-primary-100 disabled:opacity-50"
              >
                {isMarkingAll
                  ? <LoaderCircle size={13} className="animate-spin" />
                  : <CheckCheck size={13} />}
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[min(32rem,70vh)] overflow-y-auto">
            {isLoading && !data ? (
              <div className="grid min-h-40 place-items-center text-[#7A7066]">
                <LoaderCircle size={22} className="animate-spin" />
              </div>
            ) : error && !data ? (
              <div className="p-6 text-center">
                <p className="text-xs text-red-700">{error}</p>
                <button
                  type="button"
                  onClick={() => void loadNotifications()}
                  className="mt-3 text-xs font-bold text-primary-800"
                >
                  Try again
                </button>
              </div>
            ) : !data?.results.length ? (
              <div className="p-8 text-center">
                <Bell size={24} className="mx-auto text-[#B7AA9A]" />
                <p className="mt-3 text-sm font-bold text-[#514A43]">No notifications yet</p>
                <p className="mt-1 text-xs text-[#8A7E72]">
                  New enquiries, applications and subscribers will appear here.
                </p>
              </div>
            ) : (
              data.results.map((notification) => {
                const type = typeStyles[notification.notification_type];
                const Icon = type.icon;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => void openNotification(notification)}
                    className={`flex w-full gap-3 border-b border-[#EEE5DA] px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-[#F8F0E6] ${
                      notification.is_read ? "bg-[#FFFDF9]" : "bg-primary-50/70"
                    }`}
                  >
                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${type.iconClass}`}>
                      <Icon size={16} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span className={`text-xs text-[#171411] ${notification.is_read ? "font-semibold" : "font-black"}`}>
                          {notification.title}
                        </span>
                        {!notification.is_read && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-600" aria-label="Unread" />
                        )}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-[11px] leading-relaxed text-[#6F655B]">
                        {notification.message}
                      </span>
                      <span className="mt-2 flex items-center gap-2 text-[9px] font-bold uppercase tracking-wide text-[#998C7E]">
                        <span className="text-primary-800">{type.label}</span>
                        <span aria-hidden="true">-</span>
                        <time dateTime={notification.created_at}>
                          {formatNotificationDate(notification.created_at)}
                        </time>
                      </span>
                    </span>
                  </button>
                );
              })
            )}
          </div>
          {error && data && (
            <p className="border-t border-[#E8DED2] px-4 py-2 text-[10px] text-red-700">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
