import type { ReactNode } from "react";
import { ShieldCheck, UserRound } from "lucide-react";

import type { AuthUser } from "@/features/auth/types";

interface AccountProfileProps {
  user: AuthUser;
  title: string;
  description: string;
  badgeLabel: string;
  action?: ReactNode;
  profileImageUrl?: string | null;
  avatarAction?: ReactNode;
  children?: ReactNode;
}

export default function AccountProfile({
  user,
  title,
  description,
  badgeLabel,
  action,
  profileImageUrl = user.profile_image_url,
  avatarAction,
  children,
}: AccountProfileProps) {
  const initials =
    [user.first_name, user.last_name]
      .filter(Boolean)
      .map((name) => name.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || user.name.charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-primary-800">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#171411]">
            {title}
          </h1>
          <p className="mt-2 text-sm text-[#786E64]">{description}</p>
        </div>
        {action}
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_12px_35px_rgba(66,48,31,0.08)]">
        <div className="h-32 bg-gradient-to-r from-[#0B0B0B] via-[#25211D] to-primary-800" />
        <div className="px-6 pb-8 md:px-10">
          <div className="-mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative h-24 w-24 shrink-0">
              <span className="grid h-full w-full overflow-hidden rounded-2xl border-4 border-[#FFFDF9] bg-primary-500 text-2xl font-black text-[#0B0B0B] shadow-lg">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt={`${user.name} profile`} className="h-full w-full object-cover" />
                ) : (
                  <span className="grid h-full w-full place-items-center">{initials}</span>
                )}
              </span>
              {avatarAction}
            </div>
            <div className="mt-5 pb-1">
              <h2 className="text-2xl font-black text-[#171411]">{user.name}</h2>
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-800">
                <ShieldCheck size={12} />
                {badgeLabel}
              </span>
            </div>
          </div>

          {children || <div className="mt-8 grid gap-5 md:grid-cols-2">
            <ProfileField label="Full name" value={user.name} strong />
            <ProfileField label="Username" value={user.username} strong />
            <ProfileField label="Email address" value={user.email || "No email address"} />
            <ProfileField
              label="Access level"
              value={user.role === "admin" ? "Admin" : "User"}
              strong
              icon={<UserRound size={16} className="text-primary-700" />}
            />
          </div>}
        </div>
      </section>
    </div>
  );
}

function ProfileField({
  label,
  value,
  strong = false,
  icon,
}: {
  label: string;
  value: string;
  strong?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#887C70]">
        {label}
      </p>
      <div
        className={`mt-2 flex min-h-14 items-center gap-2 break-all rounded-xl border border-[#E2D8CC] bg-[#F7F2EB] px-4 py-3 text-sm ${strong ? "font-semibold text-[#332E29]" : "text-[#655C54]"}`}
      >
        {icon}
        {value}
      </div>
    </div>
  );
}
