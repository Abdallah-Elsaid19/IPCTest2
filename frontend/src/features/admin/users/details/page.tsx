import { ArrowLeft, FileText, HandCoins, LoaderCircle, UserRound } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { adminApi } from "@/features/admin/adminApi";
import { AdminPageHeader, StatusBadge } from "@/features/admin/components/AdminPage";
import type { AdminUserDetail, AdminUserProfileField } from "@/features/admin/types";
import { formatDate } from "@/features/admin/utils";

type Tab = "account" | "membership" | "bursary";

function InformationCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_8px_25px_rgba(66,48,31,0.04)]">
      <h2 className="border-b border-[#E8DED2] px-5 py-4 text-base font-black">{title}</h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

function InformationGrid({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-[#857A70]">{item.label}</dt>
          <dd className="mt-1 break-words text-sm font-semibold leading-6 text-[#332D27]">
            {hasValue(item.value) ? item.value : "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ProfileGrid({ fields }: { fields: AdminUserProfileField[] }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {fields.map((field) => (
        <div
          key={field.key}
          className={`rounded-xl border border-[#E3D8CB] bg-white px-4 py-3 ${
            field.is_multiline ? "sm:col-span-2 lg:col-span-3" : ""
          }`}
        >
          <dt className="text-[10px] font-bold uppercase tracking-wider text-[#857A70]">{field.label}</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-[#332D27]">
            {hasValue(field.value) ? String(field.value) : "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function AdminUserDetailsPage() {
  const { id } = useParams();
  const userId = Number(id);
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!Number.isInteger(userId) || userId <= 0) {
      setError("This user ID is invalid.");
      setIsLoading(false);
      return () => { active = false; };
    }
    void adminApi.user(userId)
      .then((response) => { if (active) setUser(response); })
      .catch((requestError: unknown) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Could not load this user.");
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [userId]);

  const initials = useMemo(
    () => user
      ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
        || user.name.charAt(0).toUpperCase()
      : "U",
    [user],
  );
  const professionalHeadline = useMemo(
    () => user?.profile_fields.find((field) => field.key === "professional_headline")?.value,
    [user],
  );

  if (isLoading) {
    return (
      <div className="grid min-h-[55vh] place-items-center" role="status">
        <LoaderCircle size={30} className="animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="grid min-h-[55vh] place-items-center px-5 text-center">
        <div>
          <p className="text-sm font-bold">{error || "User not found."}</p>
          <Link to="/dashboard/users" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-bold text-[#0B0B0B]">
            <ArrowLeft size={15} /> Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 text-[#221E1A] md:px-8 md:py-9">
      <AdminPageHeader
        eyebrow="Access control"
        title={user.name}
        description="Read-only account, professional profile, membership and bursary application information."
        action={
          <Link to="/dashboard/users" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold text-primary-800 shadow-sm">
            <ArrowLeft size={15} /> Back to Users
          </Link>
        }
      />

      <div className="mt-8 overflow-x-auto border-b border-[#DCCFBE]" role="tablist" aria-label="User information">
        <div className="flex min-w-max gap-2">
          <TabButton
            active={activeTab === "account"}
            icon={<UserRound size={16} />}
            label="Account information"
            onClick={() => setActiveTab("account")}
          />
          <TabButton
            active={activeTab === "membership"}
            icon={<FileText size={16} />}
            label="Membership application"
            onClick={() => setActiveTab("membership")}
          />
          <TabButton
            active={activeTab === "bursary"}
            icon={<HandCoins size={16} />}
            label={`Bursary applications (${user.bursary_applications.length})`}
            onClick={() => setActiveTab("bursary")}
          />
        </div>
      </div>

      <div className="mt-5" role="tabpanel">
        {activeTab === "account" && (
          <div className="grid gap-5">
            <InformationCard title="Account information">
              <div className="mb-6 flex flex-col gap-4 border-b border-[#E8DED2] pb-6 sm:flex-row sm:items-center">
                <span className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-primary-500 text-2xl font-black text-[#0B0B0B] shadow-lg">
                  {user.profile_image_url
                    ? <img src={user.profile_image_url} alt={`${user.name} profile`} className="h-full w-full object-cover" />
                    : initials}
                </span>
                <div>
                  <h2 className="text-xl font-black">{user.name}</h2>
                  <p className="mt-1 text-sm text-[#756B61]">{professionalHeadline || user.ipc_email}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusBadge status={user.is_active ? "active" : "inactive"} />
                    <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-800">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
              <InformationGrid items={[
                { label: "Full name", value: user.name },
                { label: "Username", value: user.username.includes("@") ? user.username : `@${user.username}` },
                { label: "IPC email", value: user.ipc_email },
                { label: "Personal email", value: user.personal_email },
                { label: "Account telephone", value: user.telephone },
                { label: "Role", value: <span className="uppercase">{user.role}</span> },
                { label: "Status", value: user.is_active ? "Active" : "Inactive" },
                { label: "Account created", value: formatDate(user.account_created_at) },
                { label: "Last login", value: formatDate(user.last_login) },
                { label: "Profile last updated", value: formatDate(user.profile_updated_at) },
              ]} />
            </InformationCard>

            <InformationCard title="Professional profile">
              <p className="mb-5 text-sm leading-6 text-[#756B61]">
                Every field available in the member’s Edit Profile form is shown below. Empty fields remain visible and update automatically when the member completes them.
              </p>
              <ProfileGrid fields={user.profile_fields} />
            </InformationCard>
          </div>
        )}

        {activeTab === "membership" && (
          <InformationCard title="Membership application">
            {user.membership_application_id ? (
              <>
                <InformationGrid items={[
                  { label: "Application reference", value: user.membership_reference },
                  { label: "Application status", value: user.application_status ? <StatusBadge status={user.application_status} /> : null },
                  { label: "Membership grade", value: user.membership_grade },
                  { label: "Submitted date", value: formatDate(user.application_submitted_at) },
                  { label: "Approved date", value: formatDate(user.application_approved_at) },
                  { label: "IPC account creation date", value: formatDate(user.account_created_at) },
                  { label: "Original applicant email", value: user.personal_email },
                ]} />
                <Link
                  to={`/admin/applications/${user.membership_application_id}`}
                  className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-bold text-[#0B0B0B]"
                >
                  <FileText size={15} /> View Application
                </Link>
              </>
            ) : (
              <p className="text-sm text-[#756B61]">— No membership application is linked to this account.</p>
            )}
          </InformationCard>
        )}

        {activeTab === "bursary" && (
          <InformationCard title="Bursary applications">
            {user.bursary_applications.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {user.bursary_applications.map((application) => (
                  <article key={application.id} className="rounded-2xl border border-[#E2D6C8] bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="break-all font-mono text-xs font-bold text-primary-800">
                          {application.application_reference}
                        </p>
                        <h3 className="mt-2 text-lg font-black">{application.preferred_pathway}</h3>
                      </div>
                      <StatusBadge status={application.status} />
                    </div>
                    <InformationGrid items={[
                      { label: "Membership reference", value: application.membership_reference },
                      { label: "Amount requested", value: formatGbp(application.amount_requested_gbp) },
                      { label: "Requested percentage", value: `${application.requested_percentage}%` },
                      { label: "Submitted", value: formatDate(application.submitted_at) },
                    ]} />
                    <Link
                      to={`/admin/bursary-applications/${application.id}`}
                      className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-bold text-[#0B0B0B]"
                    >
                      <HandCoins size={15} /> View Bursary Application
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#756B61]">— No bursary applications are linked to this account.</p>
            )}
          </InformationCard>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex h-12 items-center gap-2 rounded-t-xl border border-b-0 px-5 text-xs font-black transition-colors ${
        active
          ? "border-primary-500 bg-primary-500 text-[#0B0B0B]"
          : "border-[#DCCFBE] bg-[#FFFDF9] text-[#6D6258] hover:bg-primary-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function hasValue(value: ReactNode) {
  return value !== null && value !== undefined && value !== "";
}

function formatGbp(value: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(Number(value));
}
