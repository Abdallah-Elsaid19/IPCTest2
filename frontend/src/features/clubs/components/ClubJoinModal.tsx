import { BriefcaseBusiness, Building2, LoaderCircle, MapPin, X } from "lucide-react";
import { useState, type FormEvent } from "react";

export type ClubJoinDetails = {
  professional_role: string;
  organisation: string;
  location: string;
};

export default function ClubJoinModal({
  clubName,
  open,
  saving,
  onClose,
  onSubmit,
}: {
  clubName: string;
  open: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (details: ClubJoinDetails) => void;
}) {
  const [details, setDetails] = useState<ClubJoinDetails>({
    professional_role: "",
    organisation: "",
    location: "",
  });

  if (!open) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      professional_role: details.professional_role.trim(),
      organisation: details.organisation.trim(),
      location: details.location.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center overflow-y-auto bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="club-join-title" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <section className="my-8 w-full max-w-2xl overflow-hidden rounded-[22px] border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_28px_90px_rgba(0,0,0,.3)]">
        <header className="flex items-start justify-between gap-3 border-b border-[#E5DACD] px-4 py-5 sm:px-7 sm:py-6 md:px-8">
          <div><p className="font-mono text-[10px] font-black uppercase tracking-[.22em] text-primary-800">Club membership request</p><h2 id="club-join-title" className="mt-2 text-2xl font-black text-[#1E1B18]">Join {clubName}</h2><p className="mt-2 text-sm text-[#756B61]">Tell the club team about your professional context before submitting.</p></div>
          <button type="button" disabled={saving} onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl hover:bg-[#F2EADF] disabled:opacity-50" aria-label="Close"><X size={20} /></button>
        </header>

        <form onSubmit={submit}>
          <div className="grid gap-5 px-4 py-5 sm:px-7 sm:py-7 md:px-8">
            <JoinField icon={BriefcaseBusiness} label="Professional role" value={details.professional_role} onChange={(value) => setDetails((current) => ({ ...current, professional_role: value }))} placeholder="e.g. Project Controls Engineer" />
            <JoinField icon={Building2} label="Organisation" value={details.organisation} onChange={(value) => setDetails((current) => ({ ...current, organisation: value }))} placeholder="Your employer or organisation" />
            <JoinField icon={MapPin} label="Location" value={details.location} onChange={(value) => setDetails((current) => ({ ...current, location: value }))} placeholder="City or region" />
            <p className="rounded-xl border border-primary-200 bg-primary-50 p-4 text-xs leading-6 text-[#6F5A35]">These details will be added to your IPC professional profile and shown to club administrators when they review your request.</p>
          </div>
          <footer className="flex flex-col-reverse gap-3 border-t border-[#E5DACD] px-4 py-4 sm:flex-row sm:justify-end sm:px-7 sm:py-5 md:px-8">
            <button type="button" disabled={saving} onClick={onClose} className="h-12 w-full rounded-xl border border-[#D7C9B8] bg-white px-5 text-sm font-black hover:bg-[#F7F1E9] disabled:opacity-50 sm:w-auto sm:px-6">Cancel</button>
            <button disabled={saving} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-5 text-sm font-black text-[#171411] hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto sm:min-w-44 sm:px-6">{saving && <LoaderCircle className="animate-spin" size={17} />}{saving ? "Submitting…" : "Submit request"}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function JoinField({ icon: Icon, label, value, onChange, placeholder }: { icon: typeof BriefcaseBusiness; label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label><span className="flex items-center gap-2 text-xs font-black uppercase tracking-[.1em] text-[#6D655E]"><Icon size={15} className="text-primary-700" />{label}</span><input required maxLength={180} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-12 w-full rounded-xl border border-[#D8CCBD] bg-white px-4 text-sm text-[#2D2925] outline-none placeholder:text-[#A19890] focus:border-primary-500 focus:ring-2 focus:ring-primary-200" /></label>;
}
