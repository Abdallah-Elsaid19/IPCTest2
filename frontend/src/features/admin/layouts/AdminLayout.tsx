import { useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ExternalLink,
  FileText,
  FileJson,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  ShieldCheck,
  Trophy,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";
import { AdminDashboardProvider } from "@/features/admin/context/AdminDashboardContext";
import SEO from "@/components/seo/SEO";

const navigation = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/applications", label: "Applications", icon: FileText },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/awards", label: "Awards", icon: Trophy },
  { to: "/admin/membership-grades", label: "Member grades", icon: GraduationCap },
  { to: "/admin/content", label: "Content", icon: FileJson },
  { to: "/dashboard/users", label: "Users", icon: UsersRound },
  { to: "/admin/profile", label: "Profile", icon: UserRound },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logoutLock = useRef(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const djangoAdminUrl = (
    import.meta.env.VITE_DJANGO_ADMIN_URL || "http://localhost:8000/admin/"
  ).replace(/\/?$/, "/");

  const initials = useMemo(() => {
    if (!user) return "A";
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return (parts.length ? parts : [user.name])
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const isNavigationActive = (to: string) =>
    location.pathname === to ||
    (to !== "/admin" && location.pathname.startsWith(`${to}/`));
  const pageLabel =
    navigation.find(({ to }) => isNavigationActive(to))?.label || "Admin";
  const visibleNavigation = navigation.filter(
    ({ to }) =>
      to !== "/dashboard/users" ||
      user?.is_superuser ||
      user?.role === "admin",
  );
  const compact = collapsed && !mobileOpen;
  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async () => {
    if (logoutLock.current) return;
    logoutLock.current = true;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate("/login", { replace: true });
    } finally {
      logoutLock.current = false;
      setIsLoggingOut(false);
    }
  };

  const sidebar = (
    <div className="flex h-full flex-col overflow-hidden rounded-[22px] bg-[#0B0B0B] text-white shadow-[0_18px_50px_rgba(11,11,11,0.18)]">
      <div
        className={`flex h-[72px] items-center border-b border-white/10 ${compact ? "justify-center px-3" : "justify-between px-5"}`}
      >
        {!compact && (
          <Link
            to="/home"
            onClick={closeMobile}
            className="flex min-w-0 items-center gap-3"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-500 text-xs font-black text-[#0B0B0B]">
              IPC
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">IPC Admin</p>
              <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                Control centre
              </p>
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={() =>
            mobileOpen ? setMobileOpen(false) : setCollapsed((value) => !value)
          }
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={mobileOpen ? "Close navigation" : "Toggle navigation"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={21} />}
        </button>
      </div>

      <nav
        className={`flex-1 space-y-1 overflow-y-auto py-5 ${compact ? "px-3" : "px-4"}`}
        aria-label="Admin navigation"
      >
        {!compact && (
          <p className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[0.24em] text-white/30">
            Workspace
          </p>
        )}
        {visibleNavigation.map(({ to, label, icon: Icon }) => {
          const active = isNavigationActive(to);
          return (
            <Link
              key={to}
              to={to}
              title={compact ? label : undefined}
              onClick={closeMobile}
              className={`flex items-center rounded-xl py-3 text-sm transition-colors ${compact ? "justify-center px-2" : "gap-3 px-3"} ${active ? "bg-primary-500 font-semibold text-[#0B0B0B]" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
            >
              <Icon size={18} />
              {!compact && label}
            </Link>
          );
        })}
        <div className="my-5 h-px bg-white/10" />
        <a
          href={djangoAdminUrl}
          target="_blank"
          rel="noreferrer"
          title={compact ? "Django Admin" : undefined}
          className={`flex items-center rounded-xl py-3 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white ${compact ? "justify-center px-2" : "gap-3 px-3"}`}
        >
          <ExternalLink size={17} />
          {!compact && "Django Admin"}
        </a>
        <Link
          to="/home"
          title={compact ? "Back to website" : undefined}
          className={`flex items-center rounded-xl py-3 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white ${compact ? "justify-center px-2" : "gap-3 px-3"}`}
        >
          <ChevronLeft size={17} />
          {!compact && "Back to website"}
        </Link>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div
          className={`flex items-center rounded-xl bg-white/5 p-2.5 ${compact ? "justify-center" : "gap-3"}`}
        >
          <Link
            to="/admin/profile"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-500 text-xs font-black text-[#0B0B0B]"
            aria-label="Open profile"
          >
            {initials}
          </Link>
          {!compact && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user?.name}</p>
                <p className="truncate text-[10px] text-white/40">
                  {user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                aria-busy={isLoggingOut}
                className="grid h-8 w-8 place-items-center text-white/40 transition-colors hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={isLoggingOut ? "Signing out" : "Sign out"}
              >
                {isLoggingOut ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <LogOut size={17} />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-[#F4ECE1] text-[#221E1A] transition-[grid-template-columns] duration-300 xl:grid ${collapsed ? "xl:grid-cols-[96px_minmax(0,1fr)]" : "xl:grid-cols-[280px_minmax(0,1fr)]"}`}
    >
      <SEO
        title={`Admin — ${pageLabel}`}
        description="Internal Institute of Project Controls administration dashboard."
        canonicalPath={location.pathname}
        noIndex
      />
      <aside className="sticky top-0 hidden h-screen p-5 pr-0 xl:block">
        {sidebar}
      </aside>
      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[70] bg-black/45 xl:hidden"
            onClick={closeMobile}
            aria-label="Close navigation overlay"
          />
          <aside className="fixed inset-y-0 left-0 z-[80] w-[280px] p-4 xl:hidden">
            {sidebar}
          </aside>
        </>
      )}

      <div className="min-w-0 p-4 xl:py-5 xl:pr-5">
        <header className="sticky top-4 z-40 flex h-16 items-center justify-between rounded-2xl border border-white/80 bg-[#FFFDF9]/95 px-4 shadow-[0_8px_30px_rgba(66,48,31,0.06)] backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-[#D4C6B5] xl:hidden"
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-sm font-bold">Admin / {pageLabel}</p>
              <p className="hidden text-xs text-[#7A7066] sm:block">
                Institute of Project Controls
              </p>
            </div>
          </div>
          <Link
            to="/admin/profile"
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#F4ECE1]"
          >
            <div className="hidden text-right sm:block">
              <p className="text-xs font-bold">{user?.name}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-primary-800">
                {user?.role || "Administrator"}
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0B0B0B] text-xs font-bold text-white">
              {initials}
            </span>
          </Link>
        </header>

        <main className="mt-4 min-h-[calc(100vh-6.75rem)] rounded-2xl border border-white/70 bg-white/65 shadow-[0_8px_30px_rgba(66,48,31,0.04)]">
          <AdminDashboardProvider>
            <Outlet />
          </AdminDashboardProvider>
        </main>
      </div>
    </div>
  );
}
