import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { AdminUser, AdminUserPayload } from "@/features/admin/types";
import { ukTelephoneSchema } from "@/lib/validations/ukTelephoneSchema";

const schema = z.object({
  first_name: z.string().trim().max(150),
  last_name: z.string().trim().max(150),
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(150)
    .regex(/^[\w.@+-]+$/, "Use letters, numbers, or @/./+/-/_ only"),
  email: z.email("Enter a valid email address").max(254),
  telephone: ukTelephoneSchema,
  role: z.enum(["admin", "user"]),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function UserFormModal({
  user,
  isOpen,
  isSaving,
  onClose,
  onSubmit,
}: {
  user: AdminUser | null;
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminUserPayload) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      telephone: "",
      role: "user",
      is_active: true,
    },
  });
  useEffect(() => {
    if (!isOpen) return;
    reset(
      user
        ? {
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            telephone: user.telephone,
            role: user.role,
            is_active: user.is_active,
          }
        : {
            first_name: "",
            last_name: "",
            username: "",
            email: "",
            telephone: "",
            role: "user",
            is_active: true,
          },
    );
  }, [isOpen, reset, user]);

  if (!isOpen) return null;

  const inputClass =
    "mt-2 h-11 w-full rounded-xl border border-[#D9CDBE] bg-white px-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15";
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-form-title"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/80 bg-[#FFFDF9] shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E6DCCE] bg-[#FFFDF9] px-6 py-5">
          <div>
            <h2
              id="user-form-title"
              className="text-xl font-black text-[#171411]"
            >
              {user ? "Edit user" : "Add user"}
            </h2>
            <p className="mt-1 text-xs text-[#7A7066]">
              {user
                ? "Update account details and access."
                : "The user will set their password through a secure reset email."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#F1E8DC]"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <label className="text-xs font-bold uppercase tracking-wide text-[#655D55]">
            First name
            <input {...register("first_name")} className={inputClass} />
            {errors.first_name && (
              <span className="mt-1 block text-[11px] normal-case text-red-600">
                {errors.first_name.message}
              </span>
            )}
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-[#655D55]">
            Last name
            <input {...register("last_name")} className={inputClass} />
            {errors.last_name && (
              <span className="mt-1 block text-[11px] normal-case text-red-600">
                {errors.last_name.message}
              </span>
            )}
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-[#655D55]">
            Username
            <input {...register("username")} className={inputClass} />
            {errors.username && (
              <span className="mt-1 block text-[11px] normal-case text-red-600">
                {errors.username.message}
              </span>
            )}
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-[#655D55]">
            Email address
            <input type="email" {...register("email")} className={inputClass} />
            {errors.email && (
              <span className="mt-1 block text-[11px] normal-case text-red-600">
                {errors.email.message}
              </span>
            )}
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-[#655D55]">
            UK telephone number
            <input
              type="tel"
              autoComplete="tel"
              placeholder="07700 900123"
              {...register("telephone")}
              className={inputClass}
            />
            {errors.telephone && (
              <span className="mt-1 block text-[11px] normal-case text-red-600">
                {errors.telephone.message}
              </span>
            )}
          </label>
          <label className="text-xs font-bold uppercase tracking-wide text-[#655D55]">
            Role
            <select {...register("role")} className={inputClass}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-[#D9CDBE] bg-[#F7F2EB] p-4 text-sm font-semibold">
            <input
              type="checkbox"
              {...register("is_active")}
              className="h-4 w-4 accent-[#D79525]"
            />
            Active account
          </label>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#E6DCCE] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-[#D4C6B5] px-4 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-bold text-[#0B0B0B] disabled:opacity-60"
          >
            {isSaving && <LoaderCircle size={15} className="animate-spin" />}
            {user ? "Save changes" : "Create user"}
          </button>
        </div>
      </form>
    </div>
  );
}
