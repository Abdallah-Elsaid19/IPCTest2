import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "react-toastify";

import MembershipGateModal from "@/components/feedback/MembershipGateModal";
import { useAuth } from "@/features/auth/AuthContext";
import { panelApi } from "@/features/user-panel/api";
import { apiJson } from "@/lib/api";

type Programme = {
  id: number;
  slug: string;
  title: string;
  criteria: string[];
};

const inputClass = "w-full border border-background-300 bg-background-50 px-4 py-3 text-sm text-background-950 focus:border-primary-500 focus:outline-none";

export default function AwardNominationEntryForm() {
  const { user } = useAuth();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [programme, setProgramme] = useState("");
  const [nomineeType, setNomineeType] = useState<"self" | "other">("self");
  const [nomineeName, setNomineeName] = useState("");
  const [nomineeEmail, setNomineeEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [nomineeRole, setNomineeRole] = useState("");
  const [contribution, setContribution] = useState("");
  const [impact, setImpact] = useState("");
  const [statement, setStatement] = useState("");
  const [evidence, setEvidence] = useState<File[]>([]);
  const [declaration, setDeclaration] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const selected = useMemo(() => programmes.find((item) => item.slug === programme), [programme, programmes]);

  useEffect(() => {
    const controller = new AbortController();
    apiJson<Programme[]>("/api/award-programmes", undefined, { signal: controller.signal, requestSource: "public-award-nomination" })
      .then(setProgrammes)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) toast.error(error instanceof Error ? error.message : "Awards could not be loaded.");
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (nomineeType === "self" && user) {
      setNomineeName(user.name);
      setNomineeEmail(user.email);
    }
  }, [nomineeType, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !user.membership_active) {
      setGateOpen(true);
      return;
    }
    const errors: string[] = [];
    if (!programme) errors.push("Select an award programme.");
    if (!nomineeName.trim()) errors.push("Enter the nominee name.");
    if (nomineeType === "other" && !nomineeEmail.trim()) errors.push("Enter the nominee email.");
    if (!organisation.trim()) errors.push("Enter the nominee organisation.");
    if (!nomineeRole.trim()) errors.push("Enter the nominee role or professional title.");
    if (contribution.trim().length < 20) errors.push("Contribution or achievement must contain at least 20 characters.");
    if (impact.trim().length < 20) errors.push("Impact and outcomes must contain at least 20 characters.");
    if (statement.trim().length < 20) errors.push("Full nomination statement must contain at least 20 characters.");
    if (evidence.length === 0) errors.push("Upload at least one supporting evidence file.");
    if (!declaration) errors.push("Accept the declaration.");
    setValidationErrors(errors);
    if (errors.length > 0) {
      toast.error(errors[0]);
      return;
    }
    const invalidFile = evidence.find((file) => file.size > 10 * 1024 * 1024 || !/\.(pdf|doc|docx)$/i.test(file.name));
    if (invalidFile) {
      toast.error(`${invalidFile.name}: evidence must be PDF, DOC or DOCX and no larger than 10MB.`);
      return;
    }
    setSubmitting(true);
    try {
      const nomination = await panelApi.create<{ public_id: string }>("awards/nominations", {
        programme, nominee_type: nomineeType, nominee_name: nomineeName,
        nominee_email: nomineeEmail, statement,
        responses: { organisation, nominee_role: nomineeRole, contribution, impact, declaration },
      });
      for (const file of evidence) {
        const body = new FormData();
        body.append("file", file);
        await panelApi.create(`awards/nominations/${nomination.public_id}/documents`, body);
      }
      await panelApi.action(`awards/nominations/${nomination.public_id}/submit`);
      toast.success("Your nomination has been submitted for review.");
      setValidationErrors([]);
      setProgramme(""); setContribution(""); setImpact(""); setStatement(""); setEvidence([]); setDeclaration(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The nomination could not be submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={(event) => void submit(event)} noValidate className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="md:col-span-2"><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-600">Award programme *</span><select value={programme} onChange={(event) => setProgramme(event.target.value)} className={inputClass}><option value="">Select an award programme</option>{programmes.map((item) => <option key={item.id} value={item.slug}>{item.title}</option>)}</select></label>
        <label><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-600">Nomination type *</span><select value={nomineeType} onChange={(event) => setNomineeType(event.target.value as "self" | "other")} className={inputClass}><option value="self">Self nomination</option><option value="other">Nominate another person</option></select></label>
        <label><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-600">Nominee name *</span><input value={nomineeName} onChange={(event) => setNomineeName(event.target.value)} className={inputClass} /></label>
        <label><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-600">Nominee email {nomineeType === "other" ? "*" : ""}</span><input type="email" value={nomineeEmail} onChange={(event) => setNomineeEmail(event.target.value)} className={inputClass} /></label>
        <label><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-600">Organisation *</span><input value={organisation} onChange={(event) => setOrganisation(event.target.value)} className={inputClass} /></label>
        <label><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-600">Role or professional title *</span><input value={nomineeRole} onChange={(event) => setNomineeRole(event.target.value)} className={inputClass} /></label>
        <label className="md:col-span-2"><span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-foreground-600"><span>Contribution or achievement *</span><span className="normal-case font-normal">{contribution.trim().length}/20 minimum characters</span></span><textarea rows={4} value={contribution} onChange={(event) => setContribution(event.target.value)} className={inputClass} placeholder="Describe the work, achievement or contribution being nominated." /></label>
        <label className="md:col-span-2"><span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-foreground-600"><span>Impact and outcomes *</span><span className="normal-case font-normal">{impact.trim().length}/20 minimum characters</span></span><textarea rows={4} value={impact} onChange={(event) => setImpact(event.target.value)} className={inputClass} placeholder="Provide measurable outcomes, beneficiaries and professional impact." /></label>
        <label className="md:col-span-2"><span className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-foreground-600"><span>Full nomination statement *</span><span className="normal-case font-normal">{statement.trim().length}/20 minimum characters</span></span><textarea rows={6} value={statement} onChange={(event) => setStatement(event.target.value)} className={inputClass} placeholder="Explain why this nominee meets the award criteria." /></label>
        {selected?.criteria?.length ? <div className="border border-primary-500/25 bg-primary-50 p-5 md:col-span-2"><p className="text-xs font-bold uppercase tracking-wider text-primary-800">Award criteria</p><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground-700">{selected.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul></div> : null}
        <label className="md:col-span-2"><span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-foreground-600">Supporting evidence * <span className="normal-case font-normal">(PDF, DOC or DOCX; max 10MB each)</span></span><input type="file" multiple accept=".pdf,.doc,.docx" onChange={(event) => setEvidence(Array.from(event.target.files || []))} className={`${inputClass} file:mr-4 file:border-0 file:bg-primary-500 file:px-4 file:py-2 file:font-semibold`} />{evidence.length > 0 && <p className="mt-2 text-xs text-foreground-600">{evidence.map((file) => file.name).join(", ")}</p>}</label>
        <label className="flex items-start gap-3 md:col-span-2"><input type="checkbox" checked={declaration} onChange={(event) => setDeclaration(event.target.checked)} className="mt-1 h-5 w-5 accent-primary-600" /><span className="text-sm leading-6 text-foreground-700">I confirm that the information and evidence are accurate, I have permission to submit them, and IPC may review them for this award. *</span></label>
        {validationErrors.length > 0 ? <div role="alert" className="border border-red-300 bg-red-50 p-4 text-sm text-red-800 md:col-span-2"><p className="font-semibold">Please complete the following:</p><ul className="mt-2 list-disc space-y-1 pl-5">{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul></div> : null}
        <button disabled={submitting} className="btn-primary px-6 py-3 disabled:cursor-wait disabled:opacity-60 md:col-span-2">{submitting ? "Submitting nomination…" : "Submit nomination"}</button>
      </form>
      <MembershipGateModal isOpen={gateOpen} onClose={() => setGateOpen(false)} showSignIn={!user} title="IPC membership is required to submit a nomination." description={user ? "Your account does not currently have an active IPC membership. Explore membership options before submitting an award nomination." : "Sign in with an active member account, or explore IPC membership options before submitting an award nomination."} />
    </>
  );
}
