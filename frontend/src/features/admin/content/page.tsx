import {
  Braces,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Database,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { adminApi } from "@/features/admin/adminApi";
import {
  AdminPageHeader,
  AdminPageState,
  ClearFiltersButton,
  EmptyState,
  StatusBadge,
} from "@/features/admin/components/AdminPage";
import type {
  AdminContentTable,
  ContentSectionValue,
} from "@/features/admin/content/types";
import { notifications } from "@/lib/notifications";
import { publishContentUpdate, type ContentPageSlug } from "@/lib/contentSync";

type ContentItem = Record<string, unknown>;
type ItemTarget = { section: string; index: number | null; item: ContentItem };
type DeleteTarget = { section: string; index: number; item: ContentItem };

const contentTableDisplayName = (table: AdminContentTable) =>
  table.slug === "scholarship-pathways" ? "modules" : table.table_name;

const newContentId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `content-${Date.now()}-${Math.random().toString(36).slice(2)}`;

function publishWebsiteContentUpdate(slug: string) {
  const contentSlug = slug as ContentPageSlug;
  publishContentUpdate(contentSlug);
  if (contentSlug === "scholarship-pathways") {
    publishContentUpdate("scholarships");
  }
}

export default function AdminContentPage() {
  const { slug: requestedSlug } = useParams<{ slug?: string }>();
  const [tables, setTables] = useState<AdminContentTable[] | null>(null);
  const [activeSlug, setActiveSlug] = useState("");
  const [editing, setEditing] = useState<ItemTarget | null>(null);
  const [viewing, setViewing] = useState<ItemTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusSavingKey, setStatusSavingKey] = useState("");
  const saveLock = useRef(false);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .contentTables()
      .then((response) => {
        if (cancelled) return;
        setTables(response);
        setActiveSlug(response.find((table) => table.slug === requestedSlug)?.slug ?? response[0]?.slug ?? "");
      })
      .catch((error) => {
        if (cancelled) return;
        setTables([]);
        notifications.error(
          error instanceof Error
            ? error.message
            : "Content tables could not be loaded.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [requestedSlug]);

  const activeTable = useMemo(
    () =>
      tables?.find((table) => table.slug === activeSlug) ?? tables?.[0] ?? null,
    [activeSlug, tables],
  );

  const replaceTable = (updated: AdminContentTable) => {
    setTables(
      (current) =>
        current?.map((table) =>
          table.slug === updated.slug ? updated : table,
        ) ?? [updated],
    );
  };

  const saveItem = async (draft: ContentItem) => {
    if (!activeTable || !editing || saveLock.current) return;
    if (hasBlankRequiredValue(draft)) {
      notifications.error("Complete all required fields before saving.");
      return;
    }
    const currentValue = activeTable.sections[editing.section];
    let nextValue: ContentSectionValue;
    if (Array.isArray(currentValue)) {
      nextValue =
        editing.index === null
          ? [...currentValue, draft]
          : currentValue.map((item, index) =>
              index === editing.index ? draft : item,
            );
    } else {
      nextValue = draft;
    }

    saveLock.current = true;
    setIsSaving(true);
    try {
      const updated = await adminApi.updateContentTable(activeTable.slug, {
        sections: { [editing.section]: nextValue },
      });
      replaceTable(updated);
      publishWebsiteContentUpdate(updated.slug);
      setEditing(null);
      notifications.success(`${itemTitle(draft, 0)} saved successfully.`);
    } catch (error) {
      notifications.error(
        error instanceof Error ? error.message : "Content could not be saved.",
      );
    } finally {
      saveLock.current = false;
      setIsSaving(false);
    }
  };

  const deleteItem = async () => {
    if (!activeTable || !deleteTarget || isDeleting) return;
    const currentValue = activeTable.sections[deleteTarget.section];
    if (!Array.isArray(currentValue)) return;
    setIsDeleting(true);
    try {
      const updated = await adminApi.updateContentTable(activeTable.slug, {
        sections: {
          [deleteTarget.section]: currentValue.filter(
            (_, index) => index !== deleteTarget.index,
          ),
        },
      });
      replaceTable(updated);
      publishWebsiteContentUpdate(updated.slug);
      setDeleteTarget(null);
      notifications.success("Content item deleted successfully.");
    } catch (error) {
      notifications.error(
        error instanceof Error
          ? error.message
          : "Content item could not be deleted.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const changeStatus = async () => {
    if (!activeTable || isChangingStatus) return;
    setIsChangingStatus(true);
    try {
      const updated = await adminApi.updateContentTable(activeTable.slug, {
        is_active: !activeTable.is_active,
      });
      replaceTable(updated);
      publishWebsiteContentUpdate(updated.slug);
      notifications.success(
        `${updated.label} content is now ${updated.is_active ? "active" : "inactive"}.`,
      );
    } catch (error) {
      notifications.error(
        error instanceof Error
          ? error.message
          : "Content status could not be changed.",
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  const changePublishingStatus = async () => {
    if (!activeTable?.status || isChangingStatus) return;
    setIsChangingStatus(true);
    try {
      const updated = await adminApi.updateContentTable(activeTable.slug, {
        status: activeTable.status === "published" ? "draft" : "published",
      });
      replaceTable(updated);
      publishWebsiteContentUpdate(updated.slug);
      notifications.success(`${updated.label} saved as ${updated.status}.`);
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "Publishing status could not be changed.");
    } finally {
      setIsChangingStatus(false);
    }
  };

  const createItem = (section: string, value: ContentSectionValue) => {
    if (!Array.isArray(value) || value.length === 0) return;
    setEditing({
      section,
      index: null,
      item: { ...(emptyLike(value[0]) as ContentItem), id: newContentId(), is_active: true },
    });
  };

  const toggleItemStatus = async (
    section: string,
    index: number | null,
    item: ContentItem,
    isActive: boolean,
  ) => {
    if (!activeTable) return;
    const key = `${section}-${index ?? "object"}`;
    setStatusSavingKey(key);
    const updatedItem = { ...item, is_active: isActive };
    const currentValue = activeTable.sections[section];
    const nextValue: ContentSectionValue = Array.isArray(currentValue)
      ? currentValue.map((current, currentIndex) =>
          currentIndex === index ? updatedItem : current,
        )
      : updatedItem;
    try {
      const updated = await adminApi.updateContentTable(activeTable.slug, {
        sections: { [section]: nextValue },
      });
      replaceTable(updated);
      publishWebsiteContentUpdate(updated.slug);
      notifications.success(
        `${itemTitle(item, index ?? 0)} is now ${isActive ? "active" : "inactive"}.`,
      );
    } catch (error) {
      notifications.error(
        error instanceof Error
          ? error.message
          : "Content status could not be changed.",
      );
    } finally {
      setStatusSavingKey("");
    }
  };

  return (
    <AdminPageState
      isLoading={tables === null}
      hasData={Boolean(tables?.length)}
    >
      {tables && tables.length > 0 && activeTable && (
        <>
          <AdminPageHeader
            eyebrow="Website content"
            title="Content management"
            description="Create, preview and edit the content cards displayed across the IPC website."
            action={<div className="flex flex-wrap gap-2">
              {activeTable.status && <button
                type="button"
                onClick={() => void changePublishingStatus()}
                disabled={isChangingStatus}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-black text-[#0B0B0B] shadow-sm disabled:opacity-60"
              >
                {isChangingStatus && <LoaderCircle size={15} className="animate-spin" />}
                {activeTable.status === "published" ? "Save as draft" : "Publish content"}
              </button>}
              <button
                type="button"
                onClick={() => void changeStatus()}
                disabled={isChangingStatus}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-black text-primary-800 shadow-sm disabled:opacity-60"
              >
                {isChangingStatus && (
                  <LoaderCircle size={15} className="animate-spin" />
                )}
                {activeTable.is_active
                  ? "Deactivate content"
                  : "Activate content"}
              </button>
            </div>}
          />

          <div
            className="mt-7 flex flex-wrap gap-2 rounded-2xl border border-[#D8CCBD] bg-[#E9DED0] p-2"
            role="tablist"
            aria-label="Content tables"
          >
            {tables.map((table) => (
              <button
                key={table.slug}
                type="button"
                role="tab"
                aria-selected={activeTable.slug === table.slug}
                onClick={() => setActiveSlug(table.slug)}
                className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-xs font-black transition ${activeTable.slug === table.slug ? "bg-[#FFFDF9] text-primary-800 shadow-sm" : "text-[#756B61] hover:bg-white/50"}`}
              >
                <Database size={15} />
                {contentTableDisplayName(table)}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            {Object.entries(activeTable.sections).map(([section, value]) => (
              <ContentSectionPanel
                key={section}
                table={activeTable}
                section={section}
                value={value}
                statusSavingKey={statusSavingKey}
                onCreate={() => createItem(section, value)}
                onView={(item, index) => setViewing({ section, index, item })}
                onEdit={(item, index) => setEditing({ section, index, item })}
                onDelete={(item, index) => {
                  if (index !== null) setDeleteTarget({ section, index, item });
                }}
                onToggle={(item, index, active) =>
                  void toggleItemStatus(section, index, item, active)
                }
              />
            ))}
          </div>

          {viewing && (
            <ContentPreviewModal
              target={viewing}
              table={activeTable}
              onClose={() => setViewing(null)}
            />
          )}
          {editing && (
            <ContentFormModal
              target={editing}
              table={activeTable}
              isSaving={isSaving}
              onClose={() => {
                if (!isSaving) setEditing(null);
              }}
              onSave={saveItem}
            />
          )}
          {deleteTarget && (
            <DeleteModal
              target={deleteTarget}
              isDeleting={isDeleting}
              onClose={() => {
                if (!isDeleting) setDeleteTarget(null);
              }}
              onDelete={deleteItem}
            />
          )}
        </>
      )}
    </AdminPageState>
  );
}

const CONTENT_ITEMS_PER_PAGE = 3;

function ContentSectionPanel({
  table,
  section,
  value,
  statusSavingKey,
  onCreate,
  onView,
  onEdit,
  onDelete,
  onToggle,
}: {
  table: AdminContentTable;
  section: string;
  value: ContentSectionValue;
  statusSavingKey: string;
  onCreate: () => void;
  onView: (item: ContentItem, index: number | null) => void;
  onEdit: (item: ContentItem, index: number | null) => void;
  onDelete: (item: ContentItem, index: number | null) => void;
  onToggle: (item: ContentItem, index: number | null, active: boolean) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const indexedItems = (Array.isArray(value) ? value : [value]).map(
    (item, index) => ({ item, index: Array.isArray(value) ? index : null }),
  );
  const filteredItems = indexedItems.filter(({ item }) => {
    const matchesSearch =
      !search.trim() ||
      JSON.stringify(item).toLowerCase().includes(search.trim().toLowerCase());
    const active = item.is_active !== false;
    return matchesSearch && (!status || String(active) === status);
  });
  const pageCount = Math.max(
    1,
    Math.ceil(filteredItems.length / CONTENT_ITEMS_PER_PAGE),
  );
  const safePage = Math.min(page, pageCount);
  const visibleItems = filteredItems.slice(
    (safePage - 1) * CONTENT_ITEMS_PER_PAGE,
    safePage * CONTENT_ITEMS_PER_PAGE,
  );
  const hasActiveFilters = Boolean(search.trim() || status);

  useEffect(() => {
    setPage(1);
  }, [search, status]);
  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#F7F0E7] shadow-[0_8px_25px_rgba(66,48,31,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DED2C3] bg-[#FFFDF9] p-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-800">
            {contentTableDisplayName(table)}
          </p>
          <h2 className="mt-1 text-xl font-black text-[#202A38]">
            {formatLabel(section)}
          </h2>
          <p className="mt-1 text-xs text-[#756B61]">
            {indexedItems.length} {indexedItems.length === 1 ? "item" : "items"}{" "}
            · Updated {new Date(table.updated_at).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={table.is_active ? "active" : "inactive"} />
          {Array.isArray(value) && value.length > 0 && (
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-black text-[#0B0B0B]"
            >
              <Plus size={15} /> Create item
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 border-b border-[#DED2C3] bg-[#FFFDF9] p-4 md:grid-cols-[minmax(240px,1fr)_190px_auto]">
        <label className="relative">
          <span className="sr-only">Search {formatLabel(section)}</span>
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8178]"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={`Search ${formatLabel(section).toLowerCase()}...`}
            className="h-11 w-full rounded-xl border border-[#D8CCBD] bg-white pl-10 pr-4 text-sm outline-none focus:border-primary-500"
          />
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label={`Filter ${formatLabel(section)} by status`}
          className="h-11 rounded-xl border border-[#D8CCBD] bg-white px-3 text-sm outline-none focus:border-primary-500"
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {hasActiveFilters && (
          <ClearFiltersButton
            className="h-11"
            onClick={() => {
              setSearch("");
              setStatus("");
              setPage(1);
            }}
          />
        )}
      </div>
      {visibleItems.length > 0 ? (
        <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.map(({ item, index }) => (
            <ContentItemCard
              key={`${section}-${index ?? "object"}`}
              item={item}
              tableActive={table.is_active}
              isToggling={statusSavingKey === `${section}-${index ?? "object"}`}
              onToggle={(active) => onToggle(item, index, active)}
              onView={() => onView(item, index)}
              onEdit={() => onEdit(item, index)}
              onDelete={
                index !== null ? () => onDelete(item, index) : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="p-5">
          <EmptyState>No content items match the selected filters.</EmptyState>
        </div>
      )}
      {filteredItems.length > 0 && (
        <ContentPagination
          page={safePage}
          pageCount={pageCount}
          total={filteredItems.length}
          onPageChange={setPage}
        />
      )}
    </section>
  );
}

function ContentItemCard({
  item,
  tableActive,
  isToggling,
  onToggle,
  onView,
  onEdit,
  onDelete,
}: {
  item: ContentItem;
  tableActive: boolean;
  isToggling: boolean;
  onToggle: (active: boolean) => void;
  onView: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  const title = itemTitle(item, 0);
  const description = itemDescription(item);
  const icon = typeof item.icon === "string" ? item.icon : "ri-file-text-line";
  const tag = itemTag(item);
  return (
    <article className="flex min-h-[380px] min-w-0 flex-col overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-6 shadow-[0_8px_25px_rgba(66,48,31,0.06)] [overflow-wrap:anywhere]">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary-100 text-primary-800">
          <i className={`${icon} text-2xl`} />
        </span>
        <label
          className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black uppercase ${item.is_active !== false && tableActive ? "border-primary-200 bg-primary-50 text-primary-800" : "border-[#D8CCBD] bg-[#F4ECE1] text-[#756B61]"}`}
        >
          <input
            type="checkbox"
            checked={item.is_active !== false}
            onChange={(event) => onToggle(event.target.checked)}
            disabled={isToggling}
            className="h-4 w-4 accent-[#D69326]"
          />
          {isToggling ? (
            <LoaderCircle size={13} className="animate-spin" />
          ) : item.is_active !== false ? (
            "Active"
          ) : (
            "Inactive"
          )}
        </label>
      </div>
      {tag && (
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.18em] text-primary-800">
          {tag}
        </p>
      )}
      <h3
        className={`${tag ? "mt-2" : "mt-6"} text-xl font-black leading-snug text-[#202A38]`}
      >
        {title}
      </h3>
      {description && (
        <p className="mt-4 line-clamp-5 text-sm leading-7 text-[#6F6861]">
          {description}
        </p>
      )}
      <p className="mt-4 text-xs font-bold text-[#756B61]">
        {Object.keys(item).length} fields
        {Array.isArray(item.highlights)
          ? ` · ${item.highlights.length} highlights`
          : ""}
      </p>
      <div
        className={`mt-auto grid gap-2 pt-6 ${onDelete ? "grid-cols-3" : "grid-cols-2"}`}
      >
        <ActionButton icon={<Eye size={15} />} label="View" onClick={onView} />
        <ActionButton
          icon={<Pencil size={15} />}
          label="Edit"
          onClick={onEdit}
          primary
        />
        {onDelete && (
          <ActionButton
            icon={<Trash2 size={15} />}
            label="Delete"
            onClick={onDelete}
            danger
          />
        )}
      </div>
    </article>
  );
}

function ContentPagination({
  page,
  pageCount,
  total,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#DED2C3] bg-[#FFFDF9] px-5 py-4">
      <p className="text-xs font-bold text-[#756B61]">
        Showing {(page - 1) * CONTENT_ITEMS_PER_PAGE + 1}–
        {Math.min(page * CONTENT_ITEMS_PER_PAGE, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="grid h-9 w-9 place-items-center rounded-lg border border-[#D4C6B5] bg-white disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
              className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-xs font-black ${pageNumber === page ? "border-primary-500 bg-primary-500 text-[#0B0B0B]" : "border-[#D4C6B5] bg-white text-[#655D55]"}`}
            >
              {pageNumber}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pageCount}
          className="grid h-9 w-9 place-items-center rounded-lg border border-[#D4C6B5] bg-white disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function ContentPreviewModal({
  target,
  table,
  onClose,
}: {
  target: ItemTarget;
  table: AdminContentTable;
  onClose: () => void;
}) {
  const item = target.item;
  const icon = typeof item.icon === "string" ? item.icon : "ri-file-text-line";
  const image = firstString(item, ["image", "image_url"]);
  return (
    <ModalShell
      eyebrow="Website preview"
      title={itemTitle(item, 0)}
      onClose={onClose}
    >
      <div className="bg-[#F4ECE1] p-6 md:p-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-7 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={table.is_active ? "active" : "inactive"} />
            <span className="rounded-full bg-[#F4ECE1] px-3 py-1 text-xs font-bold text-[#756B61]">
              {formatLabel(target.section)}
            </span>
          </div>
          {image && (
            <img
              src={image}
              alt=""
              className="mt-6 h-64 w-full rounded-xl object-cover"
            />
          )}
          <div className="mt-6 flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center bg-primary-500 text-[#0B0B0B]">
              <i className={`${icon} text-2xl`} />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-800">
                {itemTag(item) || table.label}
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#202A38]">
                {itemTitle(item, 0)}
              </h3>
            </div>
          </div>
          <ItemDetails item={item} />
        </div>
      </div>
    </ModalShell>
  );
}

function ContentFormModal({
  target,
  table,
  isSaving,
  onClose,
  onSave,
}: {
  target: ItemTarget;
  table: AdminContentTable;
  isSaving: boolean;
  onClose: () => void;
  onSave: (item: ContentItem) => Promise<void>;
}) {
  const [draft, setDraft] = useState<ContentItem>(() =>
    structuredClone(target.item),
  );
  const creating =
    target.index === null && Array.isArray(table.sections[target.section]);
  return (
    <ModalShell
      eyebrow={table.label}
      title={`${creating ? "Create" : "Edit"} ${formatLabel(target.section)} item`}
      onClose={onClose}
      disabled={isSaving}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="h-11 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onSave(draft)}
            disabled={isSaving}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-6 text-xs font-black text-[#0B0B0B] disabled:opacity-60"
          >
            {isSaving ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}{" "}
            {isSaving ? "Saving..." : "Save item"}
          </button>
        </>
      }
    >
      <div className="space-y-5 p-6 md:p-8">
        <ObjectFieldsEditor
          value={draft}
          onChange={setDraft}
          hideIconField={target.section === "discipline_system"}
        />
      </div>
    </ModalShell>
  );
}

function ObjectFieldsEditor({
  value,
  onChange,
  nested = false,
  hideIconField = false,
}: {
  value: ContentItem;
  onChange: (value: ContentItem) => void;
  nested?: boolean;
  hideIconField?: boolean;
}) {
  return (
    <div
      className={
        nested ? "grid gap-4 md:grid-cols-2" : "grid gap-5 md:grid-cols-2"
      }
    >
      {Object.entries(value)
        .filter(([field]) => !(hideIconField && field === "icon"))
        .map(([field, fieldValue]) => {
        const wide =
          isLongField(field) ||
          Array.isArray(fieldValue) ||
          (fieldValue !== null && typeof fieldValue === "object");
        return (
          <div key={field} className={wide ? "md:col-span-2" : ""}>
            <label className="mb-2 block text-xs font-black text-[#655D55]">
              {formatLabel(field)} <span className="text-red-600">*</span>
            </label>
            <FieldEditor
              field={field}
              value={fieldValue}
              hideIconField={hideIconField}
              onChange={(next) => onChange({ ...value, [field]: next })}
            />
          </div>
        );
      })}
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
  hideIconField = false,
}: {
  field: string;
  value: unknown;
  onChange: (value: unknown) => void;
  hideIconField?: boolean;
}) {
  const inputClass =
    "w-full rounded-xl border border-[#D4C6B5] bg-white px-4 text-sm font-semibold text-[#4F4943] outline-none focus:border-primary-500";
  if (typeof value === "boolean")
    return (
      <label className="flex h-12 items-center gap-3 rounded-xl border border-[#D4C6B5] bg-white px-4">
        <input
          type="checkbox"
          checked={value}
          onChange={(event) => onChange(event.target.checked)}
          className="h-5 w-5 accent-[#D69326]"
        />
        <span className="text-sm font-bold">Enabled</span>
      </label>
    );
  if (typeof value === "number")
    return (
      <input
        type="number"
        required
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className={`${inputClass} h-12`}
      />
    );
  if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string"))
      return (
        <textarea
          required
          value={value.join("\n")}
          onChange={(event) =>
            onChange(
              event.target.value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
          rows={5}
          className={`${inputClass} py-3`}
        />
      );
    const objects = value.filter(
      (item): item is ContentItem =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item),
    );
    return (
      <div className="space-y-4">
        {objects.map((item, index) => (
          <div
            key={typeof item.id === "string" ? item.id : index}
            className="rounded-xl border border-[#DED2C3] bg-[#F7F0E7] p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wider text-primary-800">
                {formatLabel(field)} {index + 1}
              </p>
              <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => {
                  const next = [...objects];
                  [next[index - 1], next[index]] = [next[index], next[index - 1]];
                  onChange(next);
                }}
                className="grid h-8 w-8 place-items-center rounded-lg text-[#655D55] hover:bg-white disabled:opacity-30"
                aria-label={`Move ${formatLabel(field)} ${index + 1} up`}
              ><ChevronUp size={15} /></button>
              <button
                type="button"
                disabled={index === objects.length - 1}
                onClick={() => {
                  const next = [...objects];
                  [next[index], next[index + 1]] = [next[index + 1], next[index]];
                  onChange(next);
                }}
                className="grid h-8 w-8 place-items-center rounded-lg text-[#655D55] hover:bg-white disabled:opacity-30"
                aria-label={`Move ${formatLabel(field)} ${index + 1} down`}
              ><ChevronDown size={15} /></button>
              <button
                type="button"
                onClick={() =>
                  onChange(
                    objects.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="grid h-8 w-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"
                aria-label={`Remove ${formatLabel(field)} ${index + 1}`}
              >
                <Trash2 size={15} />
              </button>
              </div>
            </div>
            <ObjectFieldsEditor
              nested
              value={item}
              hideIconField={hideIconField}
              onChange={(next) =>
                onChange(
                  objects.map((current, itemIndex) =>
                    itemIndex === index ? next : current,
                  ),
                )
              }
            />
          </div>
        ))}
        {objects[0] && (
          <button
            type="button"
            onClick={() => onChange([...objects, { ...(emptyLike(objects[0]) as ContentItem), id: newContentId(), is_active: true }])}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary-500 bg-white px-4 text-xs font-black text-primary-800"
          >
            <Plus size={14} /> Add {formatLabel(field)}
          </button>
        )}
      </div>
    );
  }
  if (value && typeof value === "object")
    return (
      <div className="rounded-xl border border-[#DED2C3] bg-[#F7F0E7] p-4">
        <ObjectFieldsEditor
          nested
          value={value as ContentItem}
          hideIconField={hideIconField}
          onChange={onChange}
        />
      </div>
    );
  const stringValue = typeof value === "string" ? value : "";
  return isLongField(field) ? (
    <textarea
      required
      value={stringValue}
      onChange={(event) => onChange(event.target.value)}
      rows={5}
      className={`${inputClass} py-3 leading-6`}
    />
  ) : (
    <input
      required
      type={field.includes("url") || field === "image" ? "url" : "text"}
      value={stringValue}
      onChange={(event) => onChange(event.target.value)}
      className={`${inputClass} h-12`}
    />
  );
}

function ItemDetails({ item }: { item: ContentItem }) {
  return (
    <div className="mt-7 space-y-5 border-t border-[#DED2C3] pt-6">
      {Object.entries(item)
        .filter(([field]) => !["icon", "image", "image_url"].includes(field))
        .map(([field, value]) => (
          <div key={field}>
            <p className="text-xs font-black uppercase tracking-wider text-[#756B61]">
              {formatLabel(field)}
            </p>
            {Array.isArray(value) ? (
              <div className="mt-3 space-y-3">
                {value.map((entry, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-[#F4ECE1] p-4 text-sm leading-6 text-[#655D55]"
                  >
                    {typeof entry === "object" && entry ? (
                      <ItemDetails item={entry as ContentItem} />
                    ) : (
                      String(entry)
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#655D55]">
                {String(value)}
              </p>
            )}
          </div>
        ))}
    </div>
  );
}

function DeleteModal({
  target,
  isDeleting,
  onClose,
  onDelete,
}: {
  target: DeleteTarget;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
}) {
  return (
    <ModalShell
      eyebrow="Delete content"
      title="Delete this item?"
      onClose={onClose}
      disabled={isDeleting}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-10 rounded-xl border border-[#D4C6B5] bg-white px-4 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onDelete()}
            disabled={isDeleting}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-bold text-white disabled:opacity-60"
          >
            {isDeleting ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Trash2 size={15} />
            )}{" "}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </>
      }
    >
      <div className="p-6">
        <p className="text-sm leading-7 text-[#655D55]">
          This permanently removes{" "}
          <strong>{itemTitle(target.item, target.index)}</strong> from the
          website section. At least one item must remain in every required
          section.
        </p>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  eyebrow,
  title,
  children,
  footer,
  onClose,
  disabled = false,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  disabled?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-modal-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#DED2C3] p-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-primary-800">
              {eyebrow}
            </p>
            <h2
              id="content-modal-title"
              className="mt-2 text-2xl font-black text-[#202A38]"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className="grid h-10 w-10 place-items-center rounded-lg hover:bg-[#F4ECE1]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-[#DED2C3] p-5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  primary,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border text-xs font-black transition ${primary ? "border-primary-500 bg-primary-500 text-[#0B0B0B] hover:bg-primary-400" : danger ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100" : "border-[#D4C6B5] bg-white text-[#5D554D] hover:bg-[#F4ECE1]"}`}
    >
      {icon}
      {label}
    </button>
  );
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function firstString(item: ContentItem, fields: string[]) {
  for (const field of fields)
    if (typeof item[field] === "string" && item[field])
      return String(item[field]);
  return "";
}
function itemTitle(item: ContentItem, index: number) {
  const nestedHero =
    item.hero && typeof item.hero === "object" && !Array.isArray(item.hero)
      ? firstString(item.hero as ContentItem, ["title", "eyebrow"])
      : "";
  return (
    firstString(item, ["title", "name", "label", "type", "eyebrow", "id"]) ||
    nestedHero ||
    `Item ${index + 1}`
  );
}
function itemDescription(item: ContentItem) {
  const nestedHero =
    item.hero && typeof item.hero === "object" && !Array.isArray(item.hero)
      ? firstString(item.hero as ContentItem, ["description", "supporting_text"])
      : "";
  return firstString(item, ["description", "summary", "benefits", "help_text"]) || nestedHero;
}
function itemTag(item: ContentItem) {
  return firstString(item, ["category", "label", "type", "period", "eyebrow"]);
}
function isLongField(field: string) {
  return ["description", "benefits", "help_text", "image_alt"].includes(field);
}
function emptyLike(value: unknown): unknown {
  if (Array.isArray(value)) return [];
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, emptyLike(child)]),
    );
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return 0;
  return "";
}
function hasBlankRequiredValue(value: unknown, field = ""): boolean {
  const optional = ["image_alt", "bonus", "modules"].includes(field);
  if (typeof value === "string") return !optional && !value.trim();
  if (Array.isArray(value))
    return (!optional && value.length === 0) || value.some((item) => hasBlankRequiredValue(item));
  if (value && typeof value === "object")
    return Object.entries(value).some(([key, child]) => hasBlankRequiredValue(child, key));
  return !optional && (value === null || value === undefined);
}
