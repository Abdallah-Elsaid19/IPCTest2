import {
  Award,
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  Inbox,
  Mail,
  RefreshCw,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import {
  AdminPageHeader,
  AdminPageState,
} from "@/features/admin/components/AdminPage";
import { useAdminDashboard } from "@/features/admin/context/AdminDashboardContext";
import { adminUrl, labelStatus } from "@/features/admin/utils";
import { useAuth } from "@/features/auth/AuthContext";

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const { data, isLoading, isRefreshing, refresh } = useAdminDashboard();

  if (!data)
    return (
      <AdminPageState isLoading={isLoading} hasData={false}>
        <></>
      </AdminPageState>
    );

  const metrics = [
    {
      label: "Applications",
      value: data.counts.applications,
      detail: `${data.counts.applications_pending} pending review`,
      icon: ClipboardList,
      href: "/admin/applications",
    },
    {
      label: "Open contacts",
      value: data.counts.contact_open,
      detail: `${data.counts.contact_submissions} total`,
      icon: Inbox,
      href: "/admin/enquiries",
    },
    {
      label: "Club enquiries",
      value: data.counts.club_enquiries,
      detail: `${data.counts.club_new} new`,
      icon: UsersRound,
      href: "/admin/enquiries",
    },
    {
      label: "Award interests",
      value: data.counts.award_interests,
      detail: `${data.counts.award_new} new`,
      icon: Award,
      href: "/admin/enquiries",
    },
    {
      label: "Registrations",
      value: data.counts.event_registrations,
      detail: `${data.counts.published_events} published events`,
      icon: CalendarDays,
      href: "/admin/events",
    },
    {
      label: "Active users",
      value: data.counts.active_users,
      detail: `${data.counts.users} total accounts`,
      icon: CircleUserRound,
      href: "/dashboard/users",
    },
    {
      label: "Subscribers",
      value: data.counts.newsletter_subscribers,
      detail: "Active newsletter list",
      icon: Mail,
      href: `${adminUrl}newsletter/newslettersignup/`,
    },
    {
      label: "Membership grades",
      value: data.counts.membership_grades,
      detail: `${data.counts.media_assets} media assets`,
      icon: ShieldCheck,
      href: `${adminUrl}memberships/membershipgrade/`,
    },
  ];
  const applicationTotal = Math.max(data.counts.applications, 1);

  return (
    <AdminPageState isLoading={isLoading} hasData>
      <AdminPageHeader
        eyebrow="Institute operations"
        title={`Welcome back, ${user?.first_name || user?.name}`}
        description="Here is what is happening across IPC today."
        action={
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={isRefreshing}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold shadow-sm transition-colors hover:bg-[#FFF9F1] disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {metrics.map(({ label, value, detail, icon: Icon, href }) => {
          const external = href.startsWith("http");
          const content = (
            <>
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-100 text-primary-800">
                  <Icon size={19} />
                </span>
                <ChevronRight
                  size={16}
                  className="text-[#B7AA9A] transition-transform group-hover:translate-x-1 group-hover:text-primary-700"
                />
              </div>
              <p className="mt-5 text-3xl font-black text-[#171411]">
                {value.toLocaleString()}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[#4F4841]">
                {label}
              </p>
              <p className="mt-2 text-xs text-[#8A7E72]">{detail}</p>
            </>
          );
          const cardClassName =
            "group rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-5 shadow-[0_8px_25px_rgba(66,48,31,0.05)] transition-all hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-[0_12px_30px_rgba(66,48,31,0.1)]";
          return external ? (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className={cardClassName}
            >
              {content}
            </a>
          ) : (
            <Link key={label} to={href} className={cardClassName}>
              {content}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-5 shadow-[0_8px_25px_rgba(66,48,31,0.05)] md:p-6">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-primary-700">
            Pipeline
          </p>
          <h2 className="mt-1.5 text-2xl font-bold text-[#171411]">
            Application status
          </h2>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-5">
          {Object.entries(data.application_statuses).map(([status, count]) => (
            <div key={status}>
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="capitalize text-[#746A60]">
                  {labelStatus(status)}
                </span>
                <span className="font-mono font-bold text-[#2D2823]">
                  {count}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E9DFD2]">
                <div
                  className="h-full rounded-full bg-primary-500"
                  style={{ width: `${(count / applicationTotal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminPageState>
  );
}
