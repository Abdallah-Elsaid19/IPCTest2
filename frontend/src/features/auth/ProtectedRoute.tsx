import { Navigate, useLocation } from "react-router-dom";
import AdminRouteLoading from "@/features/admin/components/AdminRouteLoading";
import { useAuth } from "./AuthContext";
import { authPageUrl, postLoginPath, safeReturnPath } from "./navigation";

export function ProtectedRoute({children, requireStaff = false, requireAdmin = false, }
  : 
  {children: React.ReactNode;
  requireStaff?: boolean;
  requireAdmin?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    if (
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/dashboard")
    )
      return <AdminRouteLoading />;
    return (
      <div
        className="grid min-h-[100svh] place-items-center bg-background-950 text-primary-500"
        role="status"
      >
        Loading session…
      </div>
    );
  }
  if (!user)
    return <Navigate to={authPageUrl("/login", location.pathname + location.search + location.hash)} replace />;
  if (requireStaff && !user.is_staff) return <Navigate to="/home" replace />;
  if (requireAdmin && !(user.is_superuser || user.role === "admin"))
    return <Navigate to="/admin" replace />;
  return children;
}

export function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const requested = safeReturnPath(new URLSearchParams(location.search).get("next"))
    || safeReturnPath((location.state as { from?: string } | null)?.from);
  if (isLoading) return <div className="min-h-[100svh] bg-background-950" />;
  if (user) return <Navigate to={postLoginPath(user, requested)} replace />;
  return children;
}
