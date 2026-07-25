import { ChevronLeft, ChevronRight, Eye, Mail, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";

import {
  adminApi,
  type AdminEnquiryQuery,
} from "@/features/admin/adminApi";
import {
  AdminPageHeader,
  AdminPageState,
  ClearFiltersButton,
  EmptyState,
  ManageLink,
  StatusBadge,
} from "@/features/admin/components/AdminPage";
import { useAdminDashboard } from "@/features/admin/context/AdminDashboardContext";
import EnquiryReplyModal from "@/features/admin/enquiries/EnquiryReplyModal";
import EnquiryDetailsModal from "@/features/admin/enquiries/EnquiryDetailsModal";
import type {
  DashboardEnquiry,
  PaginatedAdminEnquiries,
} from "@/features/admin/types";
import { useAuth } from "@/features/auth/AuthContext";
import { adminUrl, formatDate } from "@/features/admin/utils";
import { notifications } from "@/lib/notifications";

const repliedStatuses = new Set(["in_progress", "contacted", "resolved", "closed"]);

export default function AdminEnquiriesPage() {
  const { refresh } = useAdminDashboard();
  const { user } = useAuth();
  const [result, setResult] = useState<PaginatedAdminEnquiries | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<
    Pick<AdminEnquiryQuery, "source" | "status" | "date">
  >({ source: "", status: "", date: "" });
  const [replyingTo, setReplyingTo] = useState<DashboardEnquiry | null>(null);
  const [viewingEnquiry, setViewingEnquiry] = useState<DashboardEnquiry | null>(null);
  const [repliedEnquiries, setRepliedEnquiries] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    adminApi.enquiries({ page, ...filters }, controller.signal)
      .then(setResult)
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult((current) => current ?? {
          count: 0,
          next: null,
          previous: null,
          results: [],
        });
        notifications.error(error instanceof Error ? error.message : "The enquiries could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [filters, page]);

  const enquiryKey = (enquiry: DashboardEnquiry) => `${enquiry.type}-${enquiry.id}`;
  const hasBeenRepliedTo = (enquiry: DashboardEnquiry) => (
    repliedStatuses.has(enquiry.status.toLowerCase()) || repliedEnquiries.has(enquiryKey(enquiry))
  );

  const sendReply = async (message: string) => {
    if (!replyingTo) return;
    try {
      const response = await adminApi.replyToEnquiry(replyingTo.type, replyingTo.id, message);
      const repliedKey = enquiryKey(replyingTo);
      setRepliedEnquiries((current) => new Set(current).add(repliedKey));
      setResult((current) => current ? {
        ...current,
        results: current.results.map((enquiry) => (
          enquiryKey(enquiry) === repliedKey
            ? { ...enquiry, status: response.status }
            : enquiry
        )),
      } : current);
      notifications.success(`Reply sent successfully to ${replyingTo.email}.`);
      setReplyingTo(null);
      void refresh();
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "The enquiry reply could not be sent.");
    }
  };
  const pageCount = Math.max(1, Math.ceil((result?.count || 0) / 10));
  const hasActiveFilters = Boolean(filters.source || filters.status || filters.date);
  const selectClass =
    "h-10 rounded-xl border border-[#D9CDBE] bg-white px-3 text-xs font-semibold text-[#4F4841] outline-none focus:border-primary-500";

  return (
    <AdminPageState isLoading={result === null} hasData={result !== null}>
      {result && (
        <>
          <AdminPageHeader
            eyebrow="Communications"
            title="Enquiries"
            description="Contact, club and award enquiries in one place."
            action={
              <ManageLink href={`${adminUrl}contact/contactsubmission/`}>
                Open inbox
              </ManageLink>
            }
          />
          <section className="mt-8 overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_8px_25px_rgba(66,48,31,0.05)]">
            <div className="grid grid-cols-2 gap-2 border-b border-[#E8DED2] p-4 sm:flex sm:flex-wrap sm:items-center sm:justify-end">
              <select
                aria-label="Filter enquiry source"
                value={filters.source}
                onChange={(event) => {
                  setFilters((current) => ({
                    ...current,
                    source: event.target.value as AdminEnquiryQuery["source"],
                  }));
                  setPage(1);
                }}
                className={`${selectClass} w-full sm:w-auto`}
              >
                <option value="">All sources</option>
                <option value="contact">Contact</option>
                <option value="club">Club</option>
                <option value="award">Award</option>
              </select>
              <select
                aria-label="Filter enquiry status"
                value={filters.status}
                onChange={(event) => {
                  setFilters((current) => ({
                    ...current,
                    status: event.target.value,
                  }));
                  setPage(1);
                }}
                className={`${selectClass} w-full sm:w-auto`}
              >
                <option value="">All statuses</option>
                <option value="new">New</option>
                <option value="in_progress">In progress</option>
                <option value="contacted">Contacted</option>
                <option value="handled">Handled</option>
                <option value="closed">Closed</option>
                <option value="spam">Spam</option>
              </select>
              <input
                type="date"
                aria-label="Filter enquiries by received date"
                value={filters.date}
                onChange={(event) => {
                  setFilters((current) => ({
                    ...current,
                    date: event.target.value,
                  }));
                  setPage(1);
                }}
                className={`${selectClass} col-span-2 w-full sm:w-auto`}
              />
              {hasActiveFilters && (
                <ClearFiltersButton
                  onClick={() => {
                    setFilters({ source: "", status: "", date: "" });
                    setPage(1);
                  }}
                  className="col-span-2 sm:col-auto"
                />
              )}
            </div>
            <div className="flex items-center justify-between border-b border-[#E8DED2] bg-[#F7F2EB] px-5 py-3 text-xs text-[#746A60]">
              <span>
                <strong className="text-[#2D2823]">{result.count}</strong>{" "}
                matching enquiries
              </span>
              {isLoading && <span>Loading</span>}
            </div>
            {result.results.length ? (
              <div>
                <div className="divide-y divide-[#E8DED2] md:hidden">
                  {result.results.map((item) => {
                    const isReplied = hasBeenRepliedTo(item);
                    return (
                      <article
                        key={`mobile-${item.type}-${item.id}`}
                        className="p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-primary-800">
                            {item.type}
                          </span>
                          <StatusBadge status={item.status} />
                        </div>
                        <div className="mt-4 min-w-0">
                          <p className="break-words text-sm font-bold text-[#221E1A]">
                            {item.name}
                          </p>
                          <p className="mt-1 break-all text-xs text-[#8A7E72]">
                            {item.email}
                          </p>
                        </div>
                        <div className="mt-4 rounded-xl bg-[#F7F2EB] p-3">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[#8A7E72]">
                            Subject
                          </p>
                          <p className="mt-1 break-words text-sm text-[#554E47]">
                            {item.subject}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <time
                            dateTime={item.created_at}
                            className="text-xs font-semibold text-[#756B61]"
                          >
                            {formatDate(item.created_at)}
                          </time>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingEnquiry(item)}
                              className="grid h-10 w-10 place-items-center rounded-lg border border-[#D8CCBD] bg-white text-[#655D55] transition-colors hover:border-primary-500 hover:bg-primary-100 hover:text-primary-800"
                              title={`View enquiry from ${item.name}`}
                              aria-label={`View enquiry details from ${item.name}`}
                            >
                              <Eye size={17} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setReplyingTo(item)}
                              className={`relative grid h-10 w-10 place-items-center rounded-lg border transition-colors ${
                                isReplied
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "border-[#D8CCBD] bg-white text-[#655D55] hover:border-primary-500 hover:bg-primary-100 hover:text-primary-800"
                              }`}
                              title={isReplied ? `Replied - send another reply to ${item.email}` : `Reply to ${item.email}`}
                              aria-label={isReplied ? `Enquiry from ${item.name} has been replied to. Send another reply` : `Reply to ${item.name}`}
                            >
                              {isReplied ? <MailCheck size={18} /> : <Mail size={17} />}
                              {isReplied && (
                                <span
                                  className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#FFFDF9] bg-emerald-500"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-[#ECE2D6] text-[10px] uppercase tracking-wider text-[#766C62]">
                    <tr>
                      <th className="px-5 py-3.5">Source</th>
                      <th className="px-5 py-3.5">Contact</th>
                      <th className="px-5 py-3.5">Subject</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Received</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DED2]">
                    {result.results.map((item) => {
                      const isReplied = hasBeenRepliedTo(item);
                      return (
                      <tr
                        key={`${item.type}-${item.id}`}
                        className="hover:bg-[#FAF5EE]"
                      >
                        <td className="px-5 py-4 font-bold capitalize text-primary-800">
                          {item.type}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">{item.name}</p>
                          <p className="mt-1 text-xs text-[#8A7E72]">
                            {item.email}
                          </p>
                        </td>
                        <td className="max-w-xs truncate px-5 py-4 text-[#554E47]">
                          {item.subject}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-4 text-[#756B61]">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                          <button type="button" onClick={() => setViewingEnquiry(item)} className="inline-grid h-9 w-9 place-items-center rounded-lg border border-transparent text-[#655D55] transition-colors hover:bg-primary-100 hover:text-primary-800" title={`View enquiry from ${item.name}`} aria-label={`View enquiry details from ${item.name}`}><Eye size={16}/></button>
                          <button
                            type="button"
                            onClick={() => setReplyingTo(item)}
                            className={`relative inline-grid h-9 w-9 place-items-center rounded-lg border transition-colors ${isReplied ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-transparent text-[#655D55] hover:bg-primary-100 hover:text-primary-800"}`}
                            title={isReplied ? `Replied — send another reply to ${item.email}` : `Reply to ${item.email}`}
                            aria-label={isReplied ? `Enquiry from ${item.name} has been replied to. Send another reply` : `Reply to ${item.name}`}
                          >
                            {isReplied ? <MailCheck size={17} /> : <Mail size={16} />}
                            {isReplied && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#FFFDF9] bg-emerald-500" aria-hidden="true" />}
                          </button>
                          </div>
                        </td>
                      </tr>
                    );})}
                  </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <EmptyState>
                  {hasActiveFilters
                    ? "No enquiries match the selected filters."
                    : "No enquiries have been received."}
                </EmptyState>
              </div>
            )}
            <div className="flex flex-col gap-3 border-t border-[#E8DED2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-[#746A60]">
                Page {page} of {pageCount}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  disabled={!result.previous || isLoading}
                  className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[#D4C6B5] px-3 text-xs font-bold disabled:opacity-40"
                >
                  <ChevronLeft size={15} /> Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((value) => value + 1)}
                  disabled={!result.next || isLoading}
                  className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[#D4C6B5] px-3 text-xs font-bold disabled:opacity-40"
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </section>
          <EnquiryReplyModal
            enquiry={replyingTo}
            administrator={user}
            onClose={() => setReplyingTo(null)}
            onSend={sendReply}
          />
          <EnquiryDetailsModal enquiry={viewingEnquiry} onClose={() => setViewingEnquiry(null)} />
        </>
      )}
    </AdminPageState>
  );
}
