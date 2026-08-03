import { LoaderCircle, Pencil, Search, UserCheck, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { adminApi } from "@/features/admin/adminApi";
import { AdminPageHeader, AdminPageState, EmptyState, StatusBadge } from "@/features/admin/components/AdminPage";
import type { AdminClubMembership } from "@/features/admin/types";
import { notifications } from "@/lib/notifications";

export default function AdminClubRequestsPage() {
  const [requests, setRequests] = useState<AdminClubMembership[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("pending");
  const [busy, setBusy] = useState<number | null>(null);
  const [selected, setSelected] = useState<AdminClubMembership | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setRequests(await adminApi.clubMemberships(signal));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).catch((reason: unknown) => {
      if (!controller.signal.aborted) {
        notifications.error(reason instanceof Error ? reason.message : "Club requests could not be loaded.");
        setRequests([]);
      }
    });
    return () => controller.abort();
  }, [load]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return (requests || []).filter((request) =>
      (!status || request.status === status)
      && (!search || [request.applicant_name, request.applicant_email, request.club_name].some((value) => value.toLowerCase().includes(search))),
    );
  }, [query, requests, status]);

  async function decide(request: AdminClubMembership, nextStatus: "active" | "rejected") {
    setBusy(request.id);
    try {
      await adminApi.updateClubMembership(request.id, nextStatus);
      await load();
      notifications.success(nextStatus === "active" ? "Club membership approved." : "Club membership rejected.");
      setSelected(null);
    } catch (reason) {
      notifications.error(reason instanceof Error ? reason.message : "Club request could not be updated.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AdminPageState isLoading={requests === null} hasData={requests !== null}>
      <AdminPageHeader
        eyebrow="Regional communities"
        title="Club membership requests"
        description="Review member requests and control access to each private Club Member Hub."
      />

      <section className="mt-8 overflow-hidden rounded-2xl border border-[#DDD1C2] bg-[#FFFDF9] shadow-sm">
        <div className="grid gap-3 border-b border-[#E5DACD] p-4 md:grid-cols-[1fr_14rem]">
          <label className="relative"><Search className="absolute left-3 top-3 text-[#8A7F75]" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 w-full rounded-xl border border-[#D9CDBE] bg-white pl-10 pr-3 text-sm outline-none focus:border-primary-500" placeholder="Search member, email or club…" /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-xl border border-[#D9CDBE] bg-white px-3 text-sm outline-none focus:border-primary-500">
            <option value="pending">Pending requests</option>
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {filtered.length ? (
          <div className="divide-y divide-[#E8DED2]">
            {filtered.map((request) => (
              <article key={request.id} className="grid gap-5 p-5 lg:grid-cols-[1.1fr_1fr_10rem_auto] lg:items-center">
                <div><p className="font-black">{request.applicant_name}</p><p className="mt-1 text-xs text-[#776D64]">{request.applicant_email}</p></div>
                <div><p className="text-[9px] font-black uppercase tracking-[.14em] text-primary-800">Requested club</p><p className="mt-2 text-sm font-bold">{request.club_name}</p><p className="mt-1 text-[10px] text-[#8A7F75]">{new Date(request.created_at).toLocaleString()}</p></div>
                <StatusBadge status={request.status === "rejected" ? "refused" : request.status} />
                <button type="button" onClick={() => setSelected(request)} title="Edit request status" className="grid h-11 w-11 place-items-center rounded-xl border border-[#D8CCBD] bg-white text-[#5F574F] hover:bg-[#F4ECE1]"><Pencil size={18} /></button>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-5"><EmptyState><UserCheck className="mx-auto mb-3 text-primary-700" />No club requests match the current filters.</EmptyState></div>
        )}
      </section>
      {selected && (
        <ClubStatusModal
          request={selected}
          saving={busy === selected.id}
          onClose={() => setSelected(null)}
          onSave={(nextStatus) => void decide(selected, nextStatus)}
        />
      )}
    </AdminPageState>
  );
}

function ClubStatusModal({
  request,
  saving,
  onClose,
  onSave,
}: {
  request: AdminClubMembership;
  saving: boolean;
  onClose: () => void;
  onSave: (status: "active" | "rejected") => void;
}) {
  const [nextStatus, setNextStatus] = useState<"active" | "rejected">(
    request.status === "rejected" ? "rejected" : "active",
  );

  return (
    <div className="fixed inset-0 z-[130] grid place-items-center overflow-y-auto bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="club-status-title" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section className="my-8 w-full max-w-[690px] overflow-hidden rounded-[22px] border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_28px_80px_rgba(0,0,0,.28)]">
        <header className="flex items-start justify-between gap-3 border-b border-[#E5DACD] px-4 py-5 sm:px-8 sm:py-7">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[.24em] text-primary-800">Club membership</p>
            <h2 id="club-status-title" className="mt-2 text-2xl font-black text-[#1E1B18]">Edit request status</h2>
          </div>
          <button type="button" disabled={saving} onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-[#F2EADF] disabled:opacity-50" aria-label="Close"><X size={21} /></button>
        </header>

        <div className="px-4 py-5 sm:px-8 sm:py-8">
          <div className="grid gap-5 rounded-2xl border border-[#DED2C3] bg-[#F7F1E9] p-4 sm:grid-cols-2 sm:gap-7 sm:p-6">
            <ModalDetail label="Applicant" value={request.applicant_name} secondary={request.applicant_email} />
            <ModalDetail label="Requested club" value={request.club_name} />
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#82786E]">Current status</p>
              <div className="mt-3"><StatusBadge status={request.status === "rejected" ? "refused" : request.status} /></div>
            </div>
            <ModalDetail label="Requested on" value={new Date(request.created_at).toLocaleDateString("en-GB", { dateStyle: "medium" })} />
          </div>

          <label className="mt-7 block">
            <span className="text-sm font-black uppercase tracking-wide text-[#6D655E]">New status</span>
            <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value as "active" | "rejected")} className="mt-3 h-16 w-full rounded-2xl border border-primary-500 bg-white px-5 text-lg font-semibold text-[#4F4842] outline-none ring-2 ring-primary-200">
              <option value="active">Approved</option>
              <option value="rejected">Refused</option>
            </select>
          </label>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-[#E5DACD] px-4 py-4 sm:flex-row sm:justify-end sm:px-8 sm:py-6">
          <button type="button" disabled={saving} onClick={onClose} className="h-12 w-full rounded-2xl border border-[#D7C9B8] bg-white px-5 text-sm font-black text-[#332E29] hover:bg-[#F7F1E9] disabled:opacity-50 sm:h-14 sm:w-auto sm:px-6">Cancel</button>
          <button type="button" disabled={saving || nextStatus === request.status} onClick={() => onSave(nextStatus)} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary-500 px-5 text-sm font-black text-[#171411] hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:w-auto sm:min-w-40 sm:px-7">{saving && <LoaderCircle className="animate-spin" size={17} />}{saving ? "Saving…" : "Save changes"}</button>
        </footer>
      </section>
    </div>
  );
}

function ModalDetail({ label, value, secondary }: { label: string; value: string; secondary?: string }) {
  return <div><p className="text-xs font-black uppercase tracking-wide text-[#82786E]">{label}</p><p className="mt-2 text-base font-black text-[#2D2925]">{value}</p>{secondary && <p className="mt-1 text-xs text-[#776D64]">{secondary}</p>}</div>;
}
