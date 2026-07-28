import { useCallback, useEffect, useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import { panelApi } from "../api";
import { useLoad } from "../hooks";
import type { Profile } from "../types";
import { Card, ErrorState, inputClass, Loading, PageHeading } from "../components/PanelUI";

const fields: [keyof Profile, string, string?][] = [
  ["first_name", "First name"], ["last_name", "Last name"], ["preferred_name", "Preferred name"], ["phone", "Telephone"],
  ["country", "Country"], ["city", "City"], ["timezone", "Timezone"], ["job_title", "Job title"], ["employer", "Employer"],
  ["industry", "Industry"], ["professional_headline", "Professional headline"], ["linkedin_url", "LinkedIn URL"], ["website_url", "Website"],
];

export default function ProfilePage() {
  const load = useCallback((signal: AbortSignal) => panelApi.profile(signal), []);
  const { data, loading, error, reload, setData } = useLoad(load);
  const [form, setForm] = useState<Profile>();
  const [interests, setInterests] = useState<{ slug: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(data), [data]);
  useEffect(() => { void panelApi.interests().then(setInterests).catch(() => undefined); }, []);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!form) return;
    setSaving(true);
    try { const result = await panelApi.updateProfile(form); setData(result); setForm(result); toast.success("Profile saved"); }
    catch (reason) { toast.error(reason instanceof Error ? reason.message : "Could not save profile"); }
    finally { setSaving(false); }
  }
  if (loading || !form && !error) return <Loading />;
  if (error || !form) return <ErrorState message={error} retry={reload} />;
  return <><PageHeading title="Professional profile" description="Keep your contact and professional details current. Your email is managed by your secure account." /><form onSubmit={(event) => void submit(event)} className="grid gap-6 xl:grid-cols-[1fr_18rem]"><Card><div className="grid gap-4 sm:grid-cols-2">{fields.map(([name, label]) => <label className={name === "professional_headline" ? "sm:col-span-2" : ""} key={name}>{<span className="text-sm font-medium">{label}</span>}<input className={inputClass} value={String(form[name] ?? "")} onChange={(event) => setForm({ ...form, [name]: event.target.value })} /></label>)}<label className="sm:col-span-2"><span className="text-sm font-medium">Biography</span><textarea rows={5} className={inputClass} value={form.biography} onChange={(event) => setForm({ ...form, biography: event.target.value })} /></label><label className="sm:col-span-2"><span className="text-sm font-medium">Qualifications</span><textarea rows={3} className={inputClass} value={form.qualifications} onChange={(event) => setForm({ ...form, qualifications: event.target.value })} /></label><fieldset className="sm:col-span-2"><legend className="text-sm font-medium">Professional interests</legend><div className="mt-3 flex flex-wrap gap-2">{interests.map((interest) => { const selected = form.interests.includes(interest.slug); return <label key={interest.slug} className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-medium ${selected ? "border-primary-600 bg-primary-50 text-primary-800" : "border-background-300"}`}><input type="checkbox" className="sr-only" checked={selected} onChange={() => setForm({ ...form, interests: selected ? form.interests.filter((slug) => slug !== interest.slug) : [...form.interests, interest.slug] })} />{interest.name}</label>; })}</div></fieldset></div><button disabled={saving} className="btn-primary mt-6">{saving ? "Saving…" : "Save profile"}</button></Card><Card className="h-fit"><p className="text-sm font-semibold">Profile completion</p><p className="mt-3 text-4xl font-bold text-primary-700">{form.completion.percentage}%</p><div className="mt-4 h-2 rounded-full bg-background-200"><div className="h-full rounded-full bg-primary-500" style={{ width: `${form.completion.percentage}%` }} /></div><p className="mt-5 text-xs leading-5 text-foreground-500">{form.completion.missing.length ? `Still to add: ${form.completion.missing.join(", ")}` : "Your profile is complete."}</p></Card></form></>;
}
