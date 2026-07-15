import { Navigate, useLocation } from "react-router-dom";
import AdminRouteLoading from "@/features/admin/components/AdminRouteLoading";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children, requireStaff = false, requireAdmin = false }: { children: React.ReactNode; requireStaff?: boolean; requireAdmin?: boolean }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/dashboard")) return <AdminRouteLoading />;
    return <div className="min-h-screen bg-background-950 grid place-items-center text-primary-500" role="status">Loading session…</div>;
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (requireStaff && !user.is_staff) return <Navigate to="/home" replace />;
  if (requireAdmin && !(user.is_superuser || (user.is_staff && (user.role === "admin" || user.role === null)))) return <Navigate to="/admin" replace />;
  return children;
}

export function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen bg-background-950" />;
  if (user) return <Navigate to={user.is_staff ? "/admin" : "/home"} replace />;
  return children;
}
