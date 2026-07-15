import { ArrowLeft, FileText, LoaderCircle } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { adminApi } from "@/features/admin/adminApi";
import { AdminPageHeader, StatusBadge } from "@/features/admin/components/AdminPage";
import type { AdminUser } from "@/features/admin/types";
import { formatDate } from "@/features/admin/utils";

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
          <dd className="mt-1 break-words text-sm font-semibold leading-6 text-[#332D27]">{item.value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export default function AdminUserDetailsPage() {
  const { id } = useParams();
  const userId = Number(id);
  const [user, setUser] = useState<AdminUser | null>(null);
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
        description="Read-only account and linked membership application information."
        action={
          <Link to="/dashboard/users" className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold text-primary-800 shadow-sm">
            <ArrowLeft size={15} /> Back to Users
          </Link>
        }
      />

      <div className="mt-8 grid gap-5">
        <InformationCard title="Account information">
          <InformationGrid items={[
            { label: "Full name", value: user.name },
            { label: "Username", value: user.username.includes("@") ? user.username : `@${user.username}` },
            { label: "IPC email", value: user.ipc_email },
            { label: "Personal email", value: user.personal_email || "—" },
            { label: "Role", value: <span className="uppercase">{user.role}</span> },
            { label: "Status", value: user.is_active ? "Active" : "Inactive" },
            { label: "Account created", value: formatDate(user.account_created_at) },
            { label: "Last login", value: formatDate(user.last_login) },
          ]} />
        </InformationCard>

        <InformationCard title="Membership application">
          {user.membership_application_id ? (
            <>
              <InformationGrid items={[
                { label: "Application reference", value: user.membership_reference || "—" },
                { label: "Application status", value: user.application_status ? <StatusBadge status={user.application_status} /> : "—" },
                { label: "Membership grade", value: user.membership_grade || "—" },
                { label: "Submitted date", value: formatDate(user.application_submitted_at) },
                { label: "Approved date", value: formatDate(user.application_approved_at) },
                { label: "IPC account creation date", value: formatDate(user.account_created_at) },
                { label: "Original applicant email", value: user.personal_email || "—" },
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
      </div>
    </div>
  );
}
