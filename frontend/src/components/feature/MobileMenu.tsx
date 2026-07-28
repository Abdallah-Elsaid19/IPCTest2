import { useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "react-router-dom";
import { isNavigationGroupActive, isNavigationPathActive, navigation } from "@/config/navigation";
import { useAuth } from "@/features/auth/AuthContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}

export default function MobileMenu({ isOpen, onClose, currentPath, returnFocusRef }: MobileMenuProps) {
  const { user, isLoading, logout } = useAuth();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const returnFocusElement = returnFocusRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const panel = closeRef.current?.closest("[role=dialog]");
      const focusable = panel?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      returnFocusElement?.focus();
    };
  }, [isOpen, onClose, returnFocusRef]);

  return (
    <div className={`fixed inset-0 z-[60] transition-opacity ${isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} aria-hidden={!isOpen}>
      <div className="absolute inset-0 bg-background-950/70 backdrop-blur-sm" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label="Site menu" className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-background-50 shadow-2xl transition-transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between border-b border-background-200 px-6">
          <span className="font-heading text-lg font-semibold text-background-950">Menu</span>
          <button ref={closeRef} onClick={onClose} className="flex h-10 w-10 items-center justify-center hover:bg-background-200/50" aria-label="Close menu"><i className="ri-close-line text-2xl" /></button>
        </div>
        <nav className="flex-1 overflow-y-auto px-6 py-5" aria-label="Mobile navigation">
          {navigation.map((item) => {
            const isActive = isNavigationGroupActive(currentPath, item);
            if (item.path) return <Link key={item.label} to={item.path} onClick={onClose} className={`block px-3 py-3 text-sm font-semibold ${isActive ? "bg-primary-100 text-background-950" : "text-foreground-700"}`}>{item.label}</Link>;
            const isExpanded = openGroups.includes(item.label);
            const id = `mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
            return (
              <div key={item.label} className="border-b border-background-200/70">
                <button type="button" aria-expanded={isExpanded} aria-controls={id} onClick={() => setOpenGroups((groups) => groups.includes(item.label) ? groups.filter((label) => label !== item.label) : [...groups, item.label])} className={`flex w-full items-center justify-between px-3 py-3 text-left text-sm font-semibold ${isActive ? "text-primary-700" : "text-foreground-800"}`}>
                  {item.label}<i className={`ri-add-line transition-transform ${isExpanded ? "rotate-45" : ""}`} />
                </button>
                <div id={id} hidden={!isExpanded} className="pb-2 pl-3">
                  {item.children?.map((child) => <Link key={child.path} to={child.path} onClick={onClose} className={`block border-l px-4 py-2.5 text-sm ${isNavigationPathActive(currentPath, child.path) ? "border-primary-500 text-primary-700" : "border-background-300 text-foreground-600"}`}>{child.label}</Link>)}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-background-200 px-6 py-5">
          {isLoading ? <div className="h-11 animate-pulse bg-primary-500/20" /> : user ? <div className="space-y-3"><Link to={user.is_staff ? "/admin" : "/user/dashboard"} onClick={onClose} className="btn-primary block text-center text-sm">{user.is_staff ? "Admin Dashboard" : "User Panel"}</Link><button onClick={() => { void logout(); onClose(); }} className="btn-ghost w-full text-sm">Sign out</button></div> : <Link to="/login" onClick={onClose} className="btn-primary block text-center text-sm">Sign In</Link>}
          <Link to="/contact" onClick={onClose} className="btn-ghost mt-3 block text-center text-sm">Contact the Institute</Link>
        </div>
      </div>
    </div>
  );
}
