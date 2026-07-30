import {
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  CircleDashed,
  FileCheck2,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

import { apiJson, type MembershipGrade } from "@/lib/api";
import { notifications } from "@/lib/notifications";
import { panelApi, rows } from "../api";
import { Card, Empty, ErrorState, inputClass, Loading, PageHeading, Status } from "../components/PanelUI";
import { useLoad } from "../hooks";
import type { Profile } from "../types";

type Evidence = { id: number; name: string; type: string; size: number };
type MembershipApplication = {
  application_reference: string;
  grade: string;
  grade_title: string;
  status: string;
  current_step: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  organisation: string;
  contact_preference: string;
  grade_specific_data: Record<string, unknown>;
  code_of_conduct_consent: boolean;
  privacy_consent: boolean;
  submitted_at: string | null;
  updated_at: string;
  documents: Evidence[];
};
type MembershipData = {
  applications: MembershipApplication[];
  grades: MembershipGrade[];
  profile: Profile;
};

const gradeDescriptions: Record<string, string> = {
  AffIPC: "Entry affiliation and connection with the professional project-controls community.",
  MIPC: "Professional membership for practitioners developing recognised project-controls competence.",
  AFIPC_L3: "Foundation practitioner recognition supported by technical knowledge and evidence.",
  AFIPC_L4: "Applied practitioner recognition for independent work on live projects and programmes.",
  FIPC: "Senior professional recognition for leadership, assurance and contribution to the profession.",
};

function formatDate(value?: string | null) {
  if (!value) return "Not submitted";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(value));
}

function displayCode(code: string) {
  return code.replace("_", " ");
}

