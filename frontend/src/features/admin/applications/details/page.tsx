import {
  ArrowLeft,
  Download,
  FileText,
  LoaderCircle,
  MailCheck,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";

import { adminApi } from "@/features/admin/adminApi";
import {
  AdminPageHeader,
  StatusBadge,
} from "@/features/admin/components/AdminPage";
import type { AdminApplicationDetail } from "@/features/admin/types";
import { formatDate, labelStatus } from "@/features/admin/utils";
import { notifications } from "@/lib/notifications";

const formatLabel = (value: string) =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatValue = (value: unknown): ReactNode => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : "—";
  if (typeof value === "object") {
    return (
      <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-5">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  return String(value);
};

function DetailSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_8px_25px_rgba(66,48,31,0.04)]">
      <div className="border-b border-[#E8DED2] px-5 py-4">
        <h2 className="text-base font-black text-[#241F1A]">{title}</h2>
        {description && <p className="mt-1 text-xs text-[#7B7167]">{description}</p>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function DetailGrid({
  items,
}: {
  items: Array<{ label: string; value: unknown; wide?: boolean }>;
}) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map(({ label, value, wide }) => (
        <div key={label} className={wide ? "sm:col-span-2 xl:col-span-3" : ""}>
          <dt className="text-[10px] font-bold uppercase tracking-wider text-[#857A70]">
            {label}
          </dt>
          <dd className="mt-1 break-words text-sm font-medium leading-6 text-[#332D27]">
            {formatValue(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function groupSpecificData(data: Record<string, unknown>) {
  const groups: Record<string, Array<[string, unknown]>> = {
    "Professional information": [],
    Qualifications: [],
    Experience: [],
    "Supporting statements": [],
  };

  Object.entries(data).forEach(([key, value]) => {
    const normalised = key.toLowerCase();
    if (/qualif|certif|education|degree/.test(normalised)) {
      groups.Qualifications.push([key, value]);
    } else if (/experience|employment|job|role|years/.test(normalised)) {
      groups.Experience.push([key, value]);
    } else if (/statement|background|evidence|cpd|reference|reason/.test(normalised)) {
      groups["Supporting statements"].push([key, value]);
    } else {
      groups["Professional information"].push([key, value]);
    }
  });

  return Object.entries(groups).filter(([, items]) => items.length);
}

const formatBytes = (bytes: number) => {
  if (!bytes) return "Size unavailable";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AdminApplicationDetailsPage() {
  const { id } = useParams();
  const applicationId = Number(id);
  const [application, setApplication] = useState<AdminApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      setError("This application ID is invalid.");
      setIsLoading(false);
      return () => { active = false; };
    }

    setIsLoading(true);
    setError("");
    void adminApi.application(applicationId)
      .then((response) => {
        if (active) setApplication(response);
      })
      .catch((requestError: unknown) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Could not load this application.",
          );
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
  }, [applicationId]);

  const specificGroups = useMemo(
    () => groupSpecificData(application?.grade_specific_data || {}),
    [application],
  );

  if (isLoading) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <div className="text-center text-[#6D645B]" role="status">
          <LoaderCircle className="mx-auto animate-spin text-primary-600" size={30} />
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em]">
            Loading application
          </p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="grid min-h-[55vh] place-items-center px-5 text-center">
        <div>
          <p className="text-sm font-bold text-[#332D27]">
            {error || "Application not found."}
          </p>
          <Link
            to="/admin/applications"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-bold text-[#0B0B0B]"
          >
            <ArrowLeft size={15} /> Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const applicantName = `${application.first_name} ${application.last_name}`.trim();
  const resendWelcome = async () => {
    if (isResending) return;
    setIsResending(true);
    try {
      const updated = await adminApi.resendApplicationWelcome(application.id);
      setApplication(updated);
      notifications.success("A new password-creation email was sent successfully.");
    } catch (requestError) {
      notifications.error(
        requestError instanceof Error
          ? requestError.message
          : "Could not send the welcome email.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 text-[#221E1A] md:px-8 md:py-9">
      <AdminPageHeader
        eyebrow="Membership application"
        title={applicantName || application.application_reference}
        description="Read-only application record and submitted evidence."
        action={
          <Link
            to="/admin/applications"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold text-primary-800 shadow-sm hover:bg-[#FFF9F1]"
          >
            <ArrowLeft size={15} /> Back to Applications
          </Link>
        }
      />

      <div className="mt-8 grid gap-5">
        <DetailSection title="Application summary">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <DetailGrid
              items={[
                { label: "Reference number", value: application.application_reference },
                { label: "Membership grade", value: application.membership_grade_title || application.grade },
                { label: "Submitted date", value: formatDate(application.submitted_at) },
                { label: "Last updated", value: formatDate(application.updated_at) },
              ]}
            />
            <div className="md:pl-6">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#857A70]">
                Current status
              </p>
              <StatusBadge status={application.status} />
              {application.status === "approved" && (
                <p className="mt-2 max-w-xs text-xs leading-5 text-[#6F665D]">
                  This application has been approved and its status can no longer be changed.
                </p>
              )}
            </div>
          </div>
        </DetailSection>

        <div className="grid gap-5 xl:grid-cols-2">
          <DetailSection title="Applicant personal information">
            <DetailGrid
              items={[
                { label: "First name", value: application.first_name },
                { label: "Last name", value: application.last_name },
                { label: "Requested username", value: application.username || "Legacy application" },
                { label: "Country", value: application.country },
              ]}
            />
          </DetailSection>
          <DetailSection title="Contact information">
            <DetailGrid
              items={[
                { label: "Email address", value: application.email },
                { label: "Phone", value: application.phone },
                { label: "Contact preference", value: application.contact_preference_label },
              ]}
            />
          </DetailSection>
        </div>

        <DetailSection
          title="Professional information"
          description="Organisation and all grade-specific answers submitted with this application."
        >
          <DetailGrid items={[{ label: "Organisation", value: application.organisation }]} />
          {specificGroups.length ? (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {specificGroups.map(([title, items]) => (
                <div key={title} className="rounded-xl border border-[#E4D9CC] bg-[#F9F5EF] p-4">
                  <h3 className="text-sm font-black">{title}</h3>
                  <div className="mt-4">
                    <DetailGrid
                      items={items.map(([key, value]) => ({
                        label: formatLabel(key),
                        value,
                        wide: true,
                      }))}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-[#7B7167]">No grade-specific information was submitted.</p>
          )}
        </DetailSection>

        <DetailSection title="Uploaded documents and evidence">
          {application.evidence_files.length ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {application.evidence_files.map((evidence) => (
                <div
                  key={evidence.id}
                  className="flex min-w-0 items-center gap-3 rounded-xl border border-[#E0D5C8] bg-[#F9F5EF] p-4"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-100 text-primary-800">
                    <FileText size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{evidence.original_name || "Document"}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-wide text-[#81766B]">
                      {formatLabel(evidence.evidence_type)} · {evidence.content_type || "Unknown type"} · {formatBytes(evidence.file_size)}
                    </p>
                  </div>
                  <a
                    href={evidence.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#D4C6B5] bg-white text-primary-800 hover:bg-primary-100"
                    aria-label={`View or download ${evidence.original_name || "document"}`}
                    title="View or download document"
                  >
                    <Download size={15} />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#7B7167]">No uploaded evidence is attached.</p>
          )}
        </DetailSection>

        <DetailSection title="References">
          {application.application_references.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {application.application_references.map((reference) => (
                <div key={reference.id} className="rounded-xl border border-[#E0D5C8] bg-[#F9F5EF] p-4">
                  <DetailGrid items={[
                    { label: "Name", value: reference.name },
                    { label: "Email", value: reference.email },
                    { label: "Organisation", value: reference.organisation },
                    { label: "Relationship", value: reference.relationship },
                    { label: "Notes", value: reference.notes, wide: true },
                  ]} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#7B7167]">No structured references were submitted.</p>
          )}
        </DetailSection>

        <div className="grid gap-5 xl:grid-cols-2">
          <DetailSection title="Declaration and consent">
            <DetailGrid items={[
              { label: "Code of conduct consent", value: application.code_of_conduct_consent },
              { label: "Privacy consent", value: application.privacy_consent },
            ]} />
          </DetailSection>
          <DetailSection title="Internal application metadata">
            <DetailGrid items={[
              { label: "Application ID", value: application.application_id },
              { label: "Form definition", value: application.form_definition_name || application.form_definition_code },
              { label: "Form version", value: application.form_version },
              { label: "Reviewed by", value: application.reviewed_by_name },
              { label: "Reviewed at", value: application.reviewed_at ? formatDate(application.reviewed_at) : "—" },
              { label: "Approved by", value: application.approved_by_name },
              { label: "Approved at", value: application.approved_at ? formatDate(application.approved_at) : "—" },
              { label: "Created at", value: formatDate(application.created_at) },
            ]} />
          </DetailSection>
        </div>

        {application.status === "approved" && (
          <DetailSection
            title="Approved IPC account"
            description="The account is linked directly to this application."
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <DetailGrid items={[
                { label: "IPC login email", value: application.approved_user_email },
                { label: "Original personal email", value: application.email },
                { label: "Account created", value: application.account_created_at ? formatDate(application.account_created_at) : "—" },
                { label: "Welcome email sent", value: application.welcome_email_sent_at ? formatDate(application.welcome_email_sent_at) : "Not sent" },
              ]} />
              {application.approved_user &&
                application.approved_user_is_managed_account && (
                <button
                  type="button"
                  onClick={() => void resendWelcome()}
                  disabled={isResending}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-bold text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isResending ? (
                    <LoaderCircle size={15} className="animate-spin" />
                  ) : (
                    <MailCheck size={15} />
                  )}
                  Send new password link
                </button>
              )}
            </div>
          </DetailSection>
        )}

        <DetailSection title="Status history">
          {application.status_history.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="text-[10px] uppercase tracking-wider text-[#81766B]">
                  <tr><th className="pb-3">Previous</th><th className="pb-3">New status</th><th className="pb-3">Changed by</th><th className="pb-3">Date</th><th className="pb-3">Note</th></tr>
                </thead>
                <tbody className="divide-y divide-[#E8DED2]">
                  {application.status_history.map((entry) => (
                    <tr key={entry.id}>
                      <td className="py-3 pr-4">{entry.from_status ? labelStatus(entry.from_status) : "—"}</td>
                      <td className="py-3 pr-4"><StatusBadge status={entry.to_status} /></td>
                      <td className="py-3 pr-4">{entry.changed_by_name || "System"}</td>
                      <td className="py-3 pr-4">{formatDate(entry.created_at)}</td>
                      <td className="py-3 text-[#6F665D]">{entry.note || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[#7B7167]">No status history is available.</p>
          )}
        </DetailSection>

        {application.reviewer_notes.length > 0 && (
          <DetailSection title="Internal reviewer notes">
            <div className="space-y-3">
              {application.reviewer_notes.map((note) => (
                <div key={note.id} className="rounded-xl border border-[#E0D5C8] bg-[#F9F5EF] p-4">
                  <p className="text-sm leading-6">{note.note}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-wide text-[#81766B]">
                    {note.author_name || "Unknown reviewer"} · {formatDate(note.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </DetailSection>
        )}
      </div>
    </div>
  );
}
