import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";
import MobileMenu from "./MobileMenu";
import ProfileMenu from "./ProfileMenu";

const navItems = [
  { label: "Home", path: "/home" },
  { label: "Membership", path: "/membership" },
  { label: "Fund", path: "/fund" },
  { label: "Scholarships", path: "/scholarships" },
  { label: "Sponsorship", path: "/sponsorship" },
  { label: "Awards", path: "/awards" },
  { label: "Events", path: "/events" },
  { label: "Clubs", path: "/clubs" },
  { label: "Services", path: "/services" },
  { label: "About", path: "/about" },
];

const fullLogoUrl =
  "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/e6e47869fdd1459f891ad4c5852798c5.png";
const scrolledIconUrl =
  "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/f8147ef4aa324aa9873f6e074f0ffa89.png";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, isLoading } = useAuth();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${scrolled ? "border-background-800/60 bg-background-950/95 shadow-[0_1px_0_0_rgba(0,0,0,0.1)] backdrop-blur-xl" : "border-background-200 bg-white"}`}>
        <div className="container-content">
          <div className="flex h-16 items-center justify-between md:h-18">
            <Link
              to="/home"
              className="relative inline-flex h-12 w-40 shrink-0 items-center justify-center"
              aria-label="Institute of Project Controls home"
            >
              <img
                src={fullLogoUrl}
                alt=""
                aria-hidden="true"
                width={160}
                height={48}
                loading="eager"
                decoding="async"
                className={`absolute inset-0 m-auto h-10 w-40 object-contain transition-opacity duration-300 md:h-12 ${scrolled ? "opacity-0" : "opacity-100"}`}
              />
              <img
                src={scrolledIconUrl}
                alt=""
                aria-hidden="true"
                width={48}
                height={48}
                loading="eager"
                decoding="async"
                className={`absolute inset-0 m-auto h-10 w-10 object-contain transition-opacity duration-300 md:h-12 md:w-12 ${scrolled ? "opacity-100" : "opacity-0"}`}
              />
            </Link>

            <nav className="hidden items-center gap-5 xl:flex">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className={`relative whitespace-nowrap py-1 text-[13px] font-medium tracking-wide transition-colors duration-300 ${scrolled ? (isActive ? "text-background-50" : "text-background-400 hover:text-background-100") : (isActive ? "text-background-950" : "text-foreground-600 hover:text-background-950")}`}>
                    {item.label}
                    {isActive && <span className="absolute -bottom-px inset-x-0 h-px bg-primary-500" />}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {isLoading ? (
                <span className={`hidden h-[38px] w-12 animate-pulse rounded-full border xl:inline-flex ${scrolled ? "border-background-700/20 bg-background-800/20" : "border-background-300 bg-background-200/60"}`} aria-label="Checking sign-in status" role="status" />
              ) : user ? (
                <ProfileMenu dark={scrolled} />
              ) : (
                <Link to="/login" className={`hidden items-center whitespace-nowrap border px-4 py-2 text-[13px] font-medium transition-all duration-300 xl:inline-flex ${scrolled ? "border-background-700/30 text-background-400 hover:border-background-600/50 hover:bg-primary-500 hover:text-background-50" : "border-background-300 text-foreground-700 hover:border-primary-500 hover:bg-primary-500 hover:text-background-950"}`}>Sign In</Link>
              )}
              <Link to="/contact" className={`hidden items-center whitespace-nowrap border px-4 py-2 text-[13px] font-medium transition-all duration-300 xl:inline-flex ${scrolled ? "border-background-700/30 text-background-400 hover:border-background-600/50 hover:bg-background-800/40 hover:text-background-100" : "border-background-300 text-foreground-700 hover:border-background-500 hover:bg-background-100 hover:text-background-950"}`}>Contact</Link>
              <button onClick={() => setMobileOpen(true)} className={`flex h-10 w-10 items-center justify-center transition-colors xl:hidden ${scrolled ? "text-background-400 hover:bg-background-800/50 hover:text-background-100" : "text-background-950 hover:bg-background-100"}`} aria-label="Open menu">
                <i className="ri-menu-3-line text-xl" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} navItems={navItems} currentPath={location.pathname} />
    </>
  );
}
