import {
  Eye,
  GraduationCap,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { adminApi } from "@/features/admin/adminApi";
import {
  AdminPageHeader,
  EmptyState,
  StatusBadge,
} from "@/features/admin/components/AdminPage";
import type {
  AdminMembershipGrade,
  AdminMembershipGradePayload,
  MembershipGradeCode,
} from "@/features/admin/types";
import { notifications } from "@/lib/notifications";
import MembershipGradeFormModal from "./MembershipGradeFormModal";

const PER_PAGE = 6;
const SUPPORTED_CODES: MembershipGradeCode[] = [
  "AffIPC",
  "MIPC",
  "AFIPC_L3",
  "AFIPC_L4",
  "FIPC",
];

export default function AdminMembershipGradesPage() {
  const [grades, setGrades] = useState<AdminMembershipGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminMembershipGrade | null>(null);
  const [viewing, setViewing] = useState<AdminMembershipGrade | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      setGrades(await adminApi.membershipGrades());
    } catch (error) {
      notifications.error(
        error instanceof Error
          ? error.message
          : "Could not load membership grades.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const normalized = search.trim().toLowerCase();
  const filtered = grades.filter(
    (grade) =>
      (!normalized ||
        [
          grade.code,
          grade.title,
          grade.short_title,
          grade.post_nominal,
          grade.description,
        ].some((value) => value.toLowerCase().includes(normalized))) &&
      (!active || grade.is_active === (active === "true")),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visible = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const availableCodes = SUPPORTED_CODES.filter(
    (code) => !grades.some((grade) => grade.code === code),
  );
  useEffect(() => setPage((value) => Math.min(value, pageCount)), [pageCount]);
  const save = async (payload: AdminMembershipGradePayload) => {
    setSaving(true);
    try {
      const saved = editing
        ? await adminApi.updateMembershipGrade(editing.id, payload)
        : await adminApi.createMembershipGrade(payload);
      setGrades((items) =>
        editing
          ? items.map((item) => (item.id === saved.id ? saved : item))
          : [...items, saved].sort((a, b) => a.display_order - b.display_order),
      );
      setFormOpen(false);
      setEditing(null);
      notifications.success(
        editing ? "Membership grade updated." : "Membership grade created.",
      );
    } catch (error) {
      notifications.error(
        error instanceof Error
          ? error.message
          : "Could not save membership grade.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 md:px-8 md:py-9">
      <AdminPageHeader
        eyebrow="Membership"
        title="Membership grades"
        description="Manage the membership pathways displayed across the IPC website."
        action={
          <button
            type="button"
            disabled={!availableCodes.length}
            title={
              !availableCodes.length
                ? "All supported membership grades already exist"
                : undefined
            }
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-black disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus size={17} /> Create grade
          </button>
        }
      />
      {loading ? (
        <div className="grid min-h-[45vh] place-items-center">
          <LoaderCircle className="animate-spin text-primary-600" size={30} />
        </div>
      ) : (
        <section className="mt-8 overflow-hidden rounded-2xl border border-[#DED2C3] bg-white/35">
          <div className="flex flex-col gap-3 border-b border-[#E8DED2] bg-[#FFFDF9] p-4 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8178]"
              />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search grades..."
                className="h-10 w-full rounded-xl border border-[#D9CDBE] pl-9 pr-9 text-sm outline-none focus:border-primary-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X size={15} />
                </button>
              )}
            </div>
            <select
              value={active}
              onChange={(e) => {
                setActive(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-xl border border-[#D9CDBE] bg-white px-3 text-xs font-bold"
            >
              <option value="">All visibility</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          {visible.length ? (
            <div className="grid gap-6 p-5 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((grade) => (
                <article
                  key={grade.id}
                  className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E2D7C9] bg-[#FFFDF9] shadow-[0_10px_30px_rgba(66,48,31,0.08)]"
                >
                  <div className="relative h-48 bg-[#E9DFD2]">
                    {grade.image_url ? (
                      <img
                        src={grade.image_url}
                        alt=""
                        className="h-full w-full object-cover "
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-primary-700">
                        <GraduationCap size={48} />
                      </div>
                    )}
                    <div className="absolute right-3 top-3">
                      <StatusBadge
                        status={grade.is_active ? "active" : "inactive"}
                      />
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        
                        <h2 className="mt-1 text-xl font-black">
                          {grade.short_title}
                        </h2>
                      </div>
                      <span className="rounded-lg bg-[#EEE4D7] px-2 py-1 text-xs font-black text-primary-800 font-mono">
                        {grade.post_nominal}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#746A60]">
                      {grade.description || grade.pathway_description}
                    </p>
                    <p className="mt-auto pt-5 text-xs text-[#8A7E72]">
                      Display order: {grade.display_order}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setViewing(grade)}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#D4C6B5] text-xs font-bold"
                      >
                        <Eye size={15} /> View
                      </button>
                      <button
                        onClick={() => {
                          setEditing(grade);
                          setFormOpen(true);
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary-500 text-xs font-black"
                      >
                        <Pencil size={15} /> Edit
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <EmptyState>No membership grades match the filters.</EmptyState>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-[#E8DED2] bg-[#FFFDF9] px-5 py-4 text-xs">
            <span>{filtered.length} grades</span>
            <div className="flex gap-2">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => setPage(number)}
                    className={`grid h-9 w-9 place-items-center rounded-lg border font-black ${page === number ? "border-primary-500 bg-primary-500" : "border-[#D4C6B5] bg-white"}`}
                  >
                    {number}
                  </button>
                ),
              )}
            </div>
          </div>
        </section>
      )}
      <MembershipGradeFormModal
        grade={editing}
        availableCodes={availableCodes}
        open={formOpen}
        isSaving={saving}
        onClose={() => {
          if (!saving) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
        onSave={save}
      />
      {viewing && (
        <div
          className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#FFFDF9] shadow-2xl">
            <div className="relative h-56 bg-[#E9DFD2]">
              {viewing.image_url && (
                <img
                  src={viewing.image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
              <button
                onClick={() => setViewing(null)}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="font-mono text-xs font-black text-primary-800">
                {viewing.code} · {viewing.post_nominal}
              </p>
              <h2 className="mt-2 text-3xl font-black">{viewing.title}</h2>
              <p className="mt-4 leading-7 text-[#655D55]">
                {viewing.description}
              </p>
              <h3 className="mt-6 font-black">{viewing.pathway_title}</h3>
              <p className="mt-2 leading-7 text-[#655D55]">
                {viewing.pathway_description}
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Detail
                  title="Evidence requirements"
                  text={viewing.evidence_requirements}
                />
                <Detail
                  title="CPD requirements"
                  text={viewing.cpd_requirements}
                />
                <Detail
                  title="Professional recognition"
                  text={viewing.professional_recognition}
                />
                <Detail
                  title="Application pathway"
                  text={viewing.application_pathway}
                />
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Detail
                  title={`Benefits (${viewing.benefits.length})`}
                  text={viewing.benefits
                    .map((item) => `• ${item.title}`)
                    .join("\n")}
                />
                <Detail
                  title={`Requirements (${viewing.requirements.length})`}
                  text={viewing.requirements
                    .map((item) => `• ${item.title}`)
                    .join("\n")}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Detail({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-[#E2D7C9] bg-[#F7F2EB] p-4">
      <h4 className="text-xs font-black uppercase tracking-wider">{title}</h4>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#746A60]">
        {text || "Not specified"}
      </p>
    </div>
  );
}
