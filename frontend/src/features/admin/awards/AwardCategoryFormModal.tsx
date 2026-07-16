import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { AdminAwardCategory, AwardCategoryPayload } from "@/features/awards/types";

const schema = z.object({
  title: z.string().trim().min(2, "Title is required.").max(120),
  description: z.string().trim().min(10, "Description must be at least 10 characters.").max(5000),
  image_url: z.string().trim().url("Enter a complete image URL."),
  icon_class: z.string().trim().min(2, "Icon class is required.").max(80),
  highlights: z.string().trim().min(2, "Add at least one highlight.").max(5000),
  sort_order: z.string().regex(/^\d+$/, "Enter a positive whole number."),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
const emptyValues: FormValues = { title: "", description: "", image_url: "", icon_class: "ri-award-line", highlights: "", sort_order: "0", is_active: true };

export default function AwardCategoryFormModal({ category, open, isSaving, onClose, onSave }: {
  category: AdminAwardCategory | null;
  open: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: AwardCategoryPayload) => Promise<void>;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues });
  useEffect(() => {
    if (!open) return;
    reset(category ? {
      title: category.title,
      description: category.description,
      image_url: category.image_url,
      icon_class: category.icon_class,
      highlights: category.highlights.join("\n"),
      sort_order: String(category.sort_order),
      is_active: category.is_active,
    } : emptyValues);
  }, [category, open, reset]);
  if (!open) return null;

  const inputClass = "mt-2 w-full rounded-xl border border-[#D8CCBD] bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-500";
  const errorClass = "mt-1 block text-xs text-red-700";
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="category-form-title">
      <form onSubmit={handleSubmit(async (values) => onSave({
        title: values.title,
        description: values.description,
        image_url: values.image_url,
        icon_class: values.icon_class,
        highlights: values.highlights.split("\n").map((item) => item.trim()).filter(Boolean),
        sort_order: Number(values.sort_order),
        is_active: values.is_active,
      }))} className="my-6 w-full max-w-2xl rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E8DED2] px-6 py-5">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-800">Awards</p><h2 id="category-form-title" className="mt-1 text-xl font-black">{category ? "Edit award category" : "Create award category"}</h2></div>
          <button type="button" onClick={onClose} disabled={isSaving} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-[#F4ECE1]" aria-label="Close"><X size={19}/></button>
        </div>
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <label className="sm:col-span-2 text-xs font-bold text-[#655D55]">Category title <span className="text-red-600">*</span><input required className={inputClass} {...register("title")}/>{errors.title && <span className={errorClass}>{errors.title.message}</span>}</label>
          <label className="sm:col-span-2 text-xs font-bold text-[#655D55]">Description <span className="text-red-600">*</span><textarea required rows={4} className={`${inputClass} resize-y`} {...register("description")}/>{errors.description && <span className={errorClass}>{errors.description.message}</span>}</label>
          <label className="sm:col-span-2 text-xs font-bold text-[#655D55]">Image URL <span className="text-red-600">*</span><input required type="url" className={inputClass} {...register("image_url")}/>{errors.image_url && <span className={errorClass}>{errors.image_url.message}</span>}</label>
          <label className="text-xs font-bold text-[#655D55]">Icon class <span className="text-red-600">*</span><input required placeholder="ri-award-line" className={inputClass} {...register("icon_class")}/>{errors.icon_class && <span className={errorClass}>{errors.icon_class.message}</span>}</label>
          <label className="text-xs font-bold text-[#655D55]">Display order <span className="text-red-600">*</span><input required type="number" min="0" className={inputClass} {...register("sort_order")}/>{errors.sort_order && <span className={errorClass}>{errors.sort_order.message}</span>}</label>
          <label className="sm:col-span-2 text-xs font-bold text-[#655D55]">Highlights <span className="text-red-600">*</span> <span className="font-normal text-[#8A7E72]">— one item per line</span><textarea required rows={6} className={`${inputClass} resize-y`} {...register("highlights")}/>{errors.highlights && <span className={errorClass}>{errors.highlights.message}</span>}</label>
          <label className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-[#D8CCBD] bg-white px-4 py-3 text-sm font-bold text-[#554E47]"><input type="checkbox" className="h-4 w-4 accent-[#D49124]" {...register("is_active")}/> Active on website</label>
        </div>
        <div className="flex justify-end gap-3 border-t border-[#E8DED2] px-6 py-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="h-11 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-bold">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-6 text-xs font-black text-[#0B0B0B] disabled:cursor-wait disabled:opacity-60">{isSaving && <LoaderCircle size={16} className="animate-spin"/>}{isSaving ? "Saving..." : "Save category"}</button>
        </div>
      </form>
    </div>
  );
}
