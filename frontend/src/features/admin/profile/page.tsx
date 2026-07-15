import { ExternalLink, ShieldCheck, UserRound } from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";

export default function AdminProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const initials =
    [user.first_name, user.last_name]
      .filter(Boolean)
      .map((name) => name.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || user.name.charAt(0).toUpperCase();
  const djangoAdminUrl = (
    import.meta.env.VITE_DJANGO_ADMIN_URL || "http://localhost:8000/admin/"
  ).replace(/\/?$/, "/");

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-primary-800">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#171411]">
            Admin profile
          </h1>
          <p className="mt-2 text-sm text-[#786E64]">
            Your authenticated IPC account details.
          </p>
        </div>
        <a
          href={`${djangoAdminUrl}auth/user/${user.id}/change/`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-xs font-bold text-[#0B0B0B] transition-colors hover:bg-primary-400"
        >
          Manage account
          <ExternalLink size={14} />
        </a>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_12px_35px_rgba(66,48,31,0.08)]">
        <div className="h-32 bg-gradient-to-r from-[#0B0B0B] via-[#25211D] to-primary-800" />
        <div className="px-6 pb-8 md:px-10">
          <div className="-mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <span className="grid h-24 w-24 place-items-center rounded-2xl border-4 border-[#FFFDF9] bg-primary-500 text-2xl font-black text-[#0B0B0B] shadow-lg">
              {initials}
            </span>
            <div className="pb-1 mt-5">
              <h2 className="text-2xl font-black text-[#171411]">
                {user.name}
              </h2>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-800">
                <ShieldCheck size={12} />
                {user.role || "Administrator"}
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#887C70]">
                Full name
              </label>
              <div className="mt-2 flex h-14 items-center rounded-xl border border-[#E2D8CC] bg-[#F7F2EB] px-4 text-sm font-semibold text-[#332E29]">
                {user.name}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#887C70]">
                Username
              </label>
              <div className="mt-2 flex h-14 items-center rounded-xl border border-[#E2D8CC] bg-[#F7F2EB] px-4 text-sm font-semibold text-[#332E29]">
                {user.username}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#887C70]">
                Email address
              </label>
              <div className="mt-2 flex h-14 items-center rounded-xl border border-[#E2D8CC] bg-[#F7F2EB] px-4 text-sm text-[#655C54]">
                {user.email || "No email address"}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#887C70]">
                Access level
              </label>
              <div className="mt-2 flex h-14 items-center gap-2 rounded-xl border border-[#E2D8CC] bg-[#F7F2EB] px-4 text-sm font-semibold text-[#332E29]">
                <UserRound size={16} className="text-primary-700" />
                {user.role === "admin" ? "Admin" : "User"}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
