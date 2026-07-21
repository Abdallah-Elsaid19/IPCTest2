import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth/AuthContext";
import MobileMenu from "./MobileMenu";
import ProfileMenu from "./ProfileMenu";

const navItems = [
  { label: "Home", path: "/home" },
  { label: "Membership", path: "/membership" },
  { label: "Scholarships", path: "/scholarships" },
  { label: "Sponsorship", path: "/sponsorship" },
  { label: "Awards", path: "/awards" },
  { label: "Events", path: "/events" },
  { label: "Clubs", path: "/clubs" },
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
    const onScroll = () => setScrolled(window.scrollY > 20);
    const scrolledIcon = new Image();
    scrolledIcon.src = scrolledIconUrl;
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "border-b border-background-800/60 bg-background-950/90 shadow-[0_1px_0_0_rgba(0,0,0,0.1)] backdrop-blur-xl" : "border-b border-transparent bg-transparent"}`}>
        <div className="container-content">
          <div className="flex h-16 items-center justify-between md:h-18">
            <Link
              to="/home"
              className={`inline-flex shrink-0 items-center transition-[width] duration-300 ${scrolled ? "w-10 md:w-12" : "w-40"}`}
              aria-label="Institute of Project Controls home"
            >
              <img
                src={scrolled ? scrolledIconUrl : fullLogoUrl}
                alt="Institute of Project Controls"
                width={scrolled ? 48 : 160}
                height={48}
                loading="eager"
                decoding="async"
                className="h-10 w-full object-contain md:h-12"
              />
            </Link>

            <nav className="hidden items-center gap-7 lg:flex">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} className={`relative whitespace-nowrap py-1 text-[13px] font-medium tracking-wide transition-colors duration-300 ${isActive ? "text-background-50" : "text-background-400 hover:text-background-100"}`}>
                    {item.label}
                    {isActive && <span className="absolute -bottom-px inset-x-0 h-px bg-primary-500" />}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              {isLoading ? (
                <span className="hidden h-[38px] w-12 animate-pulse rounded-full border border-background-700/20 bg-background-800/20 lg:inline-flex" aria-label="Checking sign-in status" role="status" />
              ) : user ? (
                <ProfileMenu />
              ) : (
                <Link to="/login" className="hidden items-center whitespace-nowrap border border-background-700/30 px-4 py-2 text-[13px] font-medium text-background-400 transition-all duration-300 hover:border-background-600/50 hover:bg-primary-500 hover:text-background-50 lg:inline-flex">Sign In</Link>
              )}
              <Link to="/contact" className="hidden items-center whitespace-nowrap border border-background-700/30 px-4 py-2 text-[13px] font-medium text-background-400 transition-all duration-300 hover:border-background-600/50 hover:bg-background-800/40 hover:text-background-100 lg:inline-flex">Contact</Link>
              <button onClick={() => setMobileOpen(true)} className="flex h-10 w-10 items-center justify-center text-background-400 transition-colors hover:bg-background-800/50 hover:text-background-100 lg:hidden" aria-label="Open menu">
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
