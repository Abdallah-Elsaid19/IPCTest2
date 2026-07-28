import { ChevronLeft, ChevronRight, Eye, FileJson, Layers3, LoaderCircle, Pencil, Plus, Search, Trash2, Trophy, UserCheck, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { adminApi } from "@/features/admin/adminApi";
import AwardCategoryDetailsModal from "@/features/admin/awards/AwardCategoryDetailsModal";
import AwardCategoryFormModal from "@/features/admin/awards/AwardCategoryFormModal";
import AwardProgrammeDetailsModal from "@/features/admin/awards/AwardProgrammeDetailsModal";
import AwardProgrammeFormModal from "@/features/admin/awards/AwardProgrammeFormModal";
import AwardNominationsPanel from "@/features/admin/awards/AwardNominationsPanel";
import { AdminPageHeader, AdminPageState, ClearFiltersButton, EmptyState, StatusBadge } from "@/features/admin/components/AdminPage";
import type {
  AdminAwardCategory,
  AdminAwardProgramme,
  AwardCategoryPayload,
  AwardProgrammePayload,
} from "@/features/awards/types";
import { publishContentUpdate } from "@/lib/contentSync";
import { notifications } from "@/lib/notifications";

type AwardsTab = "programmes" | "categories" | "nominations";
type DeleteTarget =
  | { kind: "programme"; item: AdminAwardProgramme }
  | { kind: "category"; item: AdminAwardCategory }
  | null;
const ITEMS_PER_PAGE = 6;

export default function AdminAwardsPage() {
  const [activeTab, setActiveTab] = useState<AwardsTab>("programmes");
  const [programmes, setProgrammes] = useState<AdminAwardProgramme[] | null>(null);
  const [categories, setCategories] = useState<AdminAwardCategory[] | null>(null);
  const [editingProgramme, setEditingProgramme] = useState<AdminAwardProgramme | null>(null);
  const [viewingProgramme, setViewingProgramme] = useState<AdminAwardProgramme | null>(null);
  const [programmeFormOpen, setProgrammeFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminAwardCategory | null>(null);
  const [viewingCategory, setViewingCategory] = useState<AdminAwardCategory | null>(null);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [programmeSearch, setProgrammeSearch] = useState("");
  const [programmeCategory, setProgrammeCategory] = useState("");
  const [programmeStatus, setProgrammeStatus] = useState("");
  const [programmePage, setProgrammePage] = useState(1);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryStatus, setCategoryStatus] = useState("");
  const [categoryPage, setCategoryPage] = useState(1);
  const saveLock = useRef(false);

  const loadData = useCallback(async () => {
    const [programmeResult, categoryResult] = await Promise.allSettled([
      adminApi.awardProgrammes(),
      adminApi.awardCategories(),
    ]);
    if (programmeResult.status === "fulfilled") setProgrammes(programmeResult.value);
    else {
      setProgrammes([]);
      notifications.error(programmeResult.reason instanceof Error ? programmeResult.reason.message : "Award programmes could not be loaded.");
    }
    if (categoryResult.status === "fulfilled") setCategories(categoryResult.value);
    else {
      setCategories([]);
      notifications.error(categoryResult.reason instanceof Error ? categoryResult.reason.message : "Award categories could not be loaded.");
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  const saveProgramme = async (payload: AwardProgrammePayload) => {
    if (saveLock.current) return;
    saveLock.current = true;
    setIsSaving(true);
    try {
      const saved = editingProgramme
        ? await adminApi.updateAwardProgramme(editingProgramme.id, payload)
        : await adminApi.createAwardProgramme(payload);
      setProgrammes((current) => editingProgramme
        ? current?.map((item) => item.id === saved.id ? saved : item) ?? [saved]
        : [...(current ?? []), saved].sort((a, b) => a.title.localeCompare(b.title)));
      setProgrammeFormOpen(false);
      if (!editingProgramme) setProgrammePage(1);
      setEditingProgramme(null);
      publishContentUpdate("awards");
      notifications.success(editingProgramme ? "Award programme updated successfully." : "Award programme created successfully.");
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Award programme could not be saved.");
    } finally {
      saveLock.current = false;
      setIsSaving(false);
    }
  };

  const saveCategory = async (payload: AwardCategoryPayload) => {
    if (saveLock.current) return;
    saveLock.current = true;
    setIsSaving(true);
    try {
      const saved = editingCategory
        ? await adminApi.updateAwardCategory(editingCategory.id, payload)
        : await adminApi.createAwardCategory(payload);
      setCategories((current) => (editingCategory
        ? current?.map((item) => item.id === saved.id ? saved : item) ?? [saved]
        : [...(current ?? []), saved]
      ).sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title)));
      setProgrammes((current) => current?.map((programme) => programme.category === saved.slug
        ? { ...programme, category_title: saved.title }
        : programme) ?? []);
      setCategoryFormOpen(false);
      if (!editingCategory) setCategoryPage(1);
      setEditingCategory(null);
      publishContentUpdate("awards");
      notifications.success(editingCategory ? "Award category updated successfully." : "Award category created successfully.");
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Award category could not be saved.");
    } finally {
      saveLock.current = false;
      setIsSaving(false);
    }
  };

  const deleteItem = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.kind === "programme") {
        await adminApi.deleteAwardProgramme(deleteTarget.item.id);
        setProgrammes((current) => current?.filter((item) => item.id !== deleteTarget.item.id) ?? []);
        notifications.success("Award programme deleted successfully.");
      } else {
        await adminApi.deleteAwardCategory(deleteTarget.item.id);
        setCategories((current) => current?.filter((item) => item.id !== deleteTarget.item.id) ?? []);
        notifications.success("Award category deleted successfully.");
      }
      setDeleteTarget(null);
      publishContentUpdate("awards");
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "The item could not be deleted.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openCreate = () => {
    if (activeTab === "programmes") {
      setEditingProgramme(null);
      setProgrammeFormOpen(true);
    } else if (activeTab === "categories") {
      setEditingCategory(null);
      setCategoryFormOpen(true);
    }
  };

  const filteredProgrammes = useMemo(() => {
    const search = programmeSearch.trim().toLowerCase();
    return (programmes ?? []).filter((programme) => {
      const matchesSearch = !search || [
        programme.title,
        programme.description,
        programme.category_title,
        ...programme.criteria,
      ].some((value) => value.toLowerCase().includes(search));
      const matchesCategory = !programmeCategory || programme.category === programmeCategory;
      const matchesStatus = !programmeStatus || String(programme.is_active) === programmeStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [programmeCategory, programmeSearch, programmeStatus, programmes]);
  const programmePageCount = Math.max(1, Math.ceil(filteredProgrammes.length / ITEMS_PER_PAGE));
  const visibleProgrammes = filteredProgrammes.slice((programmePage - 1) * ITEMS_PER_PAGE, programmePage * ITEMS_PER_PAGE);
  const hasProgrammeFilters = Boolean(programmeSearch.trim() || programmeCategory || programmeStatus);

  const filteredCategories = useMemo(() => {
    const search = categorySearch.trim().toLowerCase();
    return (categories ?? []).filter((category) => {
      const matchesSearch = !search || [
        category.title,
        category.description,
        category.slug,
        ...category.highlights,
      ].some((value) => value.toLowerCase().includes(search));
      const matchesStatus = !categoryStatus || String(category.is_active) === categoryStatus;
      return matchesSearch && matchesStatus;
    });
  }, [categories, categorySearch, categoryStatus]);
  const categoryPageCount = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE));
  const visibleCategories = filteredCategories.slice((categoryPage - 1) * ITEMS_PER_PAGE, categoryPage * ITEMS_PER_PAGE);
  const hasCategoryFilters = Boolean(categorySearch.trim() || categoryStatus);

  useEffect(() => { setProgrammePage(1); }, [programmeSearch, programmeCategory, programmeStatus]);
  useEffect(() => { setCategoryPage(1); }, [categorySearch, categoryStatus]);
  useEffect(() => { if (programmePage > programmePageCount) setProgrammePage(programmePageCount); }, [programmePage, programmePageCount]);
  useEffect(() => { if (categoryPage > categoryPageCount) setCategoryPage(categoryPageCount); }, [categoryPage, categoryPageCount]);

  const isLoading = programmes === null || categories === null;
  return (
    <AdminPageState isLoading={isLoading} hasData={!isLoading}>
      {programmes && categories && (
        <>
          <AdminPageHeader
            eyebrow="Recognition"
            title="Awards"
            description="Manage the programmes and category cards displayed on the IPC awards page."
            action={<div className="flex flex-wrap gap-2">
              <Link to="/admin/content/awards" className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-black text-primary-800 shadow-sm">
                <FileJson size={16} /> Edit page content
              </Link>
              {activeTab !== "nominations" && <button type="button" onClick={openCreate} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-black text-[#0B0B0B] shadow-sm hover:bg-primary-400"><Plus size={16}/> Create {activeTab === "programmes" ? "programme" : "category"}</button>}
            </div>}
          />

          <div className="mt-7 inline-flex rounded-xl border border-[#D8CCBD] bg-[#E9DED0] p-1" role="tablist" aria-label="Awards management">
            <button type="button" role="tab" aria-selected={activeTab === "programmes"} onClick={() => setActiveTab("programmes")} className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-black transition ${activeTab === "programmes" ? "bg-[#FFFDF9] text-primary-800 shadow-sm" : "text-[#756B61]"}`}><Trophy size={15}/> Programmes <span className="rounded-full bg-[#F4ECE1] px-2 py-0.5">{programmes.length}</span></button>
            <button type="button" role="tab" aria-selected={activeTab === "categories"} onClick={() => setActiveTab("categories")} className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-black transition ${activeTab === "categories" ? "bg-[#FFFDF9] text-primary-800 shadow-sm" : "text-[#756B61]"}`}><Layers3 size={15}/> Categories <span className="rounded-full bg-[#F4ECE1] px-2 py-0.5">{categories.length}</span></button>
            <button type="button" role="tab" aria-selected={activeTab === "nominations"} onClick={() => setActiveTab("nominations")} className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-black transition ${activeTab === "nominations" ? "bg-[#FFFDF9] text-primary-800 shadow-sm" : "text-[#756B61]"}`}><UserCheck size={15}/> Nominations</button>
          </div>

          {activeTab === "programmes" && (
            <section className="mt-6 overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#F7F0E7] shadow-[0_8px_25px_rgba(66,48,31,0.06)]">
            <div className="grid gap-3 border-b border-[#DED2C3] bg-[#FFFDF9] p-4 md:grid-cols-[minmax(240px,1fr)_220px_180px_auto]">
              <label className="relative"><span className="sr-only">Search programmes</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8178]"/><input value={programmeSearch} onChange={(event) => setProgrammeSearch(event.target.value)} placeholder="Search programmes..." className="h-11 w-full rounded-xl border border-[#D8CCBD] bg-white pl-10 pr-4 text-sm outline-none focus:border-primary-500"/></label>
              <select value={programmeCategory} onChange={(event) => setProgrammeCategory(event.target.value)} aria-label="Filter by category" className="h-11 rounded-xl border border-[#D8CCBD] bg-white px-3 text-sm outline-none focus:border-primary-500"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.slug}>{category.title}</option>)}</select>
              <select value={programmeStatus} onChange={(event) => setProgrammeStatus(event.target.value)} aria-label="Filter by programme status" className="h-11 rounded-xl border border-[#D8CCBD] bg-white px-3 text-sm outline-none focus:border-primary-500"><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select>
              {hasProgrammeFilters && <ClearFiltersButton className="h-11" onClick={() => { setProgrammeSearch(""); setProgrammeCategory(""); setProgrammeStatus(""); setProgrammePage(1); }}/>}
            </div>
            <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleProgrammes.map((programme) => (
                <article key={programme.id} className="flex h-full flex-col rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-6 shadow-[0_8px_25px_rgba(66,48,31,0.06)]">
                  <div className="flex items-start justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-100 text-primary-800"><Trophy size={20}/></span><StatusBadge status={programme.is_active ? "active" : "inactive"}/></div>
                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-primary-800">{programme.category_title}</p>
                  <h2 className="mt-2 text-xl font-black leading-snug text-[#202A38]">{programme.title}</h2>
                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#6F6861]">{programme.description}</p>
                  <p className="mt-4 text-xs font-bold text-[#756B61]">{programme.criteria.length} criteria</p>
                  <CardActions title={programme.title} onView={() => setViewingProgramme(programme)} onEdit={() => { setEditingProgramme(programme); setProgrammeFormOpen(true); }} onDelete={() => setDeleteTarget({ kind: "programme", item: programme })}/>
                </article>
              ))}
            </div>
            {filteredProgrammes.length === 0 && <div className="p-5"><EmptyState>No award programmes match the selected filters.</EmptyState></div>}
            {filteredProgrammes.length > 0 && <PaginationControls page={programmePage} pageCount={programmePageCount} total={filteredProgrammes.length} label="programmes" onPageChange={setProgrammePage}/>} 
            </section>
          )}

          {activeTab === "categories" && (
            <section className="mt-6 overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#F7F0E7] shadow-[0_8px_25px_rgba(66,48,31,0.06)]">
            <div className="grid gap-3 border-b border-[#DED2C3] bg-[#FFFDF9] p-4 md:grid-cols-[minmax(240px,1fr)_180px_auto]">
              <label className="relative"><span className="sr-only">Search categories</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8178]"/><input value={categorySearch} onChange={(event) => setCategorySearch(event.target.value)} placeholder="Search categories..." className="h-11 w-full rounded-xl border border-[#D8CCBD] bg-white pl-10 pr-4 text-sm outline-none focus:border-primary-500"/></label>
              <select value={categoryStatus} onChange={(event) => setCategoryStatus(event.target.value)} aria-label="Filter by category status" className="h-11 rounded-xl border border-[#D8CCBD] bg-white px-3 text-sm outline-none focus:border-primary-500"><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select>
              {hasCategoryFilters && <ClearFiltersButton className="h-11" onClick={() => { setCategorySearch(""); setCategoryStatus(""); setCategoryPage(1); }}/>}
            </div>
            <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleCategories.map((category) => (
                <article key={category.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_8px_25px_rgba(66,48,31,0.06)]">
                  <div className="relative h-44 bg-[#E9DFD2]"><img src={category.image_url} alt="" className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"/><span className="absolute bottom-3 left-3 grid h-10 w-10 place-items-center bg-white/20 text-white backdrop-blur-sm"><i className={`${category.icon_class} text-lg`}/></span><div className="absolute right-3 top-3"><StatusBadge status={category.is_active ? "active" : "inactive"}/></div></div>
                  <div className="flex flex-1 flex-col p-6"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-800">Order {category.sort_order}</p><h2 className="mt-2 text-xl font-black text-[#202A38]">{category.title}</h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-[#6F6861]">{category.description}</p><p className="mt-4 text-xs font-bold text-[#756B61]">{category.highlights.length} highlights</p><CardActions title={category.title} onView={() => setViewingCategory(category)} onEdit={() => { setEditingCategory(category); setCategoryFormOpen(true); }} onDelete={() => setDeleteTarget({ kind: "category", item: category })}/></div>
                </article>
              ))}
            </div>
            {filteredCategories.length === 0 && <div className="p-5"><EmptyState>No award categories match the selected filters.</EmptyState></div>}
            {filteredCategories.length > 0 && <PaginationControls page={categoryPage} pageCount={categoryPageCount} total={filteredCategories.length} label="categories" onPageChange={setCategoryPage}/>} 
            </section>
          )}

          {activeTab === "nominations" && <AwardNominationsPanel />}

          <AwardProgrammeFormModal programme={editingProgramme} categories={categories} open={programmeFormOpen} isSaving={isSaving} onClose={() => { if (!isSaving) setProgrammeFormOpen(false); }} onSave={saveProgramme}/>
          <AwardProgrammeDetailsModal programme={viewingProgramme} onClose={() => setViewingProgramme(null)}/>
          <AwardCategoryFormModal category={editingCategory} open={categoryFormOpen} isSaving={isSaving} onClose={() => { if (!isSaving) setCategoryFormOpen(false); }} onSave={saveCategory}/>
          <AwardCategoryDetailsModal category={viewingCategory} onClose={() => setViewingCategory(null)}/>

          {deleteTarget && (
            <div className="fixed inset-0 z-[110] grid place-items-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-award-title">
              <div className="w-full max-w-md rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-6 shadow-2xl">
                <div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-red-100 text-red-700"><Trash2 size={20}/></span><button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#F4ECE1]" aria-label="Close"><X size={18}/></button></div>
                <h2 id="delete-award-title" className="mt-5 text-xl font-black text-[#202A38]">Delete award {deleteTarget.kind}?</h2>
                <p className="mt-3 text-sm leading-6 text-[#655D55]">This permanently deletes <strong>{deleteTarget.item.title}</strong>.{deleteTarget.kind === "category" && " A category used by programmes cannot be deleted until those programmes are moved or deleted."}</p>
                <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="h-10 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold">Cancel</button><button type="button" onClick={() => void deleteItem()} disabled={isDeleting} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white disabled:opacity-60">{isDeleting ? <LoaderCircle size={15} className="animate-spin"/> : <Trash2 size={15}/>} {isDeleting ? "Deleting..." : "Delete"}</button></div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminPageState>
  );
}

function CardActions({ title, onView, onEdit, onDelete }: { title: string; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  return <div className="mt-auto grid grid-cols-3 gap-2 pt-5"><button type="button" onClick={onView} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#D4C6B5] bg-white text-xs font-bold text-[#554E47] hover:border-primary-500" aria-label={`View ${title}`}><Eye size={16}/><span className="hidden sm:inline">View</span></button><button type="button" onClick={onEdit} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary-500 text-xs font-bold text-[#0B0B0B]" aria-label={`Edit ${title}`}><Pencil size={15}/><span className="hidden sm:inline">Edit</span></button><button type="button" onClick={onDelete} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700" aria-label={`Delete ${title}`}><Trash2 size={16}/><span className="hidden sm:inline">Delete</span></button></div>;
}

function PaginationControls({ page, pageCount, total, label, onPageChange }: { page: number; pageCount: number; total: number; label: string; onPageChange: (page: number) => void }) {
  const pageNumbers: Array<number | string> = pageCount <= 7
    ? Array.from({ length: pageCount }, (_, index) => index + 1)
    : [1, ...(page > 3 ? ["start"] : []), ...Array.from(new Set([page - 1, page, page + 1].filter((item) => item > 1 && item < pageCount))), ...(page < pageCount - 2 ? ["end"] : []), pageCount];
  return <div className="flex flex-col gap-3 border-t border-[#DED2C3] bg-[#FFFDF9] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[#746A60]">Page {page} of {pageCount} · {total} {label}</p><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D4C6B5] bg-white px-3 text-xs font-bold disabled:opacity-40"><ChevronLeft size={15}/> Previous</button><div className="flex items-center gap-1">{pageNumbers.map((item, index) => typeof item === "number" ? <button key={item} type="button" onClick={() => onPageChange(item)} aria-current={item === page ? "page" : undefined} className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-xs font-black ${item === page ? "border-primary-500 bg-primary-500 text-[#0B0B0B]" : "border-[#D4C6B5] bg-white text-[#625A52]"}`}>{item}</button> : <span key={`${item}-${index}`} className="px-1 text-[#8A8178]">…</span>)}</div><button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount} className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D4C6B5] bg-white px-3 text-xs font-bold disabled:opacity-40">Next <ChevronRight size={15}/></button></div></div>;
}
