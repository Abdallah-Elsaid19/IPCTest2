import { ChevronLeft, ChevronRight, Eye, LoaderCircle, Mail, Search, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  bursaryApi,
  moduleLabels,
  type BursaryAdminQuery,
  type PaginatedBursaryApplications,
} from "@/features/bursary/api";
import {
  AdminPageHeader,
  ClearFiltersButton,
  EmptyState,
  StatusBadge,
} from "@/features/admin/components/AdminPage";
import { notifications } from "@/lib/notifications";
import { apiJson } from "@/lib/api";

const fieldClass = "h-10 rounded-xl border border-[#D4C6B5] bg-white px-3 text-xs outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

type ScholarshipReminder = {
  id: number;
  email: string;
  consent: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_email_sent_at: string | null;
  email_send_count: number;
};

function ScholarshipRemindersTable() {
  const [items, setItems] = useState<ScholarshipReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingId, setSendingId] = useState<number | null>(null);

  const loadReminders = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);
    try {
      const response = await apiJson<ScholarshipReminder[]>(
        "/api/admin/scholarship-reminders",
        undefined,
        { signal, requestSource: "admin-scholarship-reminders" },
      );
      setItems(response);
    } catch (error) {
      if (!signal?.aborted) {
        notifications.error(error instanceof Error ? error.message : "Could not load reminder requests.");
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadReminders(controller.signal);
    return () => controller.abort();
  }, [loadReminders]);

  const sendMail = async (item: ScholarshipReminder) => {
    setSendingId(item.id);
    try {
      const updated = await apiJson<ScholarshipReminder>(
        `/api/admin/scholarship-reminders/${item.id}/send-email`,
        {},
        { requestSource: "admin-scholarship-reminder-send" },
      );
      setItems((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
      notifications.success(`Reminder email sent successfully to ${item.email}.`);
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "The reminder email could not be sent.");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <section className="mt-7 overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#E8DED2] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary-800">Announcement reminders</p>
          <h2 className="mt-2 text-xl font-black text-[#171411]">Saved email requests</h2>
          <p className="mt-1 text-sm text-[#756B61]">People who asked to be reminded about the 12 August 2026 announcement.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#D8CCBD] bg-[#F7F1E9] px-4 py-2 text-sm font-bold text-[#4F463E]">
          <Mail size={16} aria-hidden="true" /> {items.length} requests
        </div>
      </div>

      {isLoading ? (
        <div className="grid min-h-56 place-items-center" role="status">
          <LoaderCircle className="animate-spin text-primary-700" size={28} />
          <span className="sr-only">Loading reminder requests</span>
        </div>
      ) : !items.length ? (
        <div className="p-5"><EmptyState>No scholarship reminder requests have been received yet.</EmptyState></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-[#ECE2D6] text-[10px] uppercase tracking-wider text-[#5E554C]">
              <tr>
                {['Email', 'Requested', 'Last email sent', 'Send count', 'Status', 'Actions'].map((heading) => (
                  <th key={heading} className="px-5 py-3.5">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8DED2]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAF5EE]">
                  <td className="px-5 py-4 font-semibold text-[#221E1A]">{item.email}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-[#756B61]">{formatDate(item.created_at)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-[#756B61]">{item.last_email_sent_at ? formatDate(item.last_email_sent_at) : "Not sent yet"}</td>
                  <td className="px-5 py-4 font-mono text-xs font-bold">{item.email_send_count}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${item.is_active ? "border-emerald-700/20 bg-emerald-100 text-emerald-800" : "border-[#D9CDBE] bg-[#F1E8DC] text-[#655D55]"}`}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => void sendMail(item)}
                      disabled={sendingId !== null || !item.is_active}
                      className="ml-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-black text-[#171411] transition-colors hover:bg-primary-600 disabled:cursor-wait disabled:opacity-50"
                    >
                      {sendingId === item.id ? <LoaderCircle className="animate-spin" size={15} aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
                      {sendingId === item.id ? "Sending..." : "Send mail"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AdminBursaryApplicationsPage() {
  const [activeTab, setActiveTab] = useState<"applications" | "reminders">("applications");
  const [result, setResult] = useState<PaginatedBursaryApplications | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Omit<BursaryAdminQuery, "page" | "search">>({
    status: "",
    pathway: "",
    employed: "",
    country: "",
    dateFrom: "",
    dateTo: "",
    ordering: "-submitted_at",
  });
  const controllerRef = useRef<AbortController | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const id = ++requestId.current;
    setIsLoading(true);
    try {
      const response = await bursaryApi.list(
        { page, search: search.trim(), ...filters },
        controller.signal,
      );
      if (id === requestId.current) setResult(response);
    } catch (error) {
      if (!controller.signal.aborted && id === requestId.current) {
        notifications.error(error instanceof Error ? error.message : "Could not load bursary applications.");
      }
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [filters, page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), search ? 350 : 0);
    return () => window.clearTimeout(timer);
  }, [load, search]);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const cards = useMemo(() => {
    const summary = result?.summary;
    return [
      ["Total applications", summary?.total ?? 0],
      ["New / Submitted", summary?.submitted ?? 0],
      ["Under review", summary?.under_review ?? 0],
      ["Approved", summary?.approved ?? 0],
      ["Rejected", summary?.rejected ?? 0],
    ];
  }, [result]);
  const pageCount = Math.max(1, Math.ceil((result?.count || 0) / 15));
  const hasFilters = Boolean(
    search || filters.status || filters.pathway || filters.employed || filters.country
    || filters.dateFrom || filters.dateTo || filters.ordering !== "-submitted_at",
  );

  const clear = () => {
    setSearch("");
    setPage(1);
    setFilters({
      status: "", pathway: "", employed: "", country: "", dateFrom: "",
      dateTo: "", ordering: "-submitted_at",
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-7 text-[#221E1A] md:px-8 md:py-9">
      <AdminPageHeader
        eyebrow="Scholarships"
        title="Bursary & Scholarship Applications"
        description="Review learner applications, funding requests, module choices and mandatory declarations."
      />
      <div className="mt-7 inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-[#D8CCBD] bg-[#EDE3D7] p-1" role="tablist" aria-label="Bursary administration views">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "applications"}
          onClick={() => setActiveTab("applications")}
          className={`min-h-11 whitespace-nowrap rounded-xl px-5 text-xs font-black uppercase tracking-[0.1em] transition-colors ${activeTab === "applications" ? "bg-[#221E1A] text-white shadow-sm" : "text-[#655D55] hover:bg-white/60"}`}
        >
          Applications
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "reminders"}
          onClick={() => setActiveTab("reminders")}
          className={`min-h-11 whitespace-nowrap rounded-xl px-5 text-xs font-black uppercase tracking-[0.1em] transition-colors ${activeTab === "reminders" ? "bg-[#221E1A] text-white shadow-sm" : "text-[#655D55] hover:bg-white/60"}`}
        >
          Announcement reminders
        </button>
      </div>
      {activeTab === "applications" ? (
      <>
      <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, count]) => (
          <article key={label} className="rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-5 shadow-sm">
            <p className="text-xs font-semibold text-[#756B61]">{label}</p>
            <p className="mt-2 text-3xl font-black text-[#171411]">{count}</p>
          </article>
        ))}
      </section>
      <section className="mt-6 rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-sm">
        <div className="border-b border-[#E8DED2] p-4 md:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="relative md:col-span-2">
              <span className="sr-only">Search applications</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-3 text-[#867A6E]" />
              <input
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                placeholder="Search reference, name, email, phone or organisation"
                className={`${fieldClass} w-full pl-9`}
              />
            </label>
            <label>
              <span className="sr-only">Status</span>
              <select value={filters.status} onChange={(event) => { setFilters((value) => ({ ...value, status: event.target.value as BursaryAdminQuery["status"] })); setPage(1); }} className={`${fieldClass} w-full`}>
                <option value="">All statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under review</option>
                <option value="needs_information">Needs information</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Module</span>
              <select value={filters.pathway} onChange={(event) => { setFilters((value) => ({ ...value, pathway: event.target.value })); setPage(1); }} className={`${fieldClass} w-full`}>
                <option value="">All modules</option>
                {Object.entries(moduleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Employment status</span>
              <select value={filters.employed} onChange={(event) => { setFilters((value) => ({ ...value, employed: event.target.value as BursaryAdminQuery["employed"] })); setPage(1); }} className={`${fieldClass} w-full`}>
                <option value="">All employment statuses</option>
                <option value="true">Currently employed</option>
                <option value="false">Not currently employed</option>
              </select>
            </label>
            <label>
              <span className="sr-only">Country</span>
              <input value={filters.country} onChange={(event) => { setFilters((value) => ({ ...value, country: event.target.value })); setPage(1); }} placeholder="Country" className={`${fieldClass} w-full`} />
            </label>
            <label className="flex items-center gap-2">
              <span className="shrink-0 text-[10px] font-bold uppercase text-[#756B61]">From</span>
              <input type="date" value={filters.dateFrom} onChange={(event) => { setFilters((value) => ({ ...value, dateFrom: event.target.value })); setPage(1); }} className={`${fieldClass} min-w-0 flex-1`} />
            </label>
            <label className="flex items-center gap-2">
              <span className="shrink-0 text-[10px] font-bold uppercase text-[#756B61]">To</span>
              <input type="date" value={filters.dateTo} onChange={(event) => { setFilters((value) => ({ ...value, dateTo: event.target.value })); setPage(1); }} className={`${fieldClass} min-w-0 flex-1`} />
            </label>
            <label>
              <span className="sr-only">Sort applications</span>
              <select value={filters.ordering} onChange={(event) => { setFilters((value) => ({ ...value, ordering: event.target.value })); setPage(1); }} className={`${fieldClass} w-full`}>
                <option value="-submitted_at">Newest first</option>
                <option value="submitted_at">Oldest first</option>
                <option value="first_name">Applicant name</option>
                <option value="status">Status</option>
              </select>
            </label>
            {hasFilters && <ClearFiltersButton onClick={clear} className="justify-self-start" />}
          </div>
        </div>
        {isLoading && !result ? (
          <div className="grid min-h-64 place-items-center" role="status">
            <LoaderCircle className="animate-spin text-primary-700" size={28} />
            <span className="sr-only">Loading applications</span>
          </div>
        ) : !result?.results.length ? (
          <div className="p-5"><EmptyState>No bursary applications match the current filters.</EmptyState></div>
        ) : (
          <div className={`overflow-x-auto ${isLoading ? "opacity-60" : ""}`} aria-busy={isLoading}>
            <table className="min-w-[1150px] w-full text-left text-sm">
              <thead className="bg-[#ECE2D6] text-[10px] uppercase tracking-wider text-[#5E554C]">
                <tr>
                  {["Reference", "Applicant", "Mobile", "Country", "Employment", "Organisation", "Module", "Status", "Submitted", "Actions"].map((heading) => (
                    <th key={heading} className="px-4 py-3.5">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DED2]">
                {result.results.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF5EE]">
                    <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-bold text-primary-800">{item.application_reference}</td>
                    <td className="px-4 py-4"><p className="font-semibold">{item.applicant_name}</p><p className="mt-1 text-xs text-[#81766B]">{item.email}</p></td>
                    <td className="whitespace-nowrap px-4 py-4">{item.mobile_phone_e164}</td>
                    <td className="px-4 py-4">{item.country}</td>
                    <td className="px-4 py-4">{item.currently_employed ? "Employed" : "Not employed"}</td>
                    <td className="max-w-48 truncate px-4 py-4" title={item.organisation_name}>{item.organisation_name || "Not applicable"}</td>
                    <td className="px-4 py-4">{item.preferred_pathway_label}</td>
                    <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                    <td className="whitespace-nowrap px-4 py-4 text-[#756B61]">{formatDate(item.submitted_at)}</td>
                    <td className="px-4 py-4 text-right">
                      <Link to={`/admin/bursary-applications/${item.id}`} className="inline-grid h-9 w-9 place-items-center rounded-lg border border-[#D8CCBD] bg-white hover:border-primary-500 hover:bg-primary-50" aria-label={`View ${item.application_reference}`}><Eye size={16} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-[#E8DED2] px-5 py-4">
          <p className="text-xs text-[#746A60]">Page {page} of {pageCount}</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={!result?.previous || isLoading} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D4C6B5] px-3 text-xs font-bold disabled:opacity-40"><ChevronLeft size={15} /> Previous</button>
            <button type="button" onClick={() => setPage((value) => value + 1)} disabled={!result?.next || isLoading} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D4C6B5] px-3 text-xs font-bold disabled:opacity-40">Next <ChevronRight size={15} /></button>
          </div>
        </div>
      </section>
      </>
      ) : (
        <ScholarshipRemindersTable />
      )}
    </div>
  );
}
