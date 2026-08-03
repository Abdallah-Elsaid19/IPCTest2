import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Award,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  GraduationCap,
  Headphones,
  Home,
  LogOut,
  Menu,
  Settings,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";
import UserNotificationBell from "@/features/user-panel/components/UserNotificationBell";

const nav = [
  ["Dashboard", "dashboard", Home],
  ["My profile", "profile", UserRound],
  ["Membership", "membership", Award],
  ["Scholarships", "scholarships", GraduationCap],
  ["Awards", "awards", Award],
  ["Clubs", "clubs", Users],
  ["Event bookings", "bookings", CalendarDays],
  ["Documents", "documents", FileText],
  ["Notifications", "notifications", Bell],
  ["Support", "support", Headphones],
  ["Settings", "settings", Settings],
] as const;

export default function UserPanelLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const section = nav.find(([, path]) => pathname.includes(`/user/${path}`))?.[0] || "Member area";
  const initials = useMemo(
    () => `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U",
    [user],
  );
  const compact = collapsed && !mobileOpen;

  async function signOut() {
    await logout();
    navigate("/login", { replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col overflow-hidden rounded-[22px] bg-[#0B0B0B] text-white shadow-[0_18px_50px_rgba(11,11,11,0.18)]">
      <div className={`flex h-[72px] items-center border-b border-white/10 ${compact ? "justify-center px-3" : "justify-between px-5"}`}>
        {!compact && (
          <NavLink to="/home" onClick={() => setMobileOpen(false)} className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-500 text-xs font-black text-[#0B0B0B]">IPC</span>
            <span>
              <span className="block text-sm font-bold">IPC Member</span>
              <span className="block text-[9px] uppercase tracking-[.18em] text-white/60">Member area</span>
            </span>
          </NavLink>
        )}
        <button
          type="button"
          onClick={() => mobileOpen ? setMobileOpen(false) : setCollapsed((value) => !value)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white"
          aria-label={mobileOpen ? "Close navigation" : "Toggle navigation"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={21} />}
        </button>
      </div>

      <nav className={`flex-1 overflow-y-auto py-5 ${compact ? "px-3" : "px-4"}`} aria-label="Member navigation">
        {!compact && <p className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[.24em] text-white/60">Workspace</p>}
        {nav.map(([label, path, Icon]) => (
          <NavLink
            key={path}
            to={path}
            title={compact ? label : undefined}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `mb-1 flex items-center rounded-xl py-3 text-sm transition-colors ${
                compact ? "justify-center px-2" : "gap-3 px-3"
              } ${
                isActive
                  ? "bg-primary-500 font-semibold text-[#0B0B0B]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon size={18} />
            {!compact && label}
          </NavLink>
        ))}
        <div className="my-5 h-px bg-white/10" />
        <NavLink
          to="/home"
          className={`flex items-center rounded-xl py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white ${
            compact ? "justify-center px-2" : "gap-3 px-3"
          }`}
        >
          <ChevronLeft size={17} />
          {!compact && "Back to website"}
        </NavLink>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className={`flex items-center rounded-xl bg-white/5 p-2.5 ${compact ? "justify-center" : "gap-3"}`}>
          <NavLink to="profile" className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-500 text-xs font-black text-[#0B0B0B]">
            {user?.profile_image_url
              ? <img src={user.profile_image_url} alt="" className="h-full w-full object-cover" />
              : initials}
          </NavLink>
          {!compact && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{user?.name || user?.email}</p>
                <p className="truncate text-[10px] text-white/50">{user?.membership_grade || "IPC account"}</p>
              </div>
              <button type="button" onClick={() => void signOut()} className="grid h-8 w-8 place-items-center text-white/50 hover:text-red-300" aria-label="Sign out">
                <LogOut size={17} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`user-panel-shell min-h-[100svh] bg-[#F4ECE1] text-[#221E1A] transition-[grid-template-columns] duration-300 xl:grid ${
      collapsed ? "xl:grid-cols-[96px_minmax(0,1fr)]" : "xl:grid-cols-[280px_minmax(0,1fr)]"
    }`}>
      <aside className="sticky top-0 hidden h-[100dvh] p-5 pr-0 xl:block">{sidebar}</aside>
      {mobileOpen && (
        <>
          <button type="button" className="fixed inset-0 z-[70] bg-black/45 xl:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" />
          <aside className="fixed inset-y-0 left-0 z-[80] w-[min(280px,calc(100vw-1rem))] p-2 sm:p-4 xl:hidden">{sidebar}</aside>
        </>
      )}

      <div className="min-w-0 p-2 sm:p-4 xl:py-5 xl:pr-5">
        <header className="sticky top-2 z-40 flex h-16 min-w-0 items-center justify-between gap-2 rounded-2xl border border-white/80 bg-[#FFFDF9]/95 px-3 shadow-[0_8px_30px_rgba(66,48,31,0.06)] backdrop-blur-xl sm:top-4 sm:px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button type="button" className="grid h-10 w-10 place-items-center rounded-xl border border-[#D4C6B5] xl:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
              <Menu size={20} />
            </button>
            <div className="flex min-w-0 items-center gap-1 text-sm text-[#7A7066]">
              <span className="hidden sm:inline">Member area</span>
              <ChevronRight className="hidden sm:block" size={14} />
              <span className="truncate font-semibold text-[#221E1A]">{section}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <UserNotificationBell />
            <NavLink to="profile" className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-[#F4ECE1]">
              <div className="hidden text-right sm:block">
                <p className="text-xs font-bold">{user?.name || user?.email}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-primary-800">{user?.membership_grade || "IPC member"}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[#0B0B0B] text-xs font-bold text-white">
                {user?.profile_image_url
                  ? <img src={user.profile_image_url} alt="" className="h-full w-full object-cover" />
                  : initials}
              </span>
            </NavLink>
          </div>
        </header>

        <main className="mt-2 min-h-[calc(100vh-6.75rem)] min-w-0 rounded-2xl border border-white/70 bg-white/65 px-3 py-5 text-[#221E1A] shadow-[0_8px_30px_rgba(66,48,31,0.04)] sm:mt-4 sm:px-5 sm:py-7 md:px-8 md:py-9">
          <div className="mx-auto max-w-[1500px]"><Outlet /></div>
        </main>
      </div>
    </div>
  );
}
