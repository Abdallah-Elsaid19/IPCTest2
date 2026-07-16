import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { AdminMembershipGrade, AdminMembershipGradePayload, MembershipGradeCode } from "@/features/admin/types";

const codes: MembershipGradeCode[] = ["AffIPC", "MIPC", "AFIPC_L3", "AFIPC_L4", "FIPC"];
const required = z.string().trim().min(1, "This field is required");
const schema = z.object({
  code: z.enum(codes), slug: required, title: required, short_title: z.string(),
  description: z.string(), image_url: required, post_nominal: required,
  pathway_title: required, pathway_description: required,
  evidence_requirements: z.string(), cpd_requirements: z.string(),
  professional_recognition: z.string(), application_pathway: z.string(),
  display_order: z.string().regex(/^\d+$/, "Enter a valid display order"), is_active: z.boolean(),
});
type Values = z.infer<typeof schema>;

const emptyValues: Values = {
  code: "AffIPC", slug: "", title: "", short_title: "", description: "",
  image_url: "", post_nominal: "", pathway_title: "", pathway_description: "",
  evidence_requirements: "", cpd_requirements: "", professional_recognition: "",
  application_pathway: "", display_order: "0", is_active: true,
};

export default function MembershipGradeFormModal({ grade, availableCodes, open, isSaving, onClose, onSave }: {
  grade: AdminMembershipGrade | null; open: boolean; isSaving: boolean;
  availableCodes: MembershipGradeCode[];
  onClose: () => void; onSave: (payload: AdminMembershipGradePayload) => Promise<void>;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: emptyValues });
  useEffect(() => {
    if (!open) return;
    reset(grade ? {
      code: grade.code, slug: grade.slug, title: grade.title, short_title: grade.short_title,
      description: grade.description, image_url: grade.image_url, post_nominal: grade.post_nominal,
      pathway_title: grade.pathway_title, pathway_description: grade.pathway_description,
      evidence_requirements: grade.evidence_requirements, cpd_requirements: grade.cpd_requirements,
      professional_recognition: grade.professional_recognition, application_pathway: grade.application_pathway,
      display_order: String(grade.display_order), is_active: grade.is_active,
    } : { ...emptyValues, code: availableCodes[0] || "AffIPC" });
  }, [availableCodes, grade, open, reset]);
  if (!open) return null;
  const submit = (values: Values) => onSave({ ...values, display_order: Number(values.display_order) });
  return <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true">
    <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-[#FFFDF9] shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E4D8CA] bg-[#FFFDF9] px-6 py-5"><div><h2 className="text-xl font-black">{grade ? "Edit membership grade" : "Create membership grade"}</h2><p className="mt-1 text-xs text-[#7B7167]">Update the fields used across IPC membership pages and applications.</p></div><button type="button" onClick={onClose} disabled={isSaving} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#F4ECE1]"><X size={18}/></button></div>
      <form onSubmit={handleSubmit(submit)} className="grid gap-5 p-6 md:grid-cols-2" noValidate>
        <Field label="Code" error={errors.code?.message}>{grade ? <><input className={`${inputClass} bg-[#EEEAE5]`} value={grade.code} disabled/><input type="hidden" {...register("code")}/></> : <select className={inputClass} {...register("code")}>{availableCodes.map((code) => <option key={code}>{code}</option>)}</select>}</Field>
        <Field label="Slug" error={errors.slug?.message}><input className={inputClass} {...register("slug")}/></Field>
        <Field label="Title" error={errors.title?.message}><input className={inputClass} {...register("title")}/></Field>
        <Field label="Short title"><input className={inputClass} {...register("short_title")}/></Field>
        <Field label="Post nominal" error={errors.post_nominal?.message}><input className={inputClass} {...register("post_nominal")}/></Field>
        <Field label="Display order" error={errors.display_order?.message}><input type="number" min="0" className={inputClass} {...register("display_order")}/></Field>
        <Field wide label="Image URL / path" error={errors.image_url?.message}><input className={inputClass} placeholder="/images/membership/grade.png" {...register("image_url")}/></Field>
        <Field wide label="Description"><textarea rows={3} className={textareaClass} {...register("description")}/></Field>
        <Field wide label="Pathway title" error={errors.pathway_title?.message}><input className={inputClass} {...register("pathway_title")}/></Field>
        <Field wide label="Pathway description" error={errors.pathway_description?.message}><textarea rows={3} className={textareaClass} {...register("pathway_description")}/></Field>
        <Field label="Evidence requirements"><textarea rows={4} className={textareaClass} {...register("evidence_requirements")}/></Field>
        <Field label="CPD requirements"><textarea rows={4} className={textareaClass} {...register("cpd_requirements")}/></Field>
        <Field label="Professional recognition"><textarea rows={4} className={textareaClass} {...register("professional_recognition")}/></Field>
        <Field label="Application pathway"><textarea rows={4} className={textareaClass} {...register("application_pathway")}/></Field>
        <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" className="h-4 w-4 accent-primary-500" {...register("is_active")}/> Active and visible on the website</label>
        <div className="flex justify-end gap-3 md:col-span-2"><button type="button" onClick={onClose} disabled={isSaving} className="h-11 rounded-xl border border-[#D4C6B5] px-5 text-sm font-bold">Cancel</button><button type="submit" disabled={isSaving} className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-6 text-sm font-black disabled:opacity-60">{isSaving && <LoaderCircle size={16} className="animate-spin"/>}{grade ? "Save changes" : "Create grade"}</button></div>
      </form>
    </div>
  </div>;
}

const inputClass = "mt-2 h-11 w-full rounded-xl border border-[#D4C6B5] bg-white px-3 text-sm outline-none focus:border-primary-500";
const textareaClass = "mt-2 w-full rounded-xl border border-[#D4C6B5] bg-white p-3 text-sm outline-none focus:border-primary-500";
function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`${wide ? "md:col-span-2" : ""} text-xs font-bold text-[#655D55]`}>{label}{children}{error && <span className="mt-1 block text-[11px] text-red-600">{error}</span>}</label>;
}
