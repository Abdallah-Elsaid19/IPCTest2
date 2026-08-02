import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { isNavigationGroupActive, navigation } from "@/config/navigation";
import { useAuth } from "@/features/auth/AuthContext";
import MobileMenu from "./MobileMenu";
import ProfileMenu from "./ProfileMenu";

const fullLogoUrl = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/e6e47869fdd1459f891ad4c5852798c5.png";
const scrolledIconUrl = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/6a97d877629743568d5134c4ff2255b8.png";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const isHome = location.pathname === "/home";
  const useHomeMobileHeader = isHome && !scrolled;

  useEffect(() => {
    setMobileOpen(false);
    setOpenGroup(null);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    const onPointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) setOpenGroup(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenGroup(null);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const inactiveClass = scrolled ? "text-background-400 hover:text-background-100" : "text-foreground-600 hover:text-background-950";
  const activeClass = scrolled ? "text-background-50" : "text-background-950";

  return (
    <>
      <aside className="absolute inset-x-0 top-0 z-[60] flex h-9 items-center border-b border-background-800 bg-black text-background-50 shadow-sm">
        <div className="container-content min-w-0 text-center">
          <Link
            to="/scholarships"
            className="inline-block max-w-full truncate text-[11px] leading-none underline decoration-primary-400/70 underline-offset-4 transition-colors hover:text-primary-300 sm:text-xs"
          >
            <strong>Scholarships open:</strong>{" "}
            up to 40 scholarship and bursary places may be available per intake.
          </Link>
        </div>
      </aside>
      <header ref={headerRef} className={`fixed inset-x-0 z-50 border-b transition-[top,background-color,border-color] duration-300 ${scrolled ? "top-0 border-background-800/60 bg-background-950/95 shadow-sm backdrop-blur-xl" : isHome ? "top-9 border-transparent bg-transparent xl:border-background-200 xl:bg-white" : "top-9 border-background-200 bg-white"}`}>
        <div className={`container-content ${useHomeMobileHeader ? "!px-8 xl:!px-10" : ""}`}>
          <div className={`flex items-center justify-between ${useHomeMobileHeader ? "h-[72px]" : "h-16 md:h-18"}`}>
            <Link to="/home" className="relative inline-flex h-12 w-40 shrink-0 items-center justify-center" aria-label="Institute of Project Controls home">
              {useHomeMobileHeader && (
                <span className="absolute left-0 font-mono text-[10px] uppercase leading-[1.7] tracking-[0.32em] text-primary-500 xl:hidden">
                  Institute of<br />Project Controls
                </span>
              )}
              <img src={fullLogoUrl} alt="" aria-hidden="true" width={160} height={48} className={`absolute h-10 w-40 object-contain transition-opacity md:h-12 ${scrolled ? "opacity-0" : useHomeMobileHeader ? "opacity-0 xl:opacity-100" : "opacity-100"}`} />
              <img src={scrolledIconUrl} alt="" aria-hidden="true" width={160} height={48} className={`absolute h-10 w-40 object-contain transition-opacity md:h-12 ${scrolled ? "opacity-100" : "opacity-0"}`} />
            </Link>

            <nav className="hidden items-stretch xl:flex" aria-label="Primary navigation">
              {navigation.map((item) => {
                const isActive = isNavigationGroupActive(location.pathname, item);
                if (item.path) {
                  return <Link key={item.label} to={item.path} className={`relative flex items-center px-2.5 text-[12px] font-medium tracking-wide transition-colors ${isActive ? activeClass : inactiveClass}`}>{item.label}{isActive && <span className="absolute inset-x-2.5 bottom-0 h-px bg-primary-500" />}</Link>;
                }
                const isOpen = openGroup === item.label;
                const id = `nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
                return (
                  <div key={item.label} className="relative flex">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={id}
                      onClick={() => setOpenGroup(isOpen ? null : item.label)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setOpenGroup(item.label);
                          requestAnimationFrame(() => document.querySelector<HTMLAnchorElement>(`#${id} a`)?.focus());
                        }
                      }}
                      className={`relative flex items-center gap-1 px-2.5 text-[12px] font-medium tracking-wide transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 ${isActive ? activeClass : inactiveClass}`}
                    >
                      {item.label}<i className={`ri-arrow-down-s-line transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                      {isActive && <span className="absolute inset-x-2.5 bottom-0 h-px bg-primary-500" />}
                    </button>
                    <div id={id} className={`absolute left-1/2 top-full w-72 -translate-x-1/2 border border-background-800/70 bg-background-950 p-2 shadow-2xl transition ${isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
                      {item.children?.map((child) => <Link key={child.path} to={child.path} className="block border-l border-transparent px-4 py-3 text-sm text-background-300 transition hover:border-primary-500 hover:bg-background-900 hover:text-primary-400 focus-visible:border-primary-500 focus-visible:outline-none">{child.label}</Link>)}
                    </div>
                  </div>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {isLoading ? <span className="hidden h-[38px] w-12 animate-pulse border border-background-300 xl:inline-flex" role="status" aria-label="Checking sign-in status" /> : user ? <ProfileMenu dark={scrolled} /> : <Link to="/login" className={`hidden border px-4 py-2 text-[13px] font-medium transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 xl:inline-flex ${scrolled ? "border-background-700 text-background-300 hover:border-primary-500 hover:bg-primary-500 hover:text-background-950" : "border-background-300 text-foreground-700 hover:border-primary-500 hover:bg-primary-500 hover:text-background-950"}`}>Sign In</Link>}
              <Link to="/contact" className={`hidden border px-4 py-2 text-[13px] font-medium transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 xl:inline-flex ${scrolled ? "border-background-700 text-background-300 hover:border-background-600 hover:bg-background-800 hover:text-background-100" : "border-background-300 text-foreground-700 hover:border-background-500 hover:bg-background-100 hover:text-background-950"}`}>Contact</Link>
              <button ref={mobileTriggerRef} onClick={() => setMobileOpen(true)} className={`flex h-10 w-10 items-center justify-center xl:hidden ${scrolled ? "text-background-300" : isHome ? "text-primary-500" : "text-background-950"}`} aria-label="Open menu" aria-expanded={mobileOpen}><i className="ri-menu-3-line text-2xl" /></button>
            </div>
          </div>
          {useHomeMobileHeader && (
            <div className="absolute inset-x-8 bottom-0 h-px bg-background-700/45 xl:hidden">
              <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_oklch(var(--primary-500))]" />
            </div>
          )}
        </div>
      </header>
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} currentPath={location.pathname} returnFocusRef={mobileTriggerRef} />
    </>
  );
}
