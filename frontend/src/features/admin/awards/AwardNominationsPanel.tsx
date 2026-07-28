import { CheckCircle2, Eye, LoaderCircle, Search, X, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { adminApi } from "@/features/admin/adminApi";
import { EmptyState, StatusBadge } from "@/features/admin/components/AdminPage";
import type { AdminAwardNomination, AwardNominationStatus } from "@/features/admin/types";
import { notifications } from "@/lib/notifications";

export default function AwardNominationsPanel() {
  const [items, setItems] = useState<AdminAwardNomination[] | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState<AdminAwardNomination | null>(null);
  const [updating, setUpdating] = useState("");

  const load = useCallback(async () => {
    try {
      setItems(await adminApi.awardNominations());
    } catch (error) {
      setItems([]);
      notifications.error(error instanceof Error ? error.message : "Award nominations could not be loaded.");
    }
  }, []);

  useEffect(() => {
    void load();
    const refresh = () => { if (document.visibilityState === "visible") void load(); };
    const interval = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (items ?? []).filter((item) => {
      const matchesSearch = !term || [
        item.programme_title, item.applicant_name, item.applicant_email,
        item.nominee_name, item.nominee_email,
      ].some((value) => value.toLowerCase().includes(term));
      return matchesSearch && (!status || item.status === status);
    });
  }, [items, search, status]);

  async function changeStatus(item: AdminAwardNomination, next: AwardNominationStatus) {
    setUpdating(item.public_id);
    try {
      const updated = await adminApi.updateAwardNominationStatus(item.public_id, next);
      setItems((current) => current?.map((entry) => entry.public_id === updated.public_id ? updated : entry) ?? [updated]);
      setSelected((current) => current?.public_id === updated.public_id ? updated : current);
      notifications.success(`Nomination marked as ${updated.status_label.toLowerCase()}.`);
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Nomination status could not be updated.");
    } finally {
      setUpdating("");
    }
  }

  if (items === null) return <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin text-primary-700" /></div>;

  return (
    <>
      <section className="mt-6 overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#F7F0E7] shadow-[0_8px_25px_rgba(66,48,31,0.06)]">
        <div className="grid gap-3 border-b border-[#DED2C3] bg-[#FFFDF9] p-4 md:grid-cols-[minmax(240px,1fr)_220px]">
          <label className="relative"><span className="sr-only">Search nominations</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8178]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search applicant, nominee or award…" className="h-11 w-full rounded-xl border border-[#D8CCBD] bg-white pl-10 pr-4 text-sm outline-none focus:border-primary-500" /></label>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-xl border border-[#D8CCBD] bg-white px-3 text-sm outline-none focus:border-primary-500" aria-label="Filter nomination status">
            <option value="">All statuses</option>
            <option value="draft">Draft</option><option value="submitted">Submitted</option>
            <option value="under_review">Under review</option><option value="more_info_required">More information required</option>
            <option value="approved">Approved</option><option value="rejected">Rejected</option><option value="withdrawn">Withdrawn</option>
          </select>
        </div>
        {filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-[#EEE4D7] text-[10px] uppercase tracking-wider text-[#756B61]"><tr><th className="px-5 py-3">Applicant</th><th className="px-5 py-3">Award</th><th className="px-5 py-3">Nominee</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#E5DACD] bg-[#FFFDF9]">{filtered.map((item) => { const reviewable = ["submitted", "under_review", "more_info_required"].includes(item.status); return <tr key={item.public_id} className="align-top"><td className="px-5 py-4"><p className="font-bold text-[#202A38]">{item.applicant_name || "IPC user"}</p><p className="mt-1 text-xs text-[#756B61]">{item.applicant_email}</p></td><td className="px-5 py-4 font-semibold text-[#202A38]">{item.programme_title}</td><td className="px-5 py-4"><p>{item.nominee_name}</p><p className="mt-1 text-xs capitalize text-[#756B61]">{item.nominee_type} nomination</p></td><td className="px-5 py-4 text-[#655D55]">{item.submitted_at ? new Date(item.submitted_at).toLocaleDateString() : "Draft"}</td><td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => setSelected(item)} className="grid h-9 w-9 place-items-center rounded-lg border border-[#D8CCBD] hover:bg-[#F4ECE1]" aria-label="View nomination"><Eye size={16} /></button><button disabled={updating === item.public_id || !reviewable} onClick={() => void changeStatus(item, "approved")} className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-700/20 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40" aria-label="Approve nomination"><CheckCircle2 size={17} /></button><button disabled={updating === item.public_id || !reviewable} onClick={() => void changeStatus(item, "rejected")} className="grid h-9 w-9 place-items-center rounded-lg border border-red-700/20 text-red-700 hover:bg-red-50 disabled:opacity-40" aria-label="Reject nomination"><XCircle size={17} /></button></div></td></tr>; })}</tbody></table></div> : <div className="p-5"><EmptyState>No award nominations match the selected filters.</EmptyState></div>}
      </section>
      {selected && <NominationModal item={selected} busy={updating === selected.public_id} onClose={() => setSelected(null)} onStatus={(next) => void changeStatus(selected, next)} />}
    </>
  );
}

function NominationModal({ item, busy, onClose, onStatus }: { item: AdminAwardNomination; busy: boolean; onClose: () => void; onStatus: (status: AwardNominationStatus) => void }) {
  const reviewable = ["submitted", "under_review", "more_info_required"].includes(item.status);
  return <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true"><div className="my-8 w-full max-w-3xl rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-primary-800">Award nomination</p><h2 className="mt-2 text-2xl font-black text-[#202A38]">{item.programme_title}</h2></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#F4ECE1]" aria-label="Close"><X size={18} /></button></div><div className="mt-6 grid gap-4 rounded-xl border border-[#E2D6C8] bg-white p-5 sm:grid-cols-2"><Detail label="Applicant" value={`${item.applicant_name} · ${item.applicant_email}`} /><Detail label="Nominee" value={`${item.nominee_name}${item.nominee_email ? ` · ${item.nominee_email}` : ""}`} /><Detail label="Type" value={item.nominee_type} /><div><p className="text-[10px] font-bold uppercase tracking-wider text-[#756B61]">Status</p><div className="mt-2"><StatusBadge status={item.status} /></div></div><Detail label="Organisation" value={String(item.responses.organisation || "")} /><Detail label="Role" value={String(item.responses.nominee_role || "")} /></div><div className="mt-5"><p className="text-xs font-black uppercase tracking-wider text-[#756B61]">Contribution</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#4F4943]">{String(item.responses.contribution || "—")}</p></div><div className="mt-5"><p className="text-xs font-black uppercase tracking-wider text-[#756B61]">Impact</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#4F4943]">{String(item.responses.impact || "—")}</p></div><div className="mt-5"><p className="text-xs font-black uppercase tracking-wider text-[#756B61]">Nomination statement</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#4F4943]">{item.statement || "No statement provided."}</p></div><div className="mt-5"><p className="text-xs font-black uppercase tracking-wider text-[#756B61]">Evidence</p><div className="mt-2 flex flex-wrap gap-2">{item.documents.length ? item.documents.map((document) => <a key={document.id} href={document.download_url} className="rounded-lg border border-[#D4C6B5] bg-white px-3 py-2 text-xs font-bold text-primary-800">{document.name}</a>) : <span className="text-sm text-[#756B61]">No evidence uploaded.</span>}</div></div>{reviewable && <div className="mt-7 flex flex-wrap justify-end gap-2"><button disabled={busy} onClick={() => onStatus("under_review")} className="rounded-xl border border-[#D4C6B5] px-4 py-2.5 text-xs font-black">Mark under review</button><button disabled={busy} onClick={() => onStatus("more_info_required")} className="rounded-xl border border-amber-600/30 bg-amber-50 px-4 py-2.5 text-xs font-black text-amber-800">Request information</button><button disabled={busy} onClick={() => onStatus("rejected")} className="rounded-xl border border-red-700/20 bg-red-50 px-4 py-2.5 text-xs font-black text-red-700">Reject</button><button disabled={busy} onClick={() => onStatus("approved")} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-black text-white">Approve</button></div>}</div></div>;
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#756B61]">{label}</p><p className="mt-1 text-sm font-semibold capitalize text-[#202A38]">{value || "—"}</p></div>;
}
