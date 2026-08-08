import { ExternalLink } from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";
import AccountProfile from "@/features/profile/AccountProfile";

export default function AdminProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const djangoAdminUrl = (
    import.meta.env.VITE_DJANGO_ADMIN_URL || "http://localhost:8030/admin/"
  ).replace(/\/?$/, "/");

  return (
    <AccountProfile
      user={user}
      title="Admin profile"
      description="Your authenticated IPC account details."
      badgeLabel={user.role || "Administrator"}
      action={
        <a
          href={`${djangoAdminUrl}auth/user/${user.id}/change/`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-xs font-bold text-[#0B0B0B] transition-colors hover:bg-primary-400"
        >
          Manage account
          <ExternalLink size={14} />
        </a>
      }
    />
  );
}