export default function MembershipPage() {
  const load = useCallback(async (signal: AbortSignal): Promise<MembershipData> => {
    const [applications, grades, profile] = await Promise.all([
      panelApi.list<MembershipApplication>("membership/applications", signal),
      apiJson<MembershipGrade[]>("/api/membership-grades", undefined, { signal, requestSource: "user-panel" }),
      panelApi.profile(signal),
    ]);
    return { applications: rows(applications), grades, profile };
  }, []);
  const { data, loading, error, reload } = useLoad(load);
  const [applying, setApplying] = useState(false);

  const application = data?.applications[0];
  const currentGrade = data?.grades.find((grade) => grade.code === application?.grade);
  const currentIndex = data?.grades.findIndex((grade) => grade.code === application?.grade) ?? -1;
  const nextGrade = data && currentIndex >= 0 ? data.grades[currentIndex + 1] : undefined;
  const readiness = useMemo(() => application ? calculateReadiness(application) : null, [application]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error} retry={reload} />;

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setApplying(true);
    try {
      await panelApi.create("membership/applications", {
        grade: values.get("grade"),
        first_name: values.get("first_name"),
        last_name: values.get("last_name"),
        email: values.get("email"),
        phone: values.get("phone"),
        country: values.get("country"),
        organisation: values.get("organisation"),
        contact_preference: "email",
        grade_specific_data: {},
        code_of_conduct_consent: false,
        privacy_consent: false,
        current_step: 1,
      });
      notifications.success("Membership draft saved");
      reload();
    } catch (reason) {
      notifications.error(reason instanceof Error ? reason.message : "Could not save draft");
    } finally {
      setApplying(false);
    }
  }

  if (!application) {
    return (
      <>
        <PageHeading
          title="My membership"
          description="Choose the IPC professional grade that matches your experience and begin a secure application."
        />
        <GradePathway grades={data.grades} currentCode="" approved={false} />
        <Card className="mt-6">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
            <div className="rounded-2xl bg-[#151718] p-6 text-white">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-primary-400">Start your pathway</p>
              <h2 className="mt-4 text-2xl font-black">Create a membership application</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">Your information is saved as a draft. You can prepare evidence and submit when every declaration is complete.</p>
            </div>
            <form onSubmit={(event) => void create(event)} className="grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="text-sm font-medium">Membership grade</span><select required name="grade" className={inputClass}>{data.grades.map((grade) => <option key={grade.code} value={grade.code}>{grade.title}</option>)}</select></label>
              {[
                ["first_name", "First name", "text", data.profile.first_name],
                ["last_name", "Last name", "text", data.profile.last_name],
                ["email", "Email", "email", data.profile.email],
                ["phone", "UK telephone", "tel", data.profile.phone],
                ["country", "Country", "text", data.profile.country],
                ["organisation", "Organisation", "text", data.profile.employer],
              ].map(([name, label, type, defaultValue]) => (
                <label key={name}><span className="text-sm font-medium">{label}</span><input required={["first_name", "last_name", "email", "phone"].includes(name)} defaultValue={defaultValue} name={name} type={type} className={inputClass} /></label>
              ))}
              <button disabled={applying} className="btn-primary sm:col-span-2 sm:justify-self-start">{applying ? "Saving..." : "Save membership draft"}</button>
            </form>
          </div>
        </Card>
        {!data.grades.length && <Empty title="Membership applications unavailable" text="No active membership grades are configured." />}
      </>
    );
  }

  const approved = application.status === "approved";
  const memberName = `${application.first_name} ${application.last_name}`.trim() || data.profile.email;

  return (
    <>
      <PageHeading
        title="My membership"
        description="Review your IPC grade, application progress, professional pathway and supporting evidence."
        action={
          <div className="flex flex-wrap gap-2">
            {currentGrade && <Link to={`/membership/${currentGrade.slug}`} className="btn-secondary"><FileText size={16} />Grade guidance</Link>}
            {nextGrade && approved && <Link to={`/membership/${nextGrade.slug}`} className="btn-primary">Explore {nextGrade.post_nominal || displayCode(nextGrade.code)}<ArrowRight size={16} /></Link>}
          </div>
        }
      />

      <section className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(110deg,#102326_0%,#16191B_55%,#352C18_100%)] p-6 text-white shadow-[0_24px_60px_rgba(31,29,23,.18)] md:p-8">
        <div className="absolute -bottom-24 -right-12 h-72 w-72 rounded-full border border-primary-400/20" />
        <div className="absolute -bottom-14 -right-2 h-52 w-52 rounded-full bg-black/10" />
        <div className="relative">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-primary-300">
                {approved ? "Current IPC grade" : "Membership application"}
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-.04em] md:text-4xl">
                {currentGrade?.short_title || application.grade_title}
                {currentGrade?.post_nominal && <span className="text-primary-300"> · {currentGrade.post_nominal}</span>}
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
                {currentGrade?.description || currentGrade?.pathway_description || gradeDescriptions[application.grade]}
              </p>
            </div>
            <Status value={approved ? "active" : application.status} />
          </div>
          <div className="mt-7 grid gap-5 border-t border-white/15 pt-5 sm:grid-cols-2 xl:grid-cols-4">
            <HeroDetail label="Application reference" value={application.application_reference} />
            <HeroDetail label={approved ? "Approved / updated" : "Submitted"} value={formatDate(approved ? application.updated_at : application.submitted_at)} />
            <HeroDetail label="Evidence files" value={`${application.documents.length} uploaded`} />
            <HeroDetail label="Next grade" value={nextGrade?.post_nominal || nextGrade?.short_title || "Highest IPC grade"} />
          </div>
        </div>
      </section>

      <div className="mt-6">
        <GradePathway grades={data.grades} currentCode={application.grade} approved={approved} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ReadinessPanel application={application} readiness={readiness!} />
        <CredentialPanel
          application={application}
          grade={currentGrade}
          memberName={memberName}
          approved={approved}
          profile={data.profile}
        />
      </div>

      <EvidencePanel application={application} />
    </>
  );
}

