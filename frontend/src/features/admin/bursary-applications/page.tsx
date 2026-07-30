import { ChevronLeft, ChevronRight, Eye, LoaderCircle, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  bursaryApi,
  pathwayLabels,
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

const fieldClass = "h-10 rounded-xl border border-[#D4C6B5] bg-white px-3 text-xs outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20";

const formatCurrency = (value: string) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(value));
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function AdminBursaryApplicationsPage() {
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
        description="Review learner applications, funding requests, pathway choices and mandatory declarations."
      />
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
              <span className="sr-only">Pathway</span>
              <select value={filters.pathway} onChange={(event) => { setFilters((value) => ({ ...value, pathway: event.target.value })); setPage(1); }} className={`${fieldClass} w-full`}>
                <option value="">All pathways</option>
                {Object.entries(pathwayLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
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
                <option value="-bursary_amount_requested_gbp">Bursary amount — high to low</option>
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
            <table className="min-w-[1400px] w-full text-left text-sm">
              <thead className="bg-[#ECE2D6] text-[10px] uppercase tracking-wider text-[#5E554C]">
                <tr>
                  {["Reference", "Applicant", "Mobile", "Country", "Employment", "Organisation", "Pathway", "Bursary", "Requested %", "Status", "Submitted", "Actions"].map((heading) => (
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
                    <td className="whitespace-nowrap px-4 py-4 font-semibold">{formatCurrency(item.bursary_amount_requested_gbp)}</td>
                    <td className="px-4 py-4">{Number(item.requested_bursary_percentage).toLocaleString()}%</td>
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
    </div>
  );
}
