import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

import { adminApi } from "@/features/admin/adminApi";
import type { AdminApplicationDetail, DashboardData } from "@/features/admin/types";
import { notifications } from "@/lib/notifications";

interface AdminDashboardContextValue {
  data: DashboardData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  updateRecentApplication: (
    application: AdminApplicationDetail,
    previousStatus?: string,
  ) => void;
}

const AdminDashboardContext = createContext<AdminDashboardContextValue | null>(null);

export function AdminDashboardProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const activeRequest = useRef<Promise<void> | null>(null);

  const loadDashboard = useCallback(async (forceRefresh = false) => {
    if (activeRequest.current) return activeRequest.current;

    const request = (async () => {
      forceRefresh ? setIsRefreshing(true) : setIsLoading(true);
      try {
        setData(await adminApi.dashboard(forceRefresh));
      } catch (error) {
        notifications.error(error instanceof Error ? error.message : "Could not load the dashboard.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    })();
    activeRequest.current = request;
    try {
      await request;
    } finally {
      if (activeRequest.current === request) activeRequest.current = null;
    }
  }, []);

  const needsDashboardData =
    pathname === "/admin" ||
    pathname.startsWith("/admin/enquiries") ||
    pathname === "/admin/events";

  useEffect(() => {
    if (needsDashboardData && !data) void loadDashboard();
  }, [data, loadDashboard, needsDashboardData]);

  const updateRecentApplication = useCallback((
    application: AdminApplicationDetail,
    previousStatus?: string,
  ) => {
    setData((current) => {
      if (!current) return current;
      const nextStatus = application.status;
      const statusChanged = Boolean(previousStatus && previousStatus !== nextStatus);
      const pendingStatuses = new Set(["submitted", "under_review"]);
      const pendingDelta = statusChanged
        ? Number(pendingStatuses.has(nextStatus)) - Number(pendingStatuses.has(previousStatus!))
        : 0;
      const applicationStatuses = { ...current.application_statuses };
      if (statusChanged) {
        applicationStatuses[previousStatus!] = Math.max(
          0,
          (applicationStatuses[previousStatus!] || 0) - 1,
        );
        applicationStatuses[nextStatus] = (applicationStatuses[nextStatus] || 0) + 1;
      }
      return {
        ...current,
        application_statuses: applicationStatuses,
        counts: {
          ...current.counts,
          applications_pending: Math.max(
            0,
            current.counts.applications_pending + pendingDelta,
          ),
        },
        recent_applications: current.recent_applications.map((item) =>
          item.id === application.id
            ? {
                ...item,
                status: nextStatus,
                approved_user_email: application.approved_user_email,
              }
            : item,
        ),
      };
    });
  }, []);

  const value = useMemo(() => ({
    data,
    isLoading,
    isRefreshing,
    refresh: () => loadDashboard(true),
    updateRecentApplication,
  }), [data, isLoading, isRefreshing, loadDashboard, updateRecentApplication]);

  return <AdminDashboardContext.Provider value={value}>{children}</AdminDashboardContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminDashboard() {
  const context = useContext(AdminDashboardContext);
  if (!context) throw new Error("useAdminDashboard must be used inside AdminDashboardProvider.");
  return context;
}
