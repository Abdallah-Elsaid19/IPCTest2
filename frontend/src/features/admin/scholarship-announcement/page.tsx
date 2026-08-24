import {
  CalendarClock,
  ExternalLink,
  FileJson,
  LoaderCircle,
  Megaphone,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { AdminPageHeader, AdminPageState, EmptyState } from "@/features/admin/components/AdminPage";
import {
  scholarshipAnnouncementAdminApi,
  type ScholarshipAnnouncementContent,
  type ScholarshipWinner,
  type ScholarshipWinnerPayload,
} from "@/features/admin/scholarship-announcement/api";
import { publishContentUpdate } from "@/lib/contentSync";
import { notifications } from "@/lib/notifications";

type Tab = "content" | "winners";

const inputClass = "mt-2 h-11 w-full rounded-xl border border-[#D8CCBD] bg-white px-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10";
const textareaClass = "mt-2 min-h-28 w-full resize-y rounded-xl border border-[#D8CCBD] bg-white px-3 py-3 text-sm leading-6 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10";

const londonFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function londonParts(date: Date) {
  return Object.fromEntries(
    londonFormatter.formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  ) as Record<string, number>;
}

function toLondonDateTimeInput(iso: string) {
  const parts = londonParts(new Date(iso));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

function londonDateTimeToIso(value: string) {
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const targetWallClock = Date.UTC(year, month - 1, day, hour, minute);
  const firstPass = londonParts(new Date(targetWallClock));
  const firstPassWallClock = Date.UTC(
    firstPass.year,
    firstPass.month - 1,
    firstPass.day,
    firstPass.hour,
    firstPass.minute,
  );
  return new Date(targetWallClock - (firstPassWallClock - targetWallClock)).toISOString();
}

const emptyWinner = (): ScholarshipWinnerPayload => ({
  name: "",
  award: "",
  country: "",
  modules: [],
  category: "IPC Scholarship Fund",
  award_year: 2026,
  award_round: 2,
  photo_url: "",
  display_order: 0,
  is_published: true,
});

export default function AdminScholarshipAnnouncementPage() {
  const [activeTab, setActiveTab] = useState<Tab>("content");
  const [content, setContent] = useState<ScholarshipAnnouncementContent | null>(null);
  const [draft, setDraft] = useState<ScholarshipAnnouncementContent | null>(null);
  const [winners, setWinners] = useState<ScholarshipWinner[] | null>(null);
  const [editingWinner, setEditingWinner] = useState<ScholarshipWinner | null>(null);
  const [winnerDraft, setWinnerDraft] = useState<ScholarshipWinnerPayload>(emptyWinner);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScholarshipWinner | null>(null);
  const [search, setSearch] = useState("");
  const [roundFilter, setRoundFilter] = useState("");
  const [publishedFilter, setPublishedFilter] = useState("");
  const [isSavingContent, setIsSavingContent] = useState(false);
  const [isSavingWinner, setIsSavingWinner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const saveLock = useRef(false);

  const loadData = useCallback(async () => {
    const [contentResult, winnerResult] = await Promise.allSettled([
      scholarshipAnnouncementAdminApi.content(),
      scholarshipAnnouncementAdminApi.winners(),
    ]);
    if (contentResult.status === "fulfilled") {
      setContent(contentResult.value);
      setDraft(contentResult.value);
    } else {
      setContent(null);
      notifications.error(contentResult.reason instanceof Error ? contentResult.reason.message : "Announcement content could not be loaded.");
    }
    if (winnerResult.status === "fulfilled") setWinners(winnerResult.value);
    else {
      setWinners([]);
      notifications.error(winnerResult.reason instanceof Error ? winnerResult.reason.message : "Winners could not be loaded.");
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const updateDraft = <K extends keyof ScholarshipAnnouncementContent>(key: K, value: ScholarshipAnnouncementContent[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
  };

  const saveContent = async () => {
    if (!draft || saveLock.current) return;
    saveLock.current = true;
    setIsSavingContent(true);
    try {
      const saved = await scholarshipAnnouncementAdminApi.updateContent(draft);
      setContent(saved);
      setDraft(saved);
      publishContentUpdate("scholarships");
      notifications.success("Announcement timer and content updated successfully.");
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Announcement content could not be saved.");
    } finally {
      saveLock.current = false;
      setIsSavingContent(false);
    }
  };

  const openCreateWinner = () => {
    const nextOrder = Math.max(0, ...(winners ?? []).filter((winner) => winner.award_round === 2).map((winner) => winner.display_order)) + 1;
    setEditingWinner(null);
    setWinnerDraft({ ...emptyWinner(), display_order: nextOrder });
    setWinnerModalOpen(true);
  };

  const openEditWinner = (winner: ScholarshipWinner) => {
    setEditingWinner(winner);
    setWinnerDraft({
      name: winner.name,
      award: winner.award,
      country: winner.country,
      modules: winner.modules,
      category: winner.category,
      award_year: winner.award_year,
      award_round: winner.award_round,
      photo_url: winner.photo_url,
      display_order: winner.display_order,
      is_published: winner.is_published,
    });
    setWinnerModalOpen(true);
  };

  const saveWinner = async () => {
    if (!winnerDraft.name.trim() || saveLock.current) {
      if (!winnerDraft.name.trim()) notifications.error("Winner name is required.");
      return;
    }
    saveLock.current = true;
    setIsSavingWinner(true);
    try {
      const saved = editingWinner
        ? await scholarshipAnnouncementAdminApi.updateWinner(editingWinner.id, winnerDraft)
        : await scholarshipAnnouncementAdminApi.createWinner(winnerDraft);
      setWinners((current) => (editingWinner
        ? (current ?? []).map((winner) => winner.id === saved.id ? saved : winner)
        : [...(current ?? []), saved]
      ).sort((a, b) => a.award_round - b.award_round || a.display_order - b.display_order || a.name.localeCompare(b.name)));
      setWinnerModalOpen(false);
      setEditingWinner(null);
      publishContentUpdate("scholarships");
      notifications.success(editingWinner ? "Winner updated successfully." : "Winner added successfully.");
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Winner could not be saved.");
    } finally {
      saveLock.current = false;
      setIsSavingWinner(false);
    }
  };

  const deleteWinner = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await scholarshipAnnouncementAdminApi.deleteWinner(deleteTarget.id);
      setWinners((current) => (current ?? []).filter((winner) => winner.id !== deleteTarget.id));
      setDeleteTarget(null);
      publishContentUpdate("scholarships");
      notifications.success("Winner removed successfully.");
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Winner could not be removed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredWinners = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (winners ?? []).filter((winner) => {
      const matchesSearch = !query || [winner.name, winner.award, winner.country, winner.application_reference, ...winner.modules]
        .some((value) => value.toLowerCase().includes(query));
      const matchesRound = !roundFilter || String(winner.award_round) === roundFilter;
      const matchesPublished = !publishedFilter || String(winner.is_published) === publishedFilter;
      return matchesSearch && matchesRound && matchesPublished;
    });
  }, [publishedFilter, roundFilter, search, winners]);

  const isLoading = content === null || winners === null;
  return (
    <AdminPageState isLoading={isLoading} hasData={!isLoading}>
      {draft && winners && (
        <>
          <AdminPageHeader
            eyebrow="Scholarship publishing"
            title="Announcement & winners"
            description="Control the public countdown, announcement copy and the editable winners register from one place."
            action={<div className="flex flex-wrap gap-2">
              <Link to="/admin/content" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-black text-primary-800 shadow-sm">
                <FileJson size={16} /> All Content
              </Link>
              <Link to="/scholarships/announcement" target="_blank" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-black text-primary-800 shadow-sm">
                <ExternalLink size={16} /> View public page
              </Link>
            </div>}
          />

          <div className="mt-7 inline-flex rounded-xl border border-[#D8CCBD] bg-[#E9DED0] p-1" role="tablist" aria-label="Announcement management">
            <TabButton active={activeTab === "content"} onClick={() => setActiveTab("content")} icon={<CalendarClock size={15} />} label="Content & timer" />
            <TabButton active={activeTab === "winners"} onClick={() => setActiveTab("winners")} icon={<Trophy size={15} />} label={`Celebration page (${winners.length})`} />
          </div>

          {activeTab === "content" && (
            <form className="mt-6 space-y-6" onSubmit={(event) => { event.preventDefault(); void saveContent(); }}>
              <Panel title="Timer & gateway" description="The time is entered and displayed in Europe/London time.">
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  <Field label="Announcement date and time (London)">
                    <input type="datetime-local" required value={toLondonDateTimeInput(draft.announcement_at)} onChange={(event) => updateDraft("announcement_at", londonDateTimeToIso(event.target.value))} className={inputClass} />
                  </Field>
                  <Field label="Announcement round">
                    <select value={draft.announcement_round} onChange={(event) => updateDraft("announcement_round", Number(event.target.value) as 1 | 2)} className={inputClass}><option value={1}>Round 1</option><option value={2}>Round 2</option></select>
                  </Field>
                  <Toggle label="Countdown and timed release active" checked={draft.is_active} onChange={(checked) => updateDraft("is_active", checked)} />
                  <Field label="Fund label"><input required value={draft.fund_label} onChange={(event) => updateDraft("fund_label", event.target.value)} className={inputClass} /></Field>
                  <Field label="Gateway button label"><input required value={draft.announcement_button_label} onChange={(event) => updateDraft("announcement_button_label", event.target.value)} className={inputClass} /></Field>
                </div>
              </Panel>

              <Panel title="Countdown content" description="Copy shown before the announcement time arrives.">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Eyebrow"><input required value={draft.countdown_eyebrow} onChange={(event) => updateDraft("countdown_eyebrow", event.target.value)} className={inputClass} /></Field>
                  <Field label="Title"><input required value={draft.countdown_title} onChange={(event) => updateDraft("countdown_title", event.target.value)} className={inputClass} /></Field>
                  <Field label="Description" wide><textarea required value={draft.countdown_description} onChange={(event) => updateDraft("countdown_description", event.target.value)} className={textareaClass} /></Field>
                  <Field label="Reminder button"><input required value={draft.reminder_button_label} onChange={(event) => updateDraft("reminder_button_label", event.target.value)} className={inputClass} /></Field>
                  <Field label="Reminder disclaimer"><textarea required value={draft.reminder_disclaimer} onChange={(event) => updateDraft("reminder_disclaimer", event.target.value)} className={textareaClass} /></Field>
                </div>
              </Panel>

              <Panel title="Search preview" description="Title and description used by search engines and link previews.">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="SEO title"><input required value={draft.seo_title} onChange={(event) => updateDraft("seo_title", event.target.value)} className={inputClass} /></Field>
                  <Field label="SEO description"><textarea required value={draft.seo_description} onChange={(event) => updateDraft("seo_description", event.target.value)} className={textareaClass} /></Field>
                </div>
              </Panel>

              <div className="sticky bottom-5 flex justify-end gap-3 rounded-2xl border border-[#D8CCBD] bg-[#FFFDF9]/95 p-4 shadow-xl backdrop-blur">
                <button type="button" onClick={() => setDraft(content)} disabled={isSavingContent} className="h-11 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-bold">Discard changes</button>
                <button type="submit" disabled={isSavingContent} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-6 text-xs font-black text-[#0B0B0B] disabled:opacity-60">
                  {isSavingContent ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />} {isSavingContent ? "Saving..." : "Save & publish"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "winners" && (
            <div className="mt-6 space-y-6">
              <CelebrationPreview content={draft} winners={winners} />

              <form className="space-y-6" onSubmit={(event) => { event.preventDefault(); void saveContent(); }}>
                <Panel title="Celebration page content" description="Edit the copy used by the gold-ribbon recipients page. The preview above updates while you type.">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Celebration eyebrow"><input required value={draft.recipients_eyebrow} onChange={(event) => updateDraft("recipients_eyebrow", event.target.value)} className={inputClass} /></Field>
                    <Field label="Celebration title"><input required value={draft.recipients_title} onChange={(event) => updateDraft("recipients_title", event.target.value)} className={inputClass} /></Field>
                    <Field label="Introduction"><textarea required value={draft.recipients_description} onChange={(event) => updateDraft("recipients_description", event.target.value)} className={textareaClass} /></Field>
                    <Field label="Highlighted message"><textarea required value={draft.recipients_highlight} onChange={(event) => updateDraft("recipients_highlight", event.target.value)} className={textareaClass} /></Field>
                    <Field label="Previous round button label"><input required value={draft.previous_round_button_label} onChange={(event) => updateDraft("previous_round_button_label", event.target.value)} className={inputClass} /></Field>
                    <Field label="Apply button label"><input required value={draft.apply_button_label} onChange={(event) => updateDraft("apply_button_label", event.target.value)} className={inputClass} /></Field>
                    <Field label="Empty winners title"><input required value={draft.empty_title} onChange={(event) => updateDraft("empty_title", event.target.value)} className={inputClass} /></Field>
                    <Field label="Empty winners description"><textarea required value={draft.empty_description} onChange={(event) => updateDraft("empty_description", event.target.value)} className={textareaClass} /></Field>
                    <Field label="Publication notice" wide><textarea required value={draft.publication_notice} onChange={(event) => updateDraft("publication_notice", event.target.value)} className={textareaClass} /></Field>
                  </div>
                </Panel>

                <Panel title="Official recipient register panel" description="Edit the right-hand panel shown beside the celebration hero. The date and recipient count remain automatic.">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Panel title"><input required value={draft.register_title} onChange={(event) => updateDraft("register_title", event.target.value)} className={inputClass} /></Field>
                    <Field label="Panel description"><textarea required value={draft.register_description} onChange={(event) => updateDraft("register_description", event.target.value)} className={textareaClass} /></Field>
                    <Field label="Announcement date label"><input required value={draft.register_date_label} onChange={(event) => updateDraft("register_date_label", event.target.value)} className={inputClass} /></Field>
                    <Field label="Academic intake label"><input required value={draft.register_intake_label} onChange={(event) => updateDraft("register_intake_label", event.target.value)} className={inputClass} /></Field>
                    <Field label="Academic intake value"><input required value={draft.register_intake_value} onChange={(event) => updateDraft("register_intake_value", event.target.value)} className={inputClass} /></Field>
                    <Field label="Total recipients label"><input required value={draft.register_total_label} onChange={(event) => updateDraft("register_total_label", event.target.value)} className={inputClass} /></Field>
                    <Field label="Record status label"><input required value={draft.register_status_label} onChange={(event) => updateDraft("register_status_label", event.target.value)} className={inputClass} /></Field>
                    <Field label="Record status value"><input required value={draft.register_status_value} onChange={(event) => updateDraft("register_status_value", event.target.value)} className={inputClass} /></Field>
                  </div>
                </Panel>

                <div className="sticky bottom-5 flex flex-wrap justify-end gap-3 rounded-2xl border border-[#D8CCBD] bg-[#FFFDF9]/95 p-4 shadow-xl backdrop-blur">
                  <button type="button" onClick={() => setDraft(content)} disabled={isSavingContent} className="h-11 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-bold">Discard changes</button>
                  <button type="submit" disabled={isSavingContent} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-6 text-xs font-black text-[#0B0B0B] disabled:opacity-60">
                    {isSavingContent ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />} {isSavingContent ? "Saving..." : "Save celebration page"}
                  </button>
                </div>
              </form>

            <section className="mt-6 overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_8px_25px_rgba(66,48,31,0.06)]">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DED2C3] p-5">
                <div><h2 className="text-xl font-black">Winners table</h2><p className="mt-1 text-sm text-[#756B61]">Published rows appear publicly when their round is released.</p></div>
                <button type="button" onClick={openCreateWinner} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-black text-[#0B0B0B]"><Plus size={16} /> Add winner</button>
              </div>
              <div className="grid gap-3 border-b border-[#DED2C3] bg-[#F7F0E7] p-4 md:grid-cols-[minmax(240px,1fr)_170px_170px]">
                <label className="relative"><span className="sr-only">Search winners</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8178]" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search winners..." className="h-11 w-full rounded-xl border border-[#D8CCBD] bg-white pl-10 pr-4 text-sm outline-none focus:border-primary-500" /></label>
                <select aria-label="Filter by round" value={roundFilter} onChange={(event) => setRoundFilter(event.target.value)} className="h-11 rounded-xl border border-[#D8CCBD] bg-white px-3 text-sm"><option value="">All rounds</option><option value="1">Round 1</option><option value="2">Round 2</option></select>
                <select aria-label="Filter by publication" value={publishedFilter} onChange={(event) => setPublishedFilter(event.target.value)} className="h-11 rounded-xl border border-[#D8CCBD] bg-white px-3 text-sm"><option value="">All visibility</option><option value="true">Published</option><option value="false">Hidden</option></select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left text-sm">
                  <thead className="bg-[#F1E8DC] text-[10px] font-black uppercase tracking-[0.16em] text-[#6B6259]"><tr><th className="px-5 py-4">Winner</th><th className="px-4 py-4">Round</th><th className="px-4 py-4">Award / modules</th><th className="px-4 py-4">Country</th><th className="px-4 py-4">Order</th><th className="px-4 py-4">Visibility</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
                  <tbody className="divide-y divide-[#E4D9CB]">
                    {filteredWinners.map((winner) => (
                      <tr key={winner.id} className="hover:bg-[#FFF9F1]">
                        <td className="px-5 py-4"><p className="font-bold text-[#201C18]">{winner.name}</p><p className="mt-1 text-xs text-[#81776D]">{winner.application_reference || "Manual entry"}</p></td>
                        <td className="px-4 py-4"><span className="rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-black uppercase text-primary-800">Round {winner.award_round}</span></td>
                        <td className="max-w-[320px] px-4 py-4"><p className="line-clamp-2 font-medium">{winner.award || "—"}</p>{winner.modules.length > 0 && <p className="mt-1 line-clamp-1 text-xs text-[#81776D]">{winner.modules.join(", ")}</p>}</td>
                        <td className="px-4 py-4">{winner.country || "—"}</td>
                        <td className="px-4 py-4 font-mono text-xs">{winner.display_order}</td>
                        <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${winner.is_published ? "bg-emerald-100 text-emerald-800" : "bg-[#E9DED0] text-[#6B6259]"}`}>{winner.is_published ? "Published" : "Hidden"}</span></td>
                        <td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEditWinner(winner)} className="grid h-9 w-9 place-items-center rounded-lg border border-[#D4C6B5] bg-white text-primary-800" aria-label={`Edit ${winner.name}`}><Pencil size={15} /></button><button type="button" onClick={() => setDeleteTarget(winner)} className="grid h-9 w-9 place-items-center rounded-lg border border-red-200 bg-red-50 text-red-700" aria-label={`Delete ${winner.name}`}><Trash2 size={15} /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredWinners.length === 0 && <div className="p-5"><EmptyState>No winners match the selected filters.</EmptyState></div>}
            </section>
            </div>
          )}

          {winnerModalOpen && <WinnerModal winner={editingWinner} draft={winnerDraft} onChange={setWinnerDraft} onClose={() => !isSavingWinner && setWinnerModalOpen(false)} onSave={() => void saveWinner()} isSaving={isSavingWinner} />}
          {deleteTarget && (
            <div className="fixed inset-0 z-[120] grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-winner-title">
              <div className="w-full max-w-md rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-6 shadow-2xl">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-100 text-red-700"><Trash2 size={20} /></span>
                <h2 id="delete-winner-title" className="mt-5 text-xl font-black">Remove this winner?</h2>
                <p className="mt-3 text-sm leading-6 text-[#655D55]">This permanently removes <strong>{deleteTarget.name}</strong> from the winners table. It does not delete the original bursary application.</p>
                <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={isDeleting} onClick={() => setDeleteTarget(null)} className="h-10 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold">Cancel</button><button type="button" disabled={isDeleting} onClick={() => void deleteWinner()} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white disabled:opacity-60">{isDeleting ? <LoaderCircle size={15} className="animate-spin" /> : <Trash2 size={15} />} {isDeleting ? "Removing..." : "Remove"}</button></div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminPageState>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-black transition ${active ? "bg-[#FFFDF9] text-primary-800 shadow-sm" : "text-[#756B61]"}`}>{icon}{label}</button>;
}

function CelebrationPreview({ content, winners }: { content: ScholarshipAnnouncementContent; winners: ScholarshipWinner[] }) {
  const publishedRoundWinners = winners.filter(
    (winner) => winner.is_published && winner.award_round === content.announcement_round,
  );
  const announcementDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  }).format(new Date(content.announcement_at));
  const previewWinners = [...winners]
    .filter((winner) => winner.is_published)
    .sort((left, right) => {
      const leftCurrent = left.award_round === content.announcement_round ? 0 : 1;
      const rightCurrent = right.award_round === content.announcement_round ? 0 : 1;
      return leftCurrent - rightCurrent || left.display_order - right.display_order;
    })
    .slice(0, 5);

  return (
    <section className="relative isolate overflow-hidden rounded-2xl border border-[#6F4A16] bg-[#060707] p-6 text-white shadow-[0_22px_60px_rgba(22,15,7,.25)] md:p-9">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_18%_0%,rgba(216,149,36,.2),transparent_31%),radial-gradient(circle_at_85%_100%,rgba(122,84,31,.15),transparent_34%)]" />
      <span className="pointer-events-none absolute -left-32 top-16 h-56 w-80 -rotate-12 rounded-[50%] border-[18px] border-[#D89524]/20" />
      <span className="pointer-events-none absolute -right-32 top-4 h-64 w-96 rotate-12 rounded-[50%] border-[15px] border-[#F2C567]/15" />
      {Array.from({ length: 18 }, (_, index) => (
        <span key={index} className="pointer-events-none absolute h-1.5 w-1.5 rotate-45 bg-primary-400/50" style={{ left: `${5 + ((index * 29) % 91)}%`, top: `${8 + ((index * 37) % 84)}%` }} />
      ))}

      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.25em] text-primary-400">{content.recipients_eyebrow}</p>
            <h2 className="mt-4 bg-gradient-to-b from-[#fff7e7] via-[#ffe2a0] to-[#dba13a] bg-clip-text font-heading text-4xl font-semibold leading-tight tracking-[-0.04em] text-transparent md:text-5xl">{content.recipients_title}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#CFC7BD]">{content.recipients_description}</p>
          </div>
          <div className="border border-primary-400/35 bg-primary-400/[.08] px-4 py-2 font-mono text-[9px] font-black uppercase tracking-[.2em] text-primary-300">Round {content.announcement_round} preview</div>
        </div>

        <div className="mt-6 max-w-3xl border border-primary-400/30 bg-black/45 px-5 py-4 text-sm leading-6 text-[#E2D9CD]">{content.recipients_highlight}</div>

        <aside className="relative mx-auto mt-8 max-w-xl overflow-hidden rounded-[1.5rem] border border-primary-400/45 bg-[linear-gradient(145deg,rgba(32,29,24,.95),rgba(8,9,9,.98))] p-6 text-center shadow-[0_24px_70px_rgba(0,0,0,.45)]">
          <div className="pointer-events-none absolute inset-3 rounded-[1.1rem] border border-primary-400/10" />
          <div className="relative mx-auto flex h-16 w-32 items-center justify-center" aria-hidden="true"><span className="absolute left-0 text-4xl text-primary-500/80">❧</span><span className="grid h-14 w-14 place-items-center rounded-full border-2 border-primary-400 bg-black font-heading text-base font-bold text-primary-200">IPC</span><span className="absolute right-0 -scale-x-100 text-4xl text-primary-500/80">❧</span></div>
          <h3 className="relative mt-4 font-heading text-3xl font-semibold leading-tight tracking-[-0.035em] text-white">{content.register_title}</h3>
          <p className="relative mx-auto mt-4 max-w-md text-xs leading-6 text-[#AAA198]">{content.register_description}</p>
          <dl className="relative mt-6 grid overflow-hidden rounded-xl border border-primary-400/30 sm:grid-cols-2">
            {[
              [content.register_date_label, announcementDate],
              [content.register_intake_label, content.register_intake_value],
              [content.register_total_label, `${publishedRoundWinners.length} recipients`],
              [content.register_status_label, content.register_status_value],
            ].map(([label, value]) => <div key={label} className="border-b border-primary-400/20 bg-black/35 p-4 text-left odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0"><dt className="font-mono text-[7px] font-black uppercase tracking-[.16em] text-primary-400">{label}</dt><dd className="mt-2 text-xs font-bold text-white">{value}</dd></div>)}
          </dl>
        </aside>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {previewWinners.length > 0 ? previewWinners.map((winner) => (
            <article key={winner.id} className="overflow-hidden border border-primary-400/30 bg-[#111317]">
              <WinnerPreviewPortrait winner={winner} />
              <div className="p-3"><h3 className="line-clamp-2 text-sm font-black">{winner.name}</h3><p className="mt-2 line-clamp-2 text-[10px] leading-4 text-primary-200">{winner.award || winner.modules.join(", ") || "IPC Scholarship Fund"}</p><p className="mt-2 font-mono text-[8px] uppercase tracking-[.12em] text-[#999188]">Round {winner.award_round}{winner.country ? ` · ${winner.country}` : ""}</p></div>
            </article>
          )) : (
            <div className="col-span-full border border-dashed border-primary-400/30 bg-white/[.03] p-8 text-center"><p className="font-heading text-xl text-primary-200">{content.empty_title}</p><p className="mt-2 text-xs text-[#AAA198]">{content.empty_description}</p></div>
          )}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <span className="bg-gradient-to-r from-[#F2C567] to-[#D99B2F] px-5 py-3 text-[10px] font-black uppercase tracking-[.12em] text-black">{content.apply_button_label}</span>
          <span className="border border-white/20 bg-white/[.04] px-5 py-3 text-[10px] font-bold uppercase tracking-[.12em]">{content.previous_round_button_label}</span>
        </div>
        <p className="mt-6 border-t border-white/10 pt-4 text-[10px] leading-5 text-[#938B82]">{content.publication_notice}</p>
      </div>
    </section>
  );
}

function WinnerPreviewPortrait({ winner }: { winner: ScholarshipWinner }) {
  const [imageFailed, setImageFailed] = useState(false);
  const linkedApplicationPhoto = winner.application_reference
    ? `/api/scholarship-announcement/recipients/${winner.id}/photo`
    : "";
  const imageUrl = winner.photo_url || linkedApplicationPhoto;
  const initials = winner.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="grid aspect-[4/3] place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(216,149,36,.22),transparent_55%),#171B22]">
      {imageUrl && !imageFailed ? (
        <img
          src={imageUrl}
          alt={winner.name}
          className="h-full w-full object-contain"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="grid h-16 w-16 place-items-center rounded-full border border-primary-400/35 bg-primary-400/10 font-heading text-xl font-bold text-primary-200">{initials || "IPC"}</span>
      )}
    </div>
  );
}

function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-5 shadow-[0_8px_25px_rgba(66,48,31,0.05)] md:p-6"><div className="mb-5 flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-800"><Megaphone size={18} /></span><div><h2 className="text-lg font-black">{title}</h2><p className="mt-1 text-sm text-[#756B61]">{description}</p></div></div>{children}</section>;
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return <label className={`block text-xs font-bold text-[#4D463F] ${wide ? "md:col-span-2" : ""}`}><span>{label}</span>{children}</label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="mt-7 flex h-11 cursor-pointer items-center gap-3 rounded-xl border border-[#D8CCBD] bg-white px-4 text-xs font-bold"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[#D79525]" />{label}</label>;
}

function WinnerModal({ winner, draft, onChange, onClose, onSave, isSaving }: { winner: ScholarshipWinner | null; draft: ScholarshipWinnerPayload; onChange: (draft: ScholarshipWinnerPayload) => void; onClose: () => void; onSave: () => void; isSaving: boolean }) {
  const update = <K extends keyof ScholarshipWinnerPayload>(key: K, value: ScholarshipWinnerPayload[K]) => onChange({ ...draft, [key]: value });
  return (
    <div className="fixed inset-0 z-[115] overflow-y-auto bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="winner-form-title">
      <div className="mx-auto my-6 w-full max-w-3xl rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-primary-800">Winners register</p><h2 id="winner-form-title" className="mt-2 text-2xl font-black">{winner ? "Edit winner" : "Add winner"}</h2>{winner?.application_reference && <p className="mt-1 text-xs text-[#756B61]">Linked application: {winner.application_reference}</p>}</div><button type="button" onClick={onClose} disabled={isSaving} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-[#F1E8DC]" aria-label="Close"><X size={19} /></button></div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label="Winner name"><input required value={draft.name} onChange={(event) => update("name", event.target.value)} className={inputClass} /></Field>
          <Field label="Country"><input value={draft.country} onChange={(event) => update("country", event.target.value)} className={inputClass} /></Field>
          <Field label="Award / support description" wide><textarea value={draft.award} onChange={(event) => update("award", event.target.value)} className={textareaClass} /></Field>
          <Field label="Modules (comma separated)" wide><input value={draft.modules.join(", ")} onChange={(event) => update("modules", event.target.value.split(",").map((module) => module.trim()).filter(Boolean))} className={inputClass} /></Field>
          <Field label="Category"><input value={draft.category} onChange={(event) => update("category", event.target.value)} className={inputClass} /></Field>
          <Field label="Photo URL"><input type="url" value={draft.photo_url} onChange={(event) => update("photo_url", event.target.value)} className={inputClass} placeholder="https://..." /></Field>
          <Field label="Year"><input type="number" min={2000} max={2100} value={draft.award_year} onChange={(event) => update("award_year", Number(event.target.value))} className={inputClass} /></Field>
          <Field label="Round"><select value={draft.award_round} onChange={(event) => update("award_round", Number(event.target.value) as 1 | 2)} className={inputClass}><option value={1}>Round 1</option><option value={2}>Round 2</option></select></Field>
          <Field label="Display order"><input type="number" min={0} value={draft.display_order} onChange={(event) => update("display_order", Number(event.target.value))} className={inputClass} /></Field>
          <Toggle label="Published on the public page" checked={draft.is_published} onChange={(checked) => update("is_published", checked)} />
        </div>
        <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={onClose} disabled={isSaving} className="h-11 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-bold">Cancel</button><button type="button" onClick={onSave} disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-6 text-xs font-black text-[#0B0B0B] disabled:opacity-60">{isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}{isSaving ? "Saving..." : "Save winner"}</button></div>
      </div>
    </div>
  );
}
