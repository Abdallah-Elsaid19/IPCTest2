import { Eye, LoaderCircle, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

import ClubJoinModal, { type ClubJoinDetails } from "@/features/clubs/components/ClubJoinModal";
import { notifications } from "@/lib/notifications";
import { panelApi, rows } from "../api";
import { Card, Empty, ErrorState, inputClass, Loading, PageHeading, Status } from "../components/PanelUI";
import { useLoad } from "../hooks";
import type {
  DirectoryItem,
  ScholarshipApplicationDetail,
  ScholarshipApplicationSummary,
} from "../types";

const config = {
  scholarships: { title: "Scholarships", description: "Track your applications and explore available funding opportunities.", empty: "No additional scholarship opportunities are currently listed." },
  awards: { title: "Awards", description: "Discover IPC recognition programmes and nominate outstanding professionals.", empty: "No active awards are currently listed." },
  clubs: { title: "Professional clubs", description: "Connect with regional and specialist IPC communities.", empty: "No active clubs are currently listed." },
  programmes: { title: "Programmes", description: "Explore professional learning programmes and contact the programme team.", empty: "No active programmes are currently listed." },
} as const;

export default function DirectoryPage({ kind }: { kind: keyof typeof config }) {
  const load = useCallback(
    (signal: AbortSignal) => kind === "scholarships"
      ? Promise.resolve([] as DirectoryItem[])
      : panelApi.list<DirectoryItem>(kind, signal),
    [kind],
  );
  const { data, loading, error, reload } = useLoad(load);
  const loadApplications = useCallback(
    (signal: AbortSignal) => kind === "scholarships"
      ? panelApi.list<ScholarshipApplicationSummary>("scholarships/my-applications", signal)
      : Promise.resolve([] as ScholarshipApplicationSummary[]),
    [kind],
  );
  const applicationState = useLoad(loadApplications);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [joiningClub, setJoiningClub] = useState<DirectoryItem | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ScholarshipApplicationSummary | null>(null);
  const [applicationDetail, setApplicationDetail] = useState<ScholarshipApplicationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const items = useMemo(
    () => rows(data).filter((item) =>
      `${item.title || item.name} ${item.summary || ""} ${item.category || item.location || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
    [data, query],
  );
  const applications = rows(applicationState.data);
  const filteredApplications = useMemo(
    () => applications.filter((application) =>
      [
        application.application_reference,
        application.title,
        application.pathway,
        application.status,
        application.status_label,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    ),
    [applications, query],
  );

  useEffect(() => {
    if (kind !== "scholarships") return;

    let controller: AbortController | null = null;
    const refreshApplications = () => {
      controller?.abort();
      controller = new AbortController();
      void panelApi
        .list<ScholarshipApplicationSummary>("scholarships/my-applications", controller.signal)
        .then(applicationState.setData)
        .catch((reason: unknown) => {
          if (reason instanceof DOMException && reason.name === "AbortError") return;
          // Keep the last known status visible until the next successful refresh.
        });
    };
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshApplications();
    };
    const interval = window.setInterval(refreshApplications, 30_000);
    window.addEventListener("focus", refreshApplications);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      controller?.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshApplications);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [applicationState.setData, kind]);

  async function act(item: DirectoryItem, clubDetails?: ClubJoinDetails) {
    const id = item.slug;
    setBusy(id);
    try {
      if (kind === "clubs") {
        await panelApi.action(`clubs/${id}/join`, clubDetails);
      } else if (kind === "scholarships") {
        await panelApi.create("scholarships/applications", { scholarship: id, current_step: 1, statement: "", responses: {} });
      } else {
        await panelApi.create("programmes/enquiries", { programme: id, message: "I would like more information about this programme." });
      }
      notifications.success(kind === "clubs" ? "Join request sent" : "Draft created");
      if (kind === "clubs") {
        setJoiningClub(null);
        reload();
      }
    } catch (reason) {
      notifications.error(reason instanceof Error ? reason.message : "Action failed");
    } finally {
      setBusy("");
    }
  }

  async function openApplicationDetails(application: ScholarshipApplicationSummary) {
    if (application.source !== "bursary" || !application.application_reference) return;
    setSelectedApplication(application);
    setApplicationDetail(null);
    setDetailError("");
    setDetailLoading(true);
    try {
      const detail = await panelApi.get<ScholarshipApplicationDetail>(
        `scholarships/my-applications/${encodeURIComponent(application.application_reference)}`,
      );
      setApplicationDetail(detail);
    } catch (reason) {
      setDetailError(reason instanceof Error ? reason.message : "Application details could not be loaded.");
    } finally {
      setDetailLoading(false);
    }
  }

  function closeApplicationDetails() {
    setSelectedApplication(null);
    setApplicationDetail(null);
    setDetailError("");
  }

  if (loading || (kind === "scholarships" && applicationState.loading)) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  if (kind === "scholarships" && applicationState.error) {
    return <ErrorState message={applicationState.error} retry={applicationState.reload} />;
  }

  return (
    <>
      <PageHeading title={config[kind].title} description={config[kind].description} />
      {kind === "scholarships" && (
        <label className="relative mb-6 block max-w-xl">
          <Search className="absolute left-3 top-3.5 text-foreground-400" size={18} />
          <input
            aria-label="Search my applications"
            className={`${inputClass} mt-0 pl-10`}
            placeholder="Search my applications..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
      )}
      {kind === "scholarships" && (
        <section className="mb-8" aria-labelledby="my-scholarship-applications">
          <h2 id="my-scholarship-applications" className="text-xl font-semibold text-[#171411]">
            My applications
          </h2>
          <p className="mt-1 text-sm text-foreground-600">
            Applications submitted using your IPC membership reference appear here.
          </p>
          {filteredApplications.length ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {filteredApplications.map((application) => (
                <Card key={application.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-primary-700">
                        {application.title}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">
                        {application.pathway || application.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Status value={application.status} />
                      {application.source === "bursary" && application.application_reference && (
                        <button
                          type="button"
                          onClick={() => void openApplicationDetails(application)}
                          className="grid h-9 w-9 place-items-center rounded-xl border border-[#D8CCBD] bg-white text-primary-800 transition-colors hover:border-primary-500 hover:bg-primary-50"
                          aria-label={`View details for ${application.application_reference}`}
                          title="View application details"
                        >
                          <Eye size={17} />
                        </button>
                      )}
                    </div>
                  </div>
                  {application.application_reference && (
                    <div className="mt-5 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-primary-800">
                        Application reference
                      </p>
                      <p className="mt-1 break-all font-mono text-sm font-bold text-background-950">
                        {application.application_reference}
                      </p>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-foreground-600">
                    <span>Status: {application.status_label}</span>
                    <span>
                      {application.submitted_at
                        ? `Submitted ${new Date(application.submitted_at).toLocaleDateString("en-GB")}`
                        : `Updated ${new Date(application.updated_at).toLocaleDateString("en-GB")}`}
                      </span>
                  </div>
                  {application.source === "bursary" && application.status === "needs_information" && (
                    <Link
                      to="/bursary-scholarship-application"
                      className="btn-primary mt-4 w-full rounded-xl text-center"
                    >
                      Update application
                    </Link>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <Empty
                title={query.trim() ? "No matching applications" : "No applications yet"}
                text={query.trim()
                  ? "Try searching by application reference, module or status."
                  : "Your submitted IPC bursary and scholarship applications will appear here."}
              />
            </div>
          )}
        </section>
      )}
      {kind !== "scholarships" && (<label className="relative mb-6 block max-w-xl">
        <Search className="absolute left-3 top-3.5 text-foreground-400" size={18} />
        <input aria-label={`Search ${kind}`} className={`${inputClass} mt-0 pl-10`} placeholder={`Search ${kind}…`} value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>)}
      {kind !== "scholarships" && (items.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const pending = kind === "clubs" && item.membership_status === "pending";
            return (
              <Card key={item.slug} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-700">{item.category || item.location || item.provider || kind.slice(0, -1)}</p>
                  {item.membership_status && <Status value={item.membership_status} />}
                </div>
                <h2 className="mt-3 text-xl font-semibold">{item.title || item.name}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-foreground-600">{item.summary || item.description}</p>
                {item.deadline && <p className="mt-4 text-xs text-foreground-500">Deadline: {new Date(item.deadline).toLocaleDateString()}</p>}
                {kind === "awards" ? (
                  <Link to={`/user/awards/${item.slug}/apply`} className="btn-primary mt-5 w-full">Start nomination</Link>
                ) : kind === "clubs" && item.membership_status === "active" ? (
                  <Link to={item.slug} className="btn-primary mt-5 w-full">Open community</Link>
                ) : (
                  <button
                    disabled={busy === item.slug || pending}
                    onClick={() => kind === "clubs" ? setJoiningClub(item) : void act(item)}
                    className={`mt-5 min-h-12 w-full rounded-xl px-4 text-xs font-black uppercase tracking-wide ${pending ? "cursor-not-allowed border border-amber-300 bg-amber-50 text-amber-800 opacity-80" : "btn-primary"}`}
                  >
                    {busy === item.slug ? "Please wait…" : pending ? "Pending admin approval" : kind === "clubs" ? "Request to join" : kind === "programmes" ? "Request information" : "Start application"}
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      ) : <Empty title={`No ${kind} found`} text={config[kind].empty} />)}

      {joiningClub && (
        <ClubJoinModal
          clubName={joiningClub.name || joiningClub.title || "IPC Club"}
          open
          saving={busy === joiningClub.slug}
          onClose={() => setJoiningClub(null)}
          onSubmit={(details) => void act(joiningClub, details)}
        />
      )}
      {selectedApplication && (
        <ApplicationDetailsModal
          summary={selectedApplication}
          detail={applicationDetail}
          loading={detailLoading}
          error={detailError}
          onClose={closeApplicationDetails}
          onRetry={() => void openApplicationDetails(selectedApplication)}
        />
      )}
    </>
  );
}

function ApplicationDetailsModal({
  summary,
  detail,
  loading,
  error,
  onClose,
  onRetry,
}: {
  summary: ScholarshipApplicationSummary;
  detail: ScholarshipApplicationDetail | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onRetry: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-details-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="my-8 w-full max-w-4xl rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-[#E4D9CC] px-6 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary-800">
              IPC Bursary application
            </p>
            <h2 id="application-details-title" className="mt-2 text-2xl font-black text-[#171411]">
              {summary.pathway || "Application details"}
            </h2>
            <p className="mt-1 break-all font-mono text-xs font-bold text-[#756B61]">
              {summary.application_reference}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-[#F4ECE1]"
            aria-label="Close application details"
          >
            <X size={20} />
          </button>
        </header>

        <div className="max-h-[75vh] overflow-y-auto px-6 py-6">
          {loading && (
            <div className="grid min-h-56 place-items-center" role="status">
              <LoaderCircle className="animate-spin text-primary-700" size={28} />
              <span className="sr-only">Loading application details</span>
            </div>
          )}
          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
              <p className="text-sm font-semibold text-red-800">{error}</p>
              <button type="button" onClick={onRetry} className="btn-primary mt-4">
                Try again
              </button>
            </div>
          )}
          {!loading && detail && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#151718] px-5 py-4 text-white">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-primary-300">Current status</p>
                  <p className="mt-1 font-bold">{detail.status_label}</p>
                </div>
                <Status value={detail.status} />
              </div>

              {detail.status === "needs_information" && (
                <Link
                  to="/bursary-scholarship-application"
                  onClick={onClose}
                  className="btn-primary w-full rounded-xl text-center sm:w-auto"
                >
                  Update requested information
                </Link>
              )}

              <DetailSection title="Application overview">
                <Detail label="Modules" value={detail.pathway.name} />
                <Detail label="Membership reference" value={detail.membership_reference} mono />
                <Detail label="Submitted" value={formatDetailDate(detail.submitted_at)} />
              </DetailSection>

              <DetailSection title="Applicant">
                <Detail label="Full name" value={detail.applicant.name} />
                <Detail label="Preferred name" value={detail.applicant.preferred_name} />
                <Detail label="Email" value={detail.applicant.email} />
                <Detail label="Mobile telephone" value={detail.applicant.mobile_phone} />
                <Detail label="Town or city" value={detail.applicant.town_or_city} />
                <Detail label="Country" value={detail.applicant.country} />
              </DetailSection>

              {detail.organisation.applicable && (
                <DetailSection title="Organisation">
                  <Detail label="Organisation" value={detail.organisation.name} />
                  <Detail label="Job title" value={detail.organisation.job_title} />
                  <Detail label="Industry or sector" value={detail.organisation.industry} />
                </DetailSection>
              )}

              <DetailSection title="Module background">
                <Detail label="Professional memberships or certifications" value={detail.pathway.professional_memberships} />
              </DetailSection>

              <DetailSection title="Emergency contact">
                <Detail label="Full name" value={detail.emergency_contact.full_name} />
                <Detail label="Relationship" value={detail.emergency_contact.relationship} />
                <Detail label="Email" value={detail.emergency_contact.email} />
                <Detail label="Phone" value={detail.emergency_contact.phone} />
              </DetailSection>

              <DetailSection title="Identification and support information">
                <Detail label="Support need declared" value={detail.support_needs.declared ? "Yes" : "No"} />
                <Detail label="Primary support need" value={detail.support_needs.primary} />
                <Detail label="Identity evidence" value={detail.support_needs.identity_document_uploaded ? "Uploaded" : "Not uploaded"} />
                <Detail label="Applicant photo" value={detail.support_needs.applicant_photo_uploaded ? "Uploaded" : "Not uploaded"} />
              </DetailSection>

              <section>
                <h3 className="text-lg font-black text-[#171411]">Application statements</h3>
                <div className="mt-3 space-y-3">
                  {[
                    ["Relevant experience", detail.statements.relevant_experience],
                    ["Why the applicant wants an IPC bursary", detail.statements.pathway_fit_reason],
                  ].filter(([, value]) => value).map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-[#E2D8CC] bg-white p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#887C70]">{label}</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4F4842]">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-lg font-black text-[#171411]">{title}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function Detail({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-[#E2D8CC] bg-white px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#887C70]">{label}</p>
      <p className={`mt-1 break-words text-sm font-semibold text-[#332E29] ${mono ? "font-mono" : ""}`}>
        {value || "Not provided"}
      </p>
    </div>
  );
}

function formatDetailDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
