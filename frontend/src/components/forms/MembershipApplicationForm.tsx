import { useState } from "react";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiJson, fallbackGradeOptions, type GradeOption } from "@/lib/api";
import { membershipApplicationSchema, type MembershipApplicationData } from "@/lib/validations/membershipApplicationSchema";
import { getSelectedFile } from "@/lib/validations/uploadSchema";

const inputClass = "w-full border border-background-300 bg-background-50 px-4 py-3 text-sm text-background-950 focus:border-primary-500 focus:outline-none";
const labelClass = "text-sm font-medium text-background-950";
const errorClass = "text-xs text-red-700";
const acceptedEvidenceTypes = ".pdf,.doc,.docx";

interface MembershipApplicationFormProps {
  gradeOptions?: GradeOption[];
}

type MembershipApplicationValues = MembershipApplicationData;

type TextFieldName = Exclude<keyof MembershipApplicationValues, "cv" | "cpd_file" | "work_file" | "references_file" | "evidence" | "code_of_conduct_consent">;
type FileFieldName = "cv" | "cpd_file" | "work_file" | "references_file" | "evidence";

const textFields: TextFieldName[] = [
  "first_name",
  "last_name",
  "email",
  "phone",
  "country",
  "organisation",
  "job_title",
  "years_experience",
  "grade",
  "professional_background",
  "professional_statement",
  "cpd_evidence",
  "work_evidence",
  "references_text",
];

function fieldError(errors: FieldErrors<MembershipApplicationValues>, name: keyof MembershipApplicationValues) {
  const error = errors[name];
  return typeof error?.message === "string" ? <p className={errorClass}>{error.message}</p> : null;
}

function textInput(
  register: UseFormRegister<MembershipApplicationValues>,
  errors: FieldErrors<MembershipApplicationValues>,
  name: TextFieldName,
  label: string,
  options: Parameters<UseFormRegister<MembershipApplicationValues>>[1] = {},
  type = "text"
) {
  return (
    <label className="space-y-2">
      <span className={labelClass}>{label}</span>
      <input type={type} className={inputClass} {...register(name, options)} />
      {fieldError(errors, name)}
    </label>
  );
}

function textareaInput(
  register: UseFormRegister<MembershipApplicationValues>,
  errors: FieldErrors<MembershipApplicationValues>,
  name: TextFieldName,
  label: string,
  rows: number,
  options: Parameters<UseFormRegister<MembershipApplicationValues>>[1] = {}
) {
  return (
    <label className="space-y-2 md:col-span-2">
      <span className={labelClass}>{label}</span>
      <textarea rows={rows} className={inputClass} {...register(name, options)} />
      {fieldError(errors, name)}
    </label>
  );
}

function fileInput(
  register: UseFormRegister<MembershipApplicationValues>,
  errors: FieldErrors<MembershipApplicationValues>,
  name: FileFieldName,
  label: string
) {
  return (
    <label className="space-y-2">
      <span className={labelClass}>{label} <span className="text-red-600">*</span></span>
      <input type="file" accept={acceptedEvidenceTypes} className={`${inputClass} ${errors[name] ? "border-red-500" : ""}`} {...register(name)} />
      {fieldError(errors, name)}
    </label>
  );
}

export default function MembershipApplicationForm({ gradeOptions = fallbackGradeOptions }: MembershipApplicationFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MembershipApplicationValues>({
    resolver: zodResolver(membershipApplicationSchema),
    mode: "onTouched",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      country: "",
      organisation: "",
      job_title: "",
      years_experience: "",
      grade: gradeOptions[0]?.value || "",
      professional_background: "",
      professional_statement: "",
      cpd_evidence: "",
      work_evidence: "",
      references_text: "",
      code_of_conduct_consent: false,
    },
  });

  function resetForm() {
    reset({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      country: "",
      organisation: "",
      job_title: "",
      years_experience: "",
      grade: gradeOptions[0]?.value || "",
      professional_background: "",
      professional_statement: "",
      cpd_evidence: "",
      work_evidence: "",
      references_text: "",
      cv: undefined as unknown as FileList,
      cpd_file: undefined as unknown as FileList,
      work_file: undefined as unknown as FileList,
      references_file: undefined as unknown as FileList,
      evidence: undefined as unknown as FileList,
      code_of_conduct_consent: false,
    });

    document.querySelectorAll<HTMLInputElement>("input[type='file']").forEach((input) => {
      input.value = "";
    });
  }

  async function onSubmit(values: MembershipApplicationValues) {
    setStatus("idle");
    setMessage("");
    try {
      const data = new FormData();
      textFields.forEach((field) => data.set(field, values[field] || ""));
      data.set("code_of_conduct_consent", values.code_of_conduct_consent ? "true" : "false");
      (["cv", "cpd_file", "work_file", "references_file", "evidence"] as FileFieldName[]).forEach((field) => {
        const file = getSelectedFile(values[field]);
        if (file) data.set(field, file);
      });

      const result = await apiJson<{ id: string; application_reference?: string }>("/api/applications", data);
      setStatus("success");
      setMessage(`Application received. Reference: ${result.application_reference || result.id}`);
      resetForm();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Submission failed");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-5" encType="multipart/form-data" noValidate>
      {textInput(register, errors, "first_name", "First name")}
      {textInput(register, errors, "last_name", "Last name")}
      {textInput(register, errors, "email", "Email", {}, "email")}
      {textInput(register, errors, "phone", "Phone")}
      {textInput(register, errors, "country", "Country")}
      {textInput(register, errors, "organisation", "Organisation")}
      {textInput(register, errors, "job_title", "Job title")}
      {textInput(register, errors, "years_experience", "Years of experience")}

      <label className="space-y-2 md:col-span-2">
        <span className={labelClass}>Selected membership grade</span>
        <select className={inputClass} {...register("grade")}>
          {gradeOptions.map((grade) => <option key={grade.value} value={grade.value}>{grade.label}</option>)}
        </select>
        {fieldError(errors, "grade")}
      </label>

      {textareaInput(register, errors, "professional_background", "Professional background", 4)}
      {textareaInput(register, errors, "professional_statement", "Professional statement", 5)}
      {textareaInput(register, errors, "cpd_evidence", "CPD evidence summary", 3)}
      {textareaInput(register, errors, "work_evidence", "Work evidence summary", 3)}
      {textareaInput(register, errors, "references_text", "References", 3)}

      {fileInput(register, errors, "cv", "CV / role summary upload")}
      {fileInput(register, errors, "cpd_file", "CPD evidence upload")}
      {fileInput(register, errors, "work_file", "Work evidence upload")}
      {fileInput(register, errors, "references_file", "References upload")}
      {fileInput(register, errors, "evidence", "Additional evidence upload")}

      <label className="md:col-span-2 flex flex-col gap-2 text-sm text-foreground-700">
        <span className="flex gap-3">
          <input type="checkbox" className="mt-1" {...register("code_of_conduct_consent")} />
          <span>I consent to the IPC code of conduct and evidence-based review process.</span>
        </span>
        {fieldError(errors, "code_of_conduct_consent")}
      </label>

      <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-4">
        <button disabled={isSubmitting} className="btn-primary inline-flex justify-center px-7 py-3 disabled:opacity-60">
          {isSubmitting ? "Submitting..." : "Submit application"}
        </button>
        {message && <p role="status" className={`text-sm ${status === "error" ? "text-red-700" : "text-accent-700"}`}>{message}</p>}
      </div>
    </form>
  );
}


