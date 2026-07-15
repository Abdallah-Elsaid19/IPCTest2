import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Mail, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { DashboardEnquiry } from "@/features/admin/types";
import type { AuthUser } from "@/features/auth/types";

const schema = z.object({
  message: z
    .string()
    .trim()
    .min(2, "Enter a reply message.")
    .max(5000, "The reply cannot exceed 5,000 characters."),
});

type FormValues = z.infer<typeof schema>;

export default function EnquiryReplyModal({
  enquiry,
  administrator,
  onClose,
  onSend,
}: {
  enquiry: DashboardEnquiry | null;
  administrator: AuthUser | null;
  onClose: () => void;
  onSend: (message: string) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { message: "" },
  });
  const messageLength = watch("message").length;

  useEffect(() => {
    if (enquiry) reset({ message: "" });
  }, [enquiry, reset]);

  useEffect(() => {
    if (!enquiry) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [enquiry, isSubmitting, onClose]);

  if (!enquiry) return null;

  const submit = async ({ message }: FormValues) => {
    await onSend(message);
  };

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-reply-title"
    >
      <form
        onSubmit={handleSubmit(submit)}
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/80 bg-[#FFFDF9] shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-[#E6DCCE] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-500 text-[#0B0B0B]">
              <Mail size={18} />
            </span>
            <div>
              <p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-primary-800">
                Communications
              </p>
              <h2 id="enquiry-reply-title" className="mt-1 text-xl font-black text-[#171411]">
                Reply to enquiry
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#F1E8DC] disabled:opacity-50"
            aria-label="Close reply form"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <dl className="grid gap-4 rounded-xl border border-[#E3D8CA] bg-[#F7F2EB] p-4 sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#81766B]">From</dt>
              <dd className="mt-1 text-sm font-bold text-[#2D2823]">
                {administrator?.name || "IPC Administrator"}
              </dd>
              {administrator?.email && <dd className="mt-0.5 text-xs text-[#81766B]">{administrator.email}</dd>}
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#81766B]">To</dt>
              <dd className="mt-1 text-sm font-bold text-[#2D2823]">{enquiry.name}</dd>
              <dd className="mt-0.5 text-xs text-[#81766B]">{enquiry.email}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-[#81766B]">Subject</dt>
              <dd className="mt-1 text-sm font-semibold text-[#514A43]">Re: {enquiry.subject}</dd>
            </div>
          </dl>

          <label className="block text-xs font-bold uppercase tracking-wide text-[#655D55]">
            Message
            <textarea
              autoFocus
              rows={9}
              maxLength={5000}
              placeholder="Write your response to this enquiry..."
              {...register("message")}
              className="mt-2 w-full resize-y rounded-xl border border-[#D9CDBE] bg-white px-4 py-3 text-sm font-normal normal-case leading-6 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/15"
            />
            <span className="mt-1.5 flex justify-between gap-4 text-[11px] font-normal normal-case">
              <span className="text-red-600">{errors.message?.message}</span>
              <span className="ml-auto text-[#93877B]">{messageLength} / 5000</span>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E6DCCE] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 rounded-xl border border-[#D4C6B5] px-4 text-xs font-bold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-bold text-[#0B0B0B] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <LoaderCircle size={15} className="animate-spin" /> : <Mail size={15} />}
            {isSubmitting ? "Sending..." : "Send reply"}
          </button>
        </div>
      </form>
    </div>
  );
}
