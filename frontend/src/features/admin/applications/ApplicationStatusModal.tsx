import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { StatusBadge } from "@/features/admin/components/AdminPage";
import type {
  ApplicationStatus,
  DashboardApplication,
} from "@/features/admin/types";

const schema = z.object({
  status: z.enum(["submitted", "under_review", "approved"]),
});

type FormValues = z.infer<typeof schema>;

export default function ApplicationStatusModal({
  application,
  isSaving,
  onClose,
  onSave,
}: {
  application: DashboardApplication | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (status: ApplicationStatus) => Promise<void>;
}) {
  const [approvalStatus, setApprovalStatus] = useState<ApplicationStatus | null>(
    null,
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "submitted" },
  });

  useEffect(() => {
    if (!application) return;
    reset({ status: application.status as ApplicationStatus });
    setApprovalStatus(null);
  }, [application, reset]);

  useEffect(() => {
    if (!application) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [application, isSaving, onClose]);

  if (!application) return null;

  const submit = ({ status }: FormValues) => {
    if (status === application.status) {
      onClose();
      return;
    }
    if (status === "approved") {
      setApprovalStatus(status);
      return;
    }
    void onSave(status);
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-status-title"
    >
      <form
        onSubmit={handleSubmit(submit)}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/80 bg-[#FFFDF9] shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#E6DCCE] px-6 py-5">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-primary-800">
              Membership
            </p>
            <h2
              id="application-status-title"
              className="mt-1 text-xl font-black text-[#171411]"
            >
              Edit application status
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#F1E8DC] disabled:opacity-50"
            aria-label="Close status editor"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <dl className="grid gap-4 rounded-xl border border-[#E3D8CA] bg-[#F7F2EB] p-4 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#81766B]">
                Reference
              </dt>
              <dd className="mt-1 font-mono text-xs font-bold text-primary-800">
                {application.reference}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#81766B]">
                Applicant
              </dt>
              <dd className="mt-1 truncate text-sm font-bold">
                {application.name}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#81766B]">
                Current status
              </dt>
              <dd><StatusBadge status={application.status} /></dd>
            </div>
          </dl>

          {approvalStatus ? (
            <div className="rounded-xl border border-[#D79525]/35 bg-[#F6E8D2] p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 shrink-0 text-[#83540C]" size={20} />
                <div>
                  <p className="text-sm font-bold text-[#4F3005]">
                    Approve application?
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#735522]">
                    Approving this application will create a standard IPC user
                    account with a temporary @ipc.invalid login address, link the
                    user to this application, and send a password creation email
                    to the applicant. This action cannot be reversed.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <label className="block text-xs font-bold uppercase tracking-wide text-[#655D55]">
              New status
              <select
                autoFocus
                {...register("status")}
                className="mt-2 h-11 w-full rounded-xl border border-[#D9CDBE] bg-white px-3 text-sm font-semibold outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
              >
                {application.status === "submitted" && (
                  <option value="submitted">Submitted</option>
                )}
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
              </select>
              {errors.status && (
                <span className="mt-1 block text-[11px] normal-case text-red-600">
                  {errors.status.message}
                </span>
              )}
            </label>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E6DCCE] px-6 py-4">
          <button
            type="button"
            onClick={() => approvalStatus ? setApprovalStatus(null) : onClose()}
            disabled={isSaving}
            className="h-10 rounded-xl border border-[#D4C6B5] px-4 text-xs font-bold disabled:opacity-50"
          >
            {approvalStatus ? "Back" : "Cancel"}
          </button>
          {approvalStatus ? (
            <button
              type="button"
              onClick={() => void onSave(approvalStatus)}
              disabled={isSaving}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-bold text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && <LoaderCircle size={15} className="animate-spin" />}
              Approve and Create Account
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-bold text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && <LoaderCircle size={15} className="animate-spin" />}
              Save changes
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
