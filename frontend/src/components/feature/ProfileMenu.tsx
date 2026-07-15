import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const initials = useMemo(() => {
    if (!user) return "";
    const names = [user.first_name, user.last_name].filter(Boolean);
    return (names.length ? names : [user.name]).map((name) => name.charAt(0)).join("").slice(0, 2).toUpperCase();
  }, [user]);

  useEffect(() => setIsOpen(false), [location.pathname]);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div ref={menuRef} className="relative hidden lg:block">
      <button type="button" onClick={() => setIsOpen((value) => !value)} className="flex items-center gap-2 text-background-300 transition-colors hover:text-background-50" aria-haspopup="menu" aria-expanded={isOpen} aria-label="Open account menu">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-primary-500/60 bg-primary-500/15 text-xs font-bold text-primary-400">{initials}</span>
        <ChevronDown size={15} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] w-72 border border-background-700/70 bg-background-950 shadow-[0_24px_60px_rgba(0,0,0,0.45)]" role="menu">
          <div className="border-b border-background-800 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-500 text-sm font-bold text-background-950">{initials}</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-background-50">{user.name}</p>
                <p className="truncate text-xs text-background-500">{user.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.16em] text-primary-500">
              <ShieldCheck size={13} />
              {user.role || (user.is_staff ? "Staff account" : "Member account")}
            </div>
          </div>
          <div className="p-2">
            {user.is_staff && (
              <>
                <Link to="/admin" className="flex items-center gap-3 px-3 py-3 text-sm text-background-300 transition-colors hover:bg-background-900 hover:text-background-50" role="menuitem">
                  <LayoutDashboard size={17} className="text-primary-500" /> Dashboard
                </Link>
                <Link to="/admin/profile" className="flex items-center gap-3 px-3 py-3 text-sm text-background-300 transition-colors hover:bg-background-900 hover:text-background-50" role="menuitem">
                  <UserRound size={17} className="text-primary-500" /> Profile
                </Link>
              </>
            )}
            <button type="button" onClick={() => void handleLogout()} className="flex w-full items-center gap-3 px-3 py-3 text-sm text-background-300 transition-colors hover:bg-background-900 hover:text-red-300" role="menuitem">
              <LogOut size={17} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
