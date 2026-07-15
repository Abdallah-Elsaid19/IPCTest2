import { Link } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: { label: string; path: string }[];
  currentPath: string;
}

export default function MobileMenu({ isOpen, onClose, navItems, currentPath }: MobileMenuProps) {
  const { user, isLoading, logout } = useAuth();
  return (
    <div
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className="absolute inset-0 bg-background-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-sm bg-background-50 shadow-2xl transition-transform duration-500 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-16 border-b border-background-200">
          <span className="font-heading text-lg font-semibold text-background-950">
            Menu
          </span>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-background-950 hover:bg-background-200/50 transition-colors"
            aria-label="Close menu"
          >
            <i className="ri-close-line text-2xl" />
          </button>
        </div>
        <nav className="px-6 py-6 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`py-3 px-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary-100 text-background-950"
                    : "text-foreground-700 hover:bg-background-200/50 hover:text-background-950"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="px-6 mt-4 flex flex-col gap-3">
          {isLoading ? (
            <div
              className="h-12 w-full animate-pulse bg-primary-500/30"
              aria-label="Checking sign-in status"
              role="status"
            />
          ) : user ? (
            <>
              <div className="border border-background-200 px-4 py-3">
                <p className="truncate text-sm font-semibold text-background-950">{user.name}</p>
                <p className="truncate text-xs text-foreground-500">{user.email}</p>
              </div>
              {user.is_staff && (
                <Link to="/admin" onClick={onClose} className="btn-primary w-full text-center text-sm">Dashboard</Link>
              )}
              <button type="button" onClick={() => { void logout(); onClose(); }} className="btn-ghost w-full text-center text-sm">Sign out</button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={onClose}
              className="btn-primary w-full text-center text-sm"
            >
              Sign In
            </Link>
          )}
          <Link
            to="/contact"
            onClick={onClose}
            className="btn-primary w-full text-center text-sm"
          >
            Contact the Institute
          </Link>
        </div>
      </div>
    </div>
  );
}
