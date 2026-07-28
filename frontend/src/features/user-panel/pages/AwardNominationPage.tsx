import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import MembershipGateModal from "@/components/feedback/MembershipGateModal";
import { useAuth } from "@/features/auth/AuthContext";
import { apiJson } from "@/lib/api";
import { panelApi } from "../api";
import { Card, ErrorState, inputClass, Loading, PageHeading } from "../components/PanelUI";
import { useLoad } from "../hooks";

type Award = { slug: string; title: string; description: string; criteria: string[]; category: string };
type Nomination = {
  public_id: string;
  programme: string;
  programme_title: string;
  nominee_type: "self" | "other";
  nominee_name: string;
  nominee_email: string;
  statement: string;
  responses: Record<string, unknown>;
  status: string;
  documents: { id: number; name: string; size: number; download_url: string }[];
};
type FormState = Pick<Nomination, "nominee_type" | "nominee_name" | "nominee_email" | "statement">;

export default function AwardNominationPage({ edit = false }: { edit?: boolean }) {
  const { user } = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const load = useCallback(async (signal: AbortSignal) => {
    if (edit) {
      const nomination = await apiJson<Nomination>(`/api/user/awards/nominations/${params.nominationId}`, undefined, { signal, requestSource: "user-panel" });
      return { award: { slug: nomination.programme, title: nomination.programme_title, description: "", criteria: [], category: "Award" }, nomination };
    }
    const award = await apiJson<Award>(`/api/user/awards/${params.id}`, undefined, { signal, requestSource: "user-panel" });
    return { award, nomination: null };
  }, [edit, params.id, params.nominationId]);
  const { data, loading, error, reload } = useLoad(load);
  const [form, setForm] = useState<FormState>({ nominee_type: "self", nominee_name: "", nominee_email: "", statement: "" });
  const [organisation, setOrganisation] = useState("");
  const [nomineeRole, setNomineeRole] = useState("");
  const [contribution, setContribution] = useState("");
  const [impact, setImpact] = useState("");
  const [declaration, setDeclaration] = useState(false);
  const [evidence, setEvidence] = useState<File[]>([]);
  const [saving, setSaving] = useState<"draft" | "submit" | "">("");
  const [gateOpen, setGateOpen] = useState(false);

  useEffect(() => {
    if (data?.nomination) setForm({
      nominee_type: data.nomination.nominee_type,
      nominee_name: data.nomination.nominee_name === "My nomination" ? "" : data.nomination.nominee_name,
      nominee_email: data.nomination.nominee_email,
      statement: data.nomination.statement,
    });
    if (data?.nomination) {
      setOrganisation(String(data.nomination.responses.organisation || ""));
      setNomineeRole(String(data.nomination.responses.nominee_role || ""));
      setContribution(String(data.nomination.responses.contribution || ""));
      setImpact(String(data.nomination.responses.impact || ""));
      setDeclaration(Boolean(data.nomination.responses.declaration));
    }
  }, [data]);

  async function save(mode: "draft" | "submit") {
    if (!data) return;
    if (!user?.membership_active) {
      setGateOpen(true);
      return;
    }
    if (mode === "submit" && (!form.nominee_name.trim() || !organisation.trim() || !nomineeRole.trim() || contribution.trim().length < 20 || impact.trim().length < 20 || form.statement.trim().length < 50 || !declaration || (!data.nomination?.documents.length && evidence.length === 0))) {
      toast.error("Complete every required field, accept the declaration, and upload evidence.");
      return;
    }
    setSaving(mode);
    try {
      const payload = { ...form, responses: { organisation, nominee_role: nomineeRole, contribution, impact, declaration } };
      const nomination = data.nomination
        ? await panelApi.update<Nomination>(`awards/nominations/${data.nomination.public_id}`, payload)
        : await panelApi.create<Nomination>("awards/nominations", { programme: data.award.slug, ...payload });
      for (const file of evidence) {
        const body = new FormData();
        body.append("file", file);
        await panelApi.create(`awards/nominations/${nomination.public_id}/documents`, body);
      }
      if (mode === "submit") {
        await panelApi.action(`awards/nominations/${nomination.public_id}/submit`);
        toast.success("Nomination submitted for review");
      } else {
        toast.success("Nomination saved as draft");
      }
      navigate("/user/awards");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Nomination could not be saved.");
    } finally {
      setSaving("");
    }
  }

  function submit(event: FormEvent) { event.preventDefault(); void save("submit"); }
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error} retry={reload} />;
  if (data.nomination && !["draft", "more_info_required"].includes(data.nomination.status)) {
    return <ErrorState message="This nomination has already been submitted and can no longer be edited." />;
  }
  return <><PageHeading title={data.nomination ? `Continue: ${data.award.title}` : data.award.title} description="Complete every required section and attach evidence before submitting to the IPC awards team." /><form onSubmit={submit}><Card className="max-w-3xl"><div className="grid gap-5 sm:grid-cols-2"><label><span className="text-sm font-medium">Who are you nominating?</span><select className={inputClass} value={form.nominee_type} onChange={(event) => setForm({ ...form, nominee_type: event.target.value as FormState["nominee_type"] })}><option value="self">Myself</option><option value="other">Another person</option></select></label><label><span className="text-sm font-medium">Nominee name *</span><input required className={inputClass} value={form.nominee_name} onChange={(event) => setForm({ ...form, nominee_name: event.target.value })} /></label><label><span className="text-sm font-medium">Nominee email {form.nominee_type === "other" ? "*" : ""}</span><input required={form.nominee_type === "other"} type="email" className={inputClass} value={form.nominee_email} onChange={(event) => setForm({ ...form, nominee_email: event.target.value })} /></label><label><span className="text-sm font-medium">Organisation *</span><input className={inputClass} value={organisation} onChange={(event) => setOrganisation(event.target.value)} /></label><label className="sm:col-span-2"><span className="text-sm font-medium">Role or professional title *</span><input className={inputClass} value={nomineeRole} onChange={(event) => setNomineeRole(event.target.value)} /></label><label className="sm:col-span-2"><span className="text-sm font-medium">Contribution or achievement *</span><textarea rows={4} className={inputClass} value={contribution} onChange={(event) => setContribution(event.target.value)} /></label><label className="sm:col-span-2"><span className="text-sm font-medium">Impact and outcomes *</span><textarea rows={4} className={inputClass} value={impact} onChange={(event) => setImpact(event.target.value)} /></label><label className="sm:col-span-2"><span className="text-sm font-medium">Full nomination statement *</span><textarea required minLength={50} rows={8} className={inputClass} placeholder="Explain the nominee's achievements and why they should receive this award…" value={form.statement} onChange={(event) => setForm({ ...form, statement: event.target.value })} /><span className="mt-1 block text-xs text-foreground-500">{form.statement.length} characters</span></label>{data.award.criteria.length > 0 && <div className="rounded-xl border border-primary-500/25 bg-primary-50 p-4 sm:col-span-2"><p className="text-sm font-semibold">Award criteria</p><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground-600">{data.award.criteria.map((item) => <li key={item}>{item}</li>)}</ul></div>}<label className="sm:col-span-2"><span className="text-sm font-medium">Supporting evidence * (PDF, DOC or DOCX; max 10MB)</span><input type="file" multiple accept=".pdf,.doc,.docx" className={inputClass} onChange={(event) => setEvidence(Array.from(event.target.files || []))} />{data.nomination?.documents.map((document) => <a key={document.id} href={document.download_url} className="mt-2 block text-xs font-semibold text-primary-700">{document.name}</a>)}</label><label className="flex items-start gap-3 sm:col-span-2"><input type="checkbox" checked={declaration} onChange={(event) => setDeclaration(event.target.checked)} className="mt-1 h-5 w-5 accent-primary-600" /><span className="text-sm text-foreground-600">I confirm that the information and evidence are accurate and IPC may review them for this award. *</span></label></div><div className="mt-7 flex flex-wrap justify-end gap-3"><Link to="/user/awards" className="btn-secondary">Cancel</Link><button type="button" disabled={Boolean(saving)} onClick={() => void save("draft")} className="btn-secondary">{saving === "draft" ? "Saving…" : "Save draft"}</button><button disabled={Boolean(saving)} className="btn-primary">{saving === "submit" ? "Submitting…" : "Submit nomination"}</button></div></Card></form><MembershipGateModal isOpen={gateOpen} onClose={() => setGateOpen(false)} title="Active IPC membership is required." description="Explore IPC membership options before submitting an award nomination." /></>;
}
