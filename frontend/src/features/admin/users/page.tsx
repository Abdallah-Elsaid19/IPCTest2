import {
  ChevronLeft,
  ChevronRight,
  Eye,
  KeyRound,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { adminApi, type AdminUserQuery } from "@/features/admin/adminApi";
import {
  AdminPageHeader,
  EmptyState,
} from "@/features/admin/components/AdminPage";
import type {
  AdminUser,
  AdminUserPayload,
  PaginatedAdminUsers,
} from "@/features/admin/types";
import UserFormModal from "@/features/admin/users/UserFormModal";
import { useAuth } from "@/features/auth/AuthContext";
import { notifications } from "@/lib/notifications";

type ConfirmAction = { type: "reset" | "delete"; user: AdminUser } | null;

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [result, setResult] = useState<PaginatedAdminUsers | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<
    Pick<AdminUserQuery, "active" | "role">
  >({ active: "", role: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const requestId = useRef(0);
  const requestController = useRef<AbortController | null>(null);
  const saveLock = useRef(false);
  const actionLock = useRef(false);

  const loadUsers = useCallback(async () => {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    const id = ++requestId.current;
    setIsLoading(true);
    try {
      const response = await adminApi.users({
        page,
        search: search.trim(),
        ...filters,
      }, controller.signal);
      if (!controller.signal.aborted && id === requestId.current) setResult(response);
    } catch (error) {
      if (!controller.signal.aborted && id === requestId.current)
        notifications.error(
          error instanceof Error ? error.message : "Could not load users.",
        );
    } finally {
      if (!controller.signal.aborted && id === requestId.current) setIsLoading(false);
    }
  }, [filters, page, search]);

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        void loadUsers();
      },
      search ? 350 : 0,
    );
    return () => {
      window.clearTimeout(timer);
      requestController.current?.abort();
    };
  }, [loadUsers, search]);

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };
  const openEdit = (user: AdminUser) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const saveUser = async (payload: AdminUserPayload) => {
    if (saveLock.current) return;
    saveLock.current = true;
    setIsSaving(true);
    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, payload);
        notifications.success("User updated successfully.");
      } else {
        const created = await adminApi.createUser(payload);
        notifications.success(
          "User created. Sending their secure password setup email…",
        );
        try {
          await adminApi.sendPasswordReset(created.id);
          notifications.success("Password setup email sent successfully.");
        } catch (error) {
          notifications.error(
            error instanceof Error
              ? `User created, but email failed: ${error.message}`
              : "User created, but the reset email could not be sent.",
          );
        }
      }
      setModalOpen(false);
      await loadUsers();
    } catch (error) {
      notifications.error(
        error instanceof Error ? error.message : "Could not save the user.",
      );
    } finally {
      saveLock.current = false;
      setIsSaving(false);
    }
  };

  const runConfirmedAction = async () => {
    if (!confirmAction || actionLock.current) return;
    actionLock.current = true;
    const { type, user } = confirmAction;
    setBusyUserId(user.id);
    try {
      if (type === "reset") {
        await adminApi.sendPasswordReset(user.id);
        notifications.success(
          `Password-reset email sent to ${user.personal_email || user.ipc_email}.`,
        );
      } else {
        await adminApi.deleteUser(user.id);
        notifications.success("User deleted successfully.");
        if (result?.results.length === 1 && page > 1)
          setPage((value) => value - 1);
        else await loadUsers();
      }
      setConfirmAction(null);
    } catch (error) {
      notifications.error(
        error instanceof Error
          ? error.message
          : "The action could not be completed.",
      );
    } finally {
      actionLock.current = false;
      setBusyUserId(null);
    }
  };

  const pageCount = Math.max(1, Math.ceil((result?.count || 0) / 10));
  const selectClass =
    "h-10 rounded-xl border border-[#D9CDBE] bg-white px-3 text-xs font-semibold text-[#4F4841] outline-none focus:border-primary-500";

  return (
    <div className="mx-auto max-w-[1500px] px-5 py-7 text-[#221E1A] md:px-8 md:py-9">
      <AdminPageHeader
        eyebrow="Access control"
        title="Users management"
        description="Manage real IPC accounts, access levels, status, and secure password resets."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-4 text-xs font-bold text-[#0B0B0B] shadow-sm hover:bg-primary-400"
          >
            <Plus size={16} />
            Add user
          </button>
        }
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
              placeholder="Search name, email, reference, or grade…"
              className="h-11 w-full rounded-xl border border-[#D9CDBE] bg-white pl-10 pr-10 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7E72]"
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Filter account status"
              value={filters.active}
              onChange={(event) => {
                setFilters((value) => ({
                  ...value,
                  active: event.target.value as AdminUserQuery["active"],
                }));
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">All statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select
              aria-label="Filter role"
              value={filters.role}
              onChange={(event) => {
                setFilters((value) => ({
                  ...value,
                  role: event.target.value as AdminUserQuery["role"],
                }));
                setPage(1);
              }}
              className={selectClass}
            >
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-[#E8DED2] bg-[#F7F2EB] px-5 py-3 text-xs text-[#746A60]">
          <span>
            <strong className="text-[#2D2823]">{result?.count || 0}</strong>{" "}
            matching users
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
            <EmptyState>
              No users match the current search and filters.
            </EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="bg-[#ECE2D6] text-[10px] uppercase tracking-wider text-[#766C62]">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">IPC Email</th>
                  <th className="px-5 py-3.5">Reference</th>
                  <th className="px-5 py-3.5">Membership Grade</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DED2]">
                {result?.results.map((account) => {
                  const protectedUser =
                    account.id === currentUser?.id ||
                    (account.is_superuser && !currentUser?.is_superuser);
                  return (
                    <tr
                      key={account.id}
                      className="transition-colors hover:bg-[#FAF5EE]"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0B0B0B] text-xs font-bold text-white">
                            {account.name.charAt(0).toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="font-bold text-[#2D2823]">
                              {account.name}
                            </p>
                            <p className="mt-0.5 text-[10px] text-[#A09386]">
                              {account.username.includes("@") ? account.username : `@${account.username}`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-52 px-5 py-4">
                        <p className="truncate text-xs font-semibold text-[#554E47]" title={account.ipc_email}>
                          {account.ipc_email}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {account.membership_application_id && account.membership_reference ? (
                          <Link
                            to={`/admin/applications/${account.membership_application_id}`}
                            className="whitespace-nowrap font-mono text-xs font-bold text-primary-800 underline-offset-4 hover:underline"
                            title={account.membership_reference}
                          >
                            {account.membership_reference}
                          </Link>
                        ) : "—"}
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-[#554E47]">
                        {account.membership_grade || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-800">
                          {account.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold ${account.is_active ? "text-emerald-700" : "text-[#8A7E72]"}`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${account.is_active ? "bg-emerald-500" : "bg-[#B8ADA1]"}`}
                          />
                          {account.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#655D55]">
                        {new Date(account.account_created_at || account.date_joined).toLocaleDateString(
                          "en-GB",
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <Link
                            to={`/dashboard/users/${account.id}`}
                            className="grid h-9 w-9 place-items-center rounded-lg text-[#655D55] hover:bg-primary-100 hover:text-primary-800"
                            title="View user details"
                            aria-label={`View details for ${account.name}`}
                          >
                            <Eye size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({ type: "reset", user: account })
                            }
                            disabled={
                              protectedUser ||
                              !account.email ||
                              busyUserId === account.id
                            }
                            className="grid h-9 w-9 place-items-center rounded-lg text-[#655D55] hover:bg-primary-100 hover:text-primary-800 disabled:opacity-40"
                            title="Send password reset"
                          >
                            <KeyRound size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(account)}
                            disabled={
                              protectedUser && account.id !== currentUser?.id
                            }
                            className="grid h-9 w-9 place-items-center rounded-lg text-[#655D55] hover:bg-primary-100 hover:text-primary-800 disabled:opacity-30"
                            title="Edit user"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmAction({
                                type: "delete",
                                user: account,
                              })
                            }
                            disabled={
                              protectedUser || busyUserId === account.id
                            }
                            className="grid h-9 w-9 place-items-center rounded-lg text-[#655D55] hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
                            title={
                              account.id === currentUser?.id
                                ? "You cannot delete your own account"
                                : "Delete user"
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#E8DED2] px-5 py-4">
          <p className="text-xs text-[#746A60]">
            Page {page} of {pageCount}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              disabled={!result?.previous || isLoading}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D4C6B5] px-3 text-xs font-bold disabled:opacity-40"
            >
              <ChevronLeft size={15} />
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((value) => value + 1)}
              disabled={!result?.next || isLoading}
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#D4C6B5] px-3 text-xs font-bold disabled:opacity-40"
            >
              Next
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      <UserFormModal
        user={editingUser}
        isOpen={modalOpen}
        isSaving={isSaving}
        onClose={() => !isSaving && setModalOpen(false)}
        onSubmit={saveUser}
      />

      {confirmAction && (
        <div className="fixed inset-0 z-[110] grid place-items-center bg-black/55 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl bg-[#FFFDF9] p-6 shadow-2xl"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-100 text-primary-800">
              {confirmAction.type === "reset" ? (
                <KeyRound size={20} />
              ) : (
                <UserRound size={20} />
              )}
            </span>
            <h2 className="mt-4 text-xl font-black">
              {confirmAction.type === "reset"
                ? "Send password-reset email?"
                : "Delete this user?"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#746A60]">
              {confirmAction.type === "reset"
                ? `A secure, single-use link will be sent to ${confirmAction.user.personal_email || confirmAction.user.ipc_email}.`
                : `This permanently deletes ${confirmAction.user.name}'s IPC account. This action cannot be undone.`}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={busyUserId !== null}
                className="h-10 rounded-xl border border-[#D4C6B5] px-4 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void runConfirmedAction()}
                disabled={busyUserId !== null}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold ${confirmAction.type === "delete" ? "bg-red-600 text-white" : "bg-primary-500 text-[#0B0B0B]"}`}
              >
                {busyUserId !== null && (
                  <LoaderCircle size={15} className="animate-spin" />
                )}
                {confirmAction.type === "reset" ? "Send email" : "Delete user"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
