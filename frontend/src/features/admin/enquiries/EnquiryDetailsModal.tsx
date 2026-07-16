import { CalendarDays, Eye, LoaderCircle, Mail, MessageSquareText, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

import { adminApi } from "@/features/admin/adminApi";
import { StatusBadge } from "@/features/admin/components/AdminPage";
import type { AdminEnquiryDetail, DashboardEnquiry } from "@/features/admin/types";
import { formatDate } from "@/features/admin/utils";

export default function EnquiryDetailsModal({
  enquiry,
  onClose,
}: {
  enquiry: DashboardEnquiry | null;
  onClose: () => void;
}) {
  const [details, setDetails] = useState<AdminEnquiryDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enquiry) {
      setDetails(null);
      setError("");
      return;
    }
    let active = true;
    setDetails(null);
    setError("");
    void adminApi.enquiry(enquiry.type, enquiry.id)
      .then((response) => { if (active) setDetails(response); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load enquiry details.");
      });
    return () => { active = false; };
  }, [enquiry]);

  useEffect(() => {
    if (!enquiry) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [enquiry, onClose]);

  if (!enquiry) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="enquiry-details-title">
      <section className="my-6 w-full max-w-3xl overflow-hidden rounded-2xl border border-white/80 bg-[#FFFDF9] shadow-2xl">
        <header className="flex items-start justify-between border-b border-[#E6DCCE] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-500 text-[#0B0B0B]"><Eye size={18} /></span>
            <div><p className="font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-primary-800">{enquiry.type} enquiry</p><h2 id="enquiry-details-title" className="mt-1 text-xl font-black text-[#171411]">Enquiry details</h2></div>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#F1E8DC]" aria-label="Close enquiry details"><X size={18} /></button>
        </header>

        {!details && !error && <div className="grid min-h-72 place-items-center" role="status"><div className="text-center text-[#756B61]"><LoaderCircle className="mx-auto animate-spin text-primary-600" size={28}/><p className="mt-3 text-xs font-bold uppercase tracking-wider">Loading enquiry</p></div></div>}
        {error && <div className="p-8 text-center"><p className="font-bold text-red-700">{error}</p><button type="button" onClick={onClose} className="mt-5 h-10 rounded-xl border border-[#D4C6B5] px-4 text-xs font-bold">Close</button></div>}
        {details && <div className="space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge status={details.status}/><span className="text-xs font-semibold uppercase text-[#81766B]">Received {formatDate(details.created_at)}</span></div>
          <dl className="grid gap-4 rounded-xl border border-[#E3D8CA] bg-[#F7F2EB] p-5 sm:grid-cols-2">
            <div><dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#81766B]"><UserRound size={14}/> Contact</dt><dd className="mt-2 font-bold">{details.name}</dd></div>
            <div><dt className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#81766B]"><Mail size={14}/> Email</dt><dd className="mt-2 break-all font-semibold"><a href={`mailto:${details.email}`} className="text-primary-800 hover:underline">{details.email}</a></dd></div>
            <div className="sm:col-span-2"><dt className="text-[10px] font-bold uppercase tracking-wider text-[#81766B]">Subject</dt><dd className="mt-2 font-bold text-[#37312B]">{details.subject}</dd></div>
            {details.metadata.filter((item) => item.value).map((item) => <div key={item.label}><dt className="text-[10px] font-bold uppercase tracking-wider text-[#81766B]">{item.label}</dt><dd className="mt-2 break-words text-sm font-semibold text-[#514A43]">{item.label === "Handled at" ? formatDate(item.value) : item.value}</dd></div>)}
          </dl>
          <div><h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#655D55]"><MessageSquareText size={16}/> Message</h3><div className="mt-3 min-h-32 whitespace-pre-wrap rounded-xl border border-[#E3D8CA] bg-white p-5 text-sm leading-7 text-[#3F3933]">{details.message || "No message was provided."}</div></div>
          {details.updated_at && <p className="flex items-center gap-2 text-xs text-[#81766B]"><CalendarDays size={14}/> Last updated {formatDate(details.updated_at)}</p>}
        </div>}
      </section>
    </div>
  );
}
