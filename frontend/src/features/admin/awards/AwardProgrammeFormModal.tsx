import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { AdminAwardCategory, AdminAwardProgramme, AwardProgrammePayload } from "@/features/awards/types";

const schema = z.object({
  title: z.string().trim().min(2, "Title is required.").max(180),
  category: z.string().trim().min(1, "Category is required."),
  description: z.string().trim().min(10, "Add a short programme description.").max(5000),
  criteria: z.string().trim().min(2, "Add at least one criterion.").max(5000),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const emptyValues: FormValues = {
  title: "",
  category: "",
  description: "",
  criteria: "",
  is_active: true,
};

export default function AwardProgrammeFormModal({
  programme,
  categories,
  open,
  isSaving,
  onClose,
  onSave,
}: {
  programme: AdminAwardProgramme | null;
  categories: AdminAwardCategory[];
  open: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (payload: AwardProgrammePayload) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: emptyValues });

  useEffect(() => {
    if (!open) return;
    reset(programme ? {
      title: programme.title,
      category: programme.category,
      description: programme.description,
      criteria: programme.criteria.join("\n"),
      is_active: programme.is_active,
    } : emptyValues);
  }, [open, programme, reset]);

  if (!open) return null;

  const inputClass = "w-full rounded-xl border border-[#D8CCBD] bg-white px-4 py-3 text-sm outline-none transition focus:border-primary-500";
  const errorClass = "mt-1 text-xs text-red-700";

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="award-form-title">
      <form
        onSubmit={handleSubmit(async (values) => onSave({
          title: values.title,
          category: values.category,
          description: values.description,
          criteria: values.criteria.split("\n").map((item) => item.trim()).filter(Boolean),
          is_active: values.is_active,
        }))}
        className="my-6 w-full max-w-2xl rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#E8DED2] px-6 py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-800">Awards</p>
            <h2 id="award-form-title" className="mt-1 text-xl font-black">{programme ? "Edit award programme" : "Create award programme"}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={isSaving} className="grid h-10 w-10 place-items-center rounded-xl hover:bg-[#F4ECE1]" aria-label="Close"><X size={19} /></button>
        </div>

        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <label className="sm:col-span-2 text-xs font-bold text-[#655D55]">
            Programme title <span className="text-red-600">*</span>
            <input required className={`${inputClass} mt-2`} {...register("title")} />
            {errors.title && <span className={errorClass}>{errors.title.message}</span>}
          </label>
          <label className="text-xs font-bold text-[#655D55]">
            Category <span className="text-red-600">*</span>
            <select required className={`${inputClass} mt-2`} {...register("category")}>
              <option value="">Select a category</option>
              {categories.filter((category) => category.is_active || category.slug === programme?.category).map((category) => (
                <option key={category.id} value={category.slug}>{category.title}</option>
              ))}
            </select>
            {errors.category && <span className={errorClass}>{errors.category.message}</span>}
          </label>
          <label className="flex items-center gap-3 self-end rounded-xl border border-[#D8CCBD] bg-white px-4 py-3 text-sm font-bold text-[#554E47]">
            <input type="checkbox" className="h-4 w-4 accent-[#D49124]" {...register("is_active")} />
            Active on website and form
          </label>
          <label className="sm:col-span-2 text-xs font-bold text-[#655D55]">
            Description <span className="text-red-600">*</span>
            <textarea required rows={5} className={`${inputClass} mt-2 resize-y`} {...register("description")} />
            {errors.description && <span className={errorClass}>{errors.description.message}</span>}
          </label>
          <label className="sm:col-span-2 text-xs font-bold text-[#655D55]">
            Criteria <span className="text-red-600">*</span> <span className="font-normal text-[#8A7E72]">— one item per line</span>
            <textarea required rows={6} className={`${inputClass} mt-2 resize-y`} {...register("criteria")} />
            {errors.criteria && <span className={errorClass}>{errors.criteria.message}</span>}
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E8DED2] px-6 py-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="h-11 rounded-xl border border-[#D4C6B5] bg-white px-5 text-xs font-bold">Cancel</button>
          <button type="submit" disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-6 text-xs font-black text-[#0B0B0B] disabled:cursor-wait disabled:opacity-60">
            {isSaving && <LoaderCircle size={16} className="animate-spin" />}
            {isSaving ? "Saving..." : "Save programme"}
          </button>
        </div>
      </form>
    </div>
  );
}
