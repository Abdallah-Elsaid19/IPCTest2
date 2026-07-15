import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { adminApi } from "@/features/admin/adminApi";
import type { DashboardData } from "@/features/admin/types";
import { notifications } from "@/lib/notifications";

interface AdminDashboardContextValue {
  data: DashboardData | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
}

const AdminDashboardContext = createContext<AdminDashboardContextValue | null>(null);

export function AdminDashboardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboard = useCallback(async (forceRefresh = false) => {
    forceRefresh ? setIsRefreshing(true) : setIsLoading(true);
    try {
      setData(await adminApi.dashboard(forceRefresh));
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Could not load the dashboard.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const value = useMemo(() => ({
    data,
    isLoading,
    isRefreshing,
    refresh: () => loadDashboard(true),
  }), [data, isLoading, isRefreshing, loadDashboard]);

  return <AdminDashboardContext.Provider value={value}>{children}</AdminDashboardContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminDashboard() {
  const context = useContext(AdminDashboardContext);
  if (!context) throw new Error("useAdminDashboard must be used inside AdminDashboardProvider.");
  return context;
}