function GradePathway({ grades, currentCode, approved }: { grades: MembershipGrade[]; currentCode: string; approved: boolean }) {
  const currentIndex = grades.findIndex((grade) => grade.code === currentCode);
  return (
    <Card>
      <h2 className="font-black text-[#27221E]">IPC professional pathway</h2>
      <p className="mt-1 text-xs text-[#7B7168]">Recognition progresses through competence, responsibility, evidence and professional contribution.</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {grades.map((grade, index) => {
          const current = grade.code === currentCode;
          const completed = approved && currentIndex >= 0 && index < currentIndex;
          return (
            <article key={grade.code} className={`min-h-40 rounded-xl border p-4 ${
              current ? "border-primary-500 bg-primary-50 shadow-[inset_4px_0_0_#D59A2A]" : "border-[#E2D8CB] bg-white"
            }`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[9px] font-black uppercase tracking-[.15em] text-primary-800">{grade.post_nominal || displayCode(grade.code)}</span>
                <span className={`rounded-full px-2 py-1 text-[8px] font-black uppercase ${
                  current ? "bg-primary-200 text-primary-900" : completed ? "bg-emerald-100 text-emerald-800" : "bg-[#F0ECE7] text-[#7A7066]"
                }`}>{current ? "Current" : completed ? "Completed" : index === currentIndex + 1 ? "Next" : "Pathway"}</span>
              </div>
              <h3 className="mt-4 text-sm font-black">{grade.short_title || grade.title}</h3>
              <p className="mt-2 text-xs leading-5 text-[#776D64]">{grade.description || gradeDescriptions[grade.code] || grade.pathway_description}</p>
            </article>
          );
        })}
      </div>
    </Card>
  );
}

function calculateReadiness(application: MembershipApplication) {
  const checks = [
    {
      label: "Personal and contact details",
      description: "Name, email and telephone are complete.",
      complete: Boolean(application.first_name && application.last_name && application.email && application.phone),
    },
    {
      label: "Professional context",
      description: "Country and organisation support the application.",
      complete: Boolean(application.country && application.organisation),
    },
    {
      label: "Code of conduct declaration",
      description: "IPC professional conduct consent has been accepted.",
      complete: application.code_of_conduct_consent,
    },
    {
      label: "Privacy declaration",
      description: "Application processing consent has been accepted.",
      complete: application.privacy_consent,
    },
    {
      label: "Supporting evidence",
      description: `${application.documents.length} evidence file${application.documents.length === 1 ? "" : "s"} uploaded.`,
      complete: application.documents.length > 0,
    },
  ];
  const percentage = Math.round((checks.filter((item) => item.complete).length / checks.length) * 100);
  return { checks, percentage };
}

function ReadinessPanel({ application, readiness }: { application: MembershipApplication; readiness: ReturnType<typeof calculateReadiness> }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="font-black">Application readiness</h2><p className="mt-1 text-xs text-[#7A7066]">Calculated from the information and evidence saved in your application.</p></div>
        <strong className="text-2xl font-black">{readiness.percentage}%</strong>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#E9E2D8]"><div className="h-full rounded-full bg-primary-500" style={{ width: `${readiness.percentage}%` }} /></div>
      <div className="mt-5 space-y-2">
        {readiness.checks.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-xl border border-[#E8DED2] bg-[#FBF8F3] p-3.5">
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${item.complete ? "bg-emerald-100 text-emerald-700" : "bg-primary-100 text-primary-800"}`}>
              {item.complete ? <Check size={17} /> : <CircleDashed size={17} />}
            </span>
            <div className="min-w-0 flex-1"><p className="text-xs font-black">{item.label}</p><p className="mt-1 text-[10px] text-[#81766C]">{item.description}</p></div>
            <span className="text-[9px] font-black uppercase text-[#776D64]">{item.complete ? "Complete" : "Needed"}</span>
          </div>
        ))}
      </div>
      {["draft", "more_info_required"].includes(application.status) && (
        <Link to="/user/membership/applications" className="btn-primary mt-5">Review application<ArrowRight size={16} /></Link>
      )}
    </Card>
  );
}

function CredentialPanel({
  application,
  grade,
  memberName,
  approved,
  profile,
}: {
  application: MembershipApplication;
  grade?: MembershipGrade;
  memberName: string;
  approved: boolean;
  profile: Profile;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div><h2 className="font-black">{approved ? "Professional recognition preview" : "Application summary"}</h2><p className="mt-1 text-xs text-[#7A7066]">{approved ? "Your verified IPC recognition details." : "Your application remains private while IPC reviews it."}</p></div>
        {approved ? <ShieldCheck className="text-emerald-700" size={22} /> : <FileCheck2 className="text-primary-700" size={22} />}
      </div>
      <div className="mt-5 rounded-2xl bg-[#17191B] p-5 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#222527] font-mono text-xs font-black text-primary-400">IPC</span>
          <div><p className="font-mono text-[9px] font-bold uppercase tracking-[.16em] text-primary-300">{approved ? "Verified professional recognition" : "Membership application"}</p><h3 className="mt-1 font-black">{memberName}{grade?.post_nominal ? `, ${grade.post_nominal}` : ""}</h3><p className="mt-1 text-[10px] text-white/50">{grade?.short_title || application.grade_title} · Institute of Project Controls</p></div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <PreviewDetail label="Reference" value={application.application_reference} />
          <PreviewDetail label="Status" value={approved ? "Active and verified" : application.status.replaceAll("_", " ")} positive={approved} />
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-primary-300 bg-primary-50 p-4">
        <p className="text-[9px] font-black uppercase tracking-[.14em] text-primary-900">Professional profile line</p>
        <p className="mt-2 text-xs leading-5 text-[#6C5A37]">
          {profile.professional_headline || [memberName, grade?.post_nominal, profile.job_title, profile.employer].filter(Boolean).join(" · ")}
        </p>
      </div>
      {grade?.professional_recognition && <p className="mt-4 text-xs leading-6 text-[#71675E]">{grade.professional_recognition}</p>}
    </Card>
  );
}

function EvidencePanel({ application }: { application: MembershipApplication }) {
  return (
    <Card className="mt-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="font-black">Recognition evidence</h2><p className="mt-1 text-xs text-[#7A7066]">Documents attached securely to application {application.application_reference}.</p></div>
        {["draft", "more_info_required"].includes(application.status) && <Link to="/user/membership/applications" className="btn-secondary"><FileText size={16} />Manage application</Link>}
      </div>
      {application.documents.length ? (
        <div className="mt-5 overflow-hidden rounded-xl border border-[#E0D5C8]">
          <div className="grid grid-cols-[1fr_auto] bg-[#17191B] px-4 py-3 text-[9px] font-black uppercase tracking-[.14em] text-white sm:grid-cols-[1fr_180px_120px]"><span>Evidence</span><span className="hidden sm:block">Type</span><span>Size</span></div>
          {application.documents.map((document) => (
            <div key={document.id} className="grid grid-cols-[1fr_auto] items-center border-t border-[#E8DED2] bg-white px-4 py-4 text-xs first:border-t-0 sm:grid-cols-[1fr_180px_120px]">
              <span className="flex min-w-0 items-center gap-2 font-semibold"><FileText className="shrink-0 text-primary-700" size={16} /><span className="truncate">{document.name}</span></span>
              <span className="hidden capitalize text-[#776D64] sm:block">{document.type.replaceAll("_", " ")}</span>
              <span className="text-right text-[#776D64]">{formatSize(document.size)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-dashed border-[#D5C8B8] px-5 py-10 text-center">
          <Sparkles className="mx-auto text-primary-700" size={24} />
          <p className="mt-3 text-sm font-bold">No evidence uploaded yet</p>
          <p className="mt-1 text-xs text-[#7A7066]">Add evidence through your editable membership application.</p>
        </div>
      )}
    </Card>
  );
}

function HeroDetail({ label, value }: { label: string; value: string }) {
  return <div><p className="font-mono text-[8px] font-bold uppercase tracking-[.15em] text-white/40">{label}</p><p className="mt-2 text-xs font-bold">{value}</p></div>;
}

function PreviewDetail({ label, value, positive = false }: { label: string; value: string; positive?: boolean }) {
  return <div className="rounded-xl bg-white/5 p-3"><p className="text-[9px] text-white/40">{label}</p><p className={`mt-2 text-xs font-bold capitalize ${positive ? "text-emerald-400" : "text-white"}`}>{value}</p></div>;
}

function formatSize(bytes: number) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
