import { CalendarClock, X } from "lucide-react";

import { StatusBadge } from "@/features/admin/components/AdminPage";
import type { AdminAwardProgramme } from "@/features/awards/types";
import { formatDate } from "@/features/admin/utils";

export default function AwardProgrammeDetailsModal({
  programme,
  onClose,
}: {
  programme: AdminAwardProgramme | null;
  onClose: () => void;
}) {
  if (!programme) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="award-details-title">
      <div className="my-6 w-full max-w-3xl overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E8DED2] px-6 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-800">Website preview</p>
            <h2 id="award-details-title" className="mt-1 text-xl font-black text-[#202A38]">Featured award card</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-[#F4ECE1]" aria-label="Close award programme details"><X size={19} /></button>
        </div>

        <div className="bg-background-100 p-5 sm:p-8">
          <div className="mx-auto mb-4 flex max-w-xl flex-wrap items-center gap-3">
            <StatusBadge status={programme.is_active ? "active" : "inactive"} />
            <span className="rounded-full bg-[#F4ECE1] px-3 py-1 text-[10px] font-bold text-[#6A6158]">/{programme.slug}</span>
          </div>

          <article className="mx-auto max-w-xl border border-background-200/70 bg-background-50 p-6 transition-all duration-300 hover:border-primary-200 md:p-7">
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary-500">
                <i className="ri-award-line text-lg text-background-950" />
              </div>
              <div>
                <span className="mb-2 inline-block rounded-full bg-primary-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary-600">
                  {programme.category_title}
                </span>
                <h3 className="font-heading text-lg font-semibold leading-tight text-background-950">{programme.title}</h3>
              </div>
            </div>
            <p className="mb-4 whitespace-pre-wrap text-sm leading-relaxed text-foreground-600">{programme.description}</p>
            <div className="border-t border-background-200 pt-4">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-500">Criteria</span>
              {programme.criteria.length ? (
                <ul className="space-y-1.5">
                {programme.criteria.map((criterion) => (
                  <li key={criterion} className="flex items-start gap-2 text-xs leading-relaxed text-foreground-600">
                    <i className="ri-check-line mt-0.5 shrink-0 text-accent-600" />
                    {criterion}
                  </li>
                ))}
                </ul>
              ) : <p className="text-xs text-foreground-500">No criteria have been added.</p>}
            </div>
          </article>

          <p className="mx-auto mt-4 flex max-w-xl items-center gap-2 text-xs text-[#7A7066]"><CalendarClock size={15} /> Last updated {formatDate(programme.updated_at)}</p>
        </div>
      </div>
    </div>
  );
}
