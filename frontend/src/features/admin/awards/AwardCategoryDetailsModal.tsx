import { X } from "lucide-react";
import type { AdminAwardCategory } from "@/features/awards/types";

export default function AwardCategoryDetailsModal({ category, onClose }: { category: AdminAwardCategory | null; onClose: () => void }) {
  if (!category) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="category-preview-title">
      <div className="my-6 w-full max-w-xl overflow-hidden rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E8DED2] px-6 py-4"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-800">Website preview</p><h2 id="category-preview-title" className="mt-1 text-xl font-black">Award category card</h2></div><button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-[#F4ECE1]" aria-label="Close"><X size={19}/></button></div>
        <div className="bg-background-50 p-5 sm:p-8">
          <article className="overflow-hidden border border-background-200/70 bg-background-100">
            <div className="relative h-52 overflow-hidden"><img src={category.image_url} alt={category.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-background-950/70 to-transparent"/><div className="absolute bottom-3 left-3"><div className="flex h-10 w-10 items-center justify-center bg-background-50/20 backdrop-blur-sm"><i className={`${category.icon_class} text-lg text-background-50`}/></div></div></div>
            <div className="p-6 md:p-7"><h3 className="font-heading text-xl font-semibold text-background-950">{category.title}</h3><p className="mt-3 text-sm leading-relaxed text-foreground-600">{category.description}</p><div className="mt-5 space-y-2">{category.highlights.map((item) => <div key={item} className="flex items-center gap-2 text-sm text-background-950"><i className="ri-checkbox-circle-line shrink-0 text-base text-accent-600"/><span>{item}</span></div>)}</div></div>
          </article>
        </div>
      </div>
    </div>
  );
}
