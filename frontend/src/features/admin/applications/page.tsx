import {
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  LockKeyhole,
  Pencil,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  adminApi,
  type AdminApplicationQuery,
} from "@/features/admin/adminApi";
import ApplicationStatusModal from "@/features/admin/applications/ApplicationStatusModal";
import {
  AdminPageHeader,
  EmptyState,
  StatusBadge,
} from "@/features/admin/components/AdminPage";
import { useAdminDashboard } from "@/features/admin/context/AdminDashboardContext";
import type {
  ApplicationStatus,
  DashboardApplication,
  PaginatedAdminApplications,
} from "@/features/admin/types";
import { formatDate } from "@/features/admin/utils";
import { notifications } from "@/lib/notifications";

export default function AdminApplicationsPage() {
  const { updateRecentApplication } = useAdminDashboard();
  const [result, setResult] = useState<PaginatedAdminApplications | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<
    Pick<AdminApplicationQuery, "status" | "grade">
  >({ status: "", grade: "" });
  const [editingApplication, setEditingApplication] =
    useState<DashboardApplication | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const requestId = useRef(0);
  const requestController = useRef<AbortController | null>(null);
  const saveLock = useRef(false);

  const loadApplications = useCallback(async () => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    const id = ++requestId.current;
    setIsLoading(true);
    try {
      const response = await adminApi.applications({
        page,
        search: search.trim(),
        ...filters,
      }, controller.signal);
      if (id === requestId.current) setResult(response);
    } catch (error) {
      if (controller.signal.aborted) return;
      if (id === requestId.current) {
        notifications.error(
          error instanceof Error
            ? error.message
            : "Could not load applications.",
        );
      }
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [filters, page, search]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => void loadApplications(),
      search ? 150 : 0,
    );
    return () => window.clearTimeout(timer);
  }, [loadApplications, search]);

  useEffect(
    () => () => requestController.current?.abort(),
    [],
  );

  const saveStatus = async (status: ApplicationStatus) => {
    if (!editingApplication || saveLock.current) return;
    saveLock.current = true;
    setIsSaving(true);
    try {
      const updated = await adminApi.updateApplicationStatus(
        editingApplication.id,
        status,
      );
      updateRecentApplication(updated);
      setEditingApplication(null);
      await loadApplications();
      if (status === "approved") {
        notifications.success(
          `Application approved successfully. The IPC user account ${updated.approved_user_email} was created and linked to application ${updated.application_reference}.`,
        );
        if (!updated.welcome_email_sent) {
          notifications.error(
            "The account was created, but the welcome email could not be sent. It can be retried from the application details page.",
          );
        }
      } else {
        notifications.success("Application status updated successfully.");
      }
    } catch (error) {
      notifications.error(
        error instanceof Error
          ? error.message
          : "Could not update the application status.",
      );
    } finally {
      saveLock.current = false;
      setIsSaving(false);
    }
  };

  const pageCount = Math.max(1, Math.ceil((result?.count || 0) / 10));
  const selectClass =
    "h-10 rounded-xl border border-[#D9CDBE] bg-white px-3 text-xs font-semibold text-[#4F4841] outline-none focus:border-primary-500";

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 text-[#221E1A] md:px-8 md:py-9">
      <AdminPageHeader
        eyebrow="Membership"
        title="Applications"
        description="Search, filter, and review membership applications."
      />

      <section className="mt-8 overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_8px_25px_rgba(66,48,31,0.05)]">
        <div className="flex flex-col gap-4 border-b border-[#E8DED2] p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A7E72]"
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search name, email, username, reference, or grade..."
              className="h-11 w-full rounded-xl border border-[#D9CDBE] bg-white pl-10 pr-10 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7E72]"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter application status"
              value={filters.status}
              onChange={(event) => {
                setFilters((value) => ({
                  ...value,
                  status: event.target.value as AdminApplicationQuery["status"],
                }));
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
            </select>
            <select
              aria-label="Filter membership grade"
              value={filters.grade}
              onChange={(event) => {
                setFilters((value) => ({
                  ...value,
                  grade: event.target.value as AdminApplicationQuery["grade"],
                }));
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">All membership grades</option>
              <option value="AffIPC">AffIPC</option>
              <option value="MIPC">MIPC</option>
              <option value="AFIPC_L3">AFIPC L3</option>
              <option value="AFIPC_L4">AFIPC L4</option>
              <option value="FIPC">FIPC</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-[#E8DED2] bg-[#F7F2EB] px-5 py-3 text-xs text-[#746A60]">
          <span>
            <strong className="text-[#2D2823]">{result?.count || 0}</strong>{" "}
            matching applications
          </span>
          {isLoading && (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle size={14} className="animate-spin" />
              Loading
            </span>
          )}
        </div>

        {!isLoading && !result?.results.length ? (
          <div className="p-6">
            <EmptyState>No applications match the current search and filters.</EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-[#ECE2D6] text-[10px] uppercase tracking-wider text-[#766C62]">
                <tr>
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-5 py-3.5">Applicant</th>
                  <th className="px-5 py-3.5">Grade</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Submitted</th>
                  <th className="sticky right-0 bg-[#ECE2D6] px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DED2]">
                {result?.results.map((item) => (
                  <tr key={item.id} className="group transition-colors hover:bg-[#FAF5EE]">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-primary-800">{item.reference}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{item.name}</p>
                      <p className="mt-1 text-xs text-[#8A7E72]">{item.email}</p>
                    </td>
                    <td className="px-5 py-4 text-[#554E47]">{item.grade}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                      {item.approved_user_email && (
                        <p className="mt-1.5 max-w-44 truncate text-[10px] font-semibold text-[#6F665D]" title={item.approved_user_email}>
                          {item.approved_user_email}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#756B61]">{formatDate(item.submitted_at)}</td>
                    <td className="sticky right-0 bg-[#FFFDF9] px-5 py-4 transition-colors group-hover:bg-[#FAF5EE]">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/applications/${item.id}`}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-[#D8CCBD] bg-white text-[#554E47] shadow-sm transition hover:border-primary-500 hover:bg-primary-100 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                          aria-label={`View application ${item.reference}`}
                          title="View application"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setEditingApplication(item)}
                          disabled={item.status === "approved"}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-[#D8CCBD] bg-white text-[#554E47] shadow-sm transition hover:border-primary-500 hover:bg-primary-500 hover:text-[#0B0B0B] focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:cursor-not-allowed disabled:bg-[#F1ECE5] disabled:text-[#A89E93] disabled:shadow-none"
                          aria-label={item.status === "approved" ? `Application ${item.reference} status is locked` : `Edit status for application ${item.reference}`}
                          title={item.status === "approved" ? "This application has been approved and its status can no longer be changed." : "Edit status"}
                        >
                          {item.status === "approved" ? <LockKeyhole size={15} /> : <Pencil size={15} />}
                        </button>
                      </div>
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
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={!result?.previous || isLoading}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D4C6B5] px-3 text-xs font-bold disabled:opacity-40"
            >
              <ChevronLeft size={15} /> Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => value + 1)}
              disabled={!result?.next || isLoading}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D4C6B5] px-3 text-xs font-bold disabled:opacity-40"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      <ApplicationStatusModal
        application={editingApplication}
        isSaving={isSaving}
        onClose={() => {
          if (!isSaving) setEditingApplication(null);
        }}
        onSave={saveStatus}
      />
    </div>
  );
}
