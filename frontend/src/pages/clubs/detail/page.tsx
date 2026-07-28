import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  MapPin,
  MessageSquareText,
  Network,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import MembershipGateModal from "@/components/feedback/MembershipGateModal";
import { useAuth } from "@/features/auth/AuthContext";
import ClubJoinModal, { type ClubJoinDetails } from "@/features/clubs/components/ClubJoinModal";
import { apiJson } from "@/lib/api";

type ClubEvent = {
  id: number;
  slug: string;
  title: string;
  description: string;
  location: string;
  region: string;
  starts_at: string | null;
  is_online_event: boolean;
};

type PublicClub = {
  public_id: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  location: string;
  specialism: string;
  membership_status: string;
  active_member_count: number;
  discussion_count: number;
  upcoming_events: ClubEvent[];
};

const opportunities = [
  {
    icon: CalendarDays,
    title: "Attend regional events",
    text: "Join professional talks, workshops, roundtables, site visits and networking sessions.",
  },
  {
    icon: BookOpen,
    title: "Develop your CPD",
    text: "Build current knowledge through practical learning and evidence-led professional discussion.",
  },
  {
    icon: MessageSquareText,
    title: "Share professional insight",
    text: "Exchange experience, start discussions and contribute useful regional case studies.",
  },
  {
    icon: Network,
    title: "Connect and contribute",
    text: "Meet peers across sectors and support mentoring, volunteering and working-group activity.",
  },
];

export default function PublicClubPage() {
  const { slug = "" } = useParams();
  const { user, isLoading } = useAuth();
  const [club, setClub] = useState<PublicClub | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setClub(await apiJson<PublicClub>(`/api/clubs/${slug}`, undefined, {
        requestSource: "public-club",
      }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Club could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  function openJoinModal() {
    if (isLoading) return;
    if (!user?.membership_active) {
      setGateOpen(true);
      return;
    }
    if (!club || ["pending", "active"].includes(club.membership_status)) return;
    setJoinOpen(true);
  }

  async function joinClub(details: ClubJoinDetails) {
    if (!club) return;
    setJoining(true);
    try {
      await apiJson(`/api/user/clubs/${club.slug}/join`, details, {
        requestSource: "public-club",
      });
      toast.success("Your request to join the club has been submitted.");
      setJoinOpen(false);
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not submit the club request.");
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return <div className="grid min-h-[70vh] place-items-center bg-background-50"><span className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" /></div>;
  }

  if (error || !club) {
    return (
      <main className="grid min-h-[70vh] place-items-center bg-background-50 px-5 text-center">
        <div><p className="font-heading text-2xl font-bold text-background-950">Club unavailable</p><p className="mt-3 text-sm text-foreground-600">{error}</p><Link to="/clubs" className="btn-primary mt-6">Back to regional clubs</Link></div>
      </main>
    );
  }

  const active = club.membership_status === "active";
  const pending = club.membership_status === "pending";

  return (
    <main className="bg-background-50 text-background-950">
      <section className="relative overflow-hidden bg-[#111515] px-5 pb-20 pt-32 text-white md:px-10 md:pb-28 md:pt-40">
        <div className="absolute -right-32 top-10 h-[32rem] w-[32rem] rounded-full border border-primary-500/20" />
        <div className="absolute -bottom-56 right-0 h-[30rem] w-[30rem] rounded-full bg-primary-500/10 blur-3xl" />
        <div className="container-content relative">
          <Link to="/clubs" className="text-xs font-bold uppercase tracking-[.18em] text-primary-300 hover:text-primary-200">Regional clubs / {club.location}</Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-end">
            <div>
              <span className="eyebrow text-primary-300">IPC regional community</span>
              <h1 className="mt-5 max-w-4xl font-heading text-5xl font-bold leading-[1.02] md:text-7xl">{club.name}</h1>
              <p className="mt-7 max-w-3xl text-lg leading-8 text-white/75">{club.summary}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                {active ? (
                  <Link to={`/user/clubs/${club.slug}`} className="btn-primary">Open member hub<ArrowRight size={17} /></Link>
                ) : (
                  <button type="button" onClick={openJoinModal} disabled={joining || pending} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                    {joining ? "Submitting…" : pending ? "Request pending" : "Join this club"}<ArrowRight size={17} />
                  </button>
                )}
                <a href="#programme" className="inline-flex min-h-12 items-center justify-center border border-white/30 px-6 text-sm font-bold text-white hover:bg-white/10">Explore the programme</a>
              </div>
              <p className="mt-5 text-xs text-white/50">Club participation is available to active IPC members. Join requests are reviewed before community access is enabled.</p>
            </div>
            <aside className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[.2em] text-primary-300">Club profile</p>
              <dl className="mt-5 space-y-5">
                <HeroFact icon={MapPin} label="Region" value={club.location} />
                <HeroFact icon={Sparkles} label="Professional focus" value={club.specialism || "Project controls capability"} />
                <HeroFact icon={ShieldCheck} label="Community" value="IPC member-led and professionally governed" />
              </dl>
            </aside>
          </div>
        </div>
      </section>

      <section className="border-b border-background-200 bg-background-100">
        <div className="container-content grid sm:grid-cols-3">
          <Metric value={`${club.active_member_count}`} label="Active club members" />
          <Metric value={`${club.discussion_count}`} label="Member discussions" />
          <Metric value={`${club.upcoming_events.length}`} label="Upcoming regional events" />
        </div>
      </section>

      <section className="section-padding">
        <div className="container-content grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="eyebrow text-primary-700">About this club</span>
            <h2 className="mt-5 font-heading text-4xl font-semibold leading-tight md:text-5xl">Professional knowledge with a regional connection.</h2>
          </div>
          <div className="lg:col-span-7">
            <p className="text-lg leading-9 text-foreground-700">{club.description}</p>
            <div className="mt-9 border-l-2 border-primary-500 bg-background-100 p-6">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-primary-800">Professional focus</p>
              <p className="mt-3 leading-7 text-foreground-700">{club.specialism || `Project controls practice, professional development and regional capability across ${club.location}.`}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="programme" className="bg-background-950 py-20 text-white md:py-28">
        <div className="container-content">
          <span className="eyebrow text-primary-300">Member programme</span>
          <h2 className="mt-5 max-w-3xl font-heading text-4xl font-semibold md:text-5xl">Learn, connect, contribute and progress.</h2>
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {opportunities.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="min-h-64 border border-white/15 bg-white/[.04] p-6">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-500 text-[#111515]"><Icon size={20} /></span>
                <p className="mt-8 font-mono text-[9px] font-bold tracking-[.18em] text-primary-300">0{index + 1}</p>
                <h3 className="mt-3 font-heading text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/60">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background-100">
        <div className="container-content">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><span className="eyebrow text-primary-700">Club calendar</span><h2 className="mt-4 font-heading text-4xl font-semibold">Upcoming regional activity</h2></div>
            <Link to="/events" className="text-sm font-bold text-primary-800">View all IPC events →</Link>
          </div>
          {club.upcoming_events.length ? (
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {club.upcoming_events.map((event) => (
                <article key={event.id} className="flex min-h-80 flex-col border border-background-300 bg-background-50 p-7">
                  <p className="text-xs font-bold uppercase tracking-[.14em] text-primary-700">{event.starts_at ? new Date(event.starts_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "Date to be confirmed"}</p>
                  <h3 className="mt-5 font-heading text-2xl font-semibold">{event.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-foreground-600">{event.description}</p>
                  <p className="mt-5 flex items-center gap-2 text-xs text-foreground-600"><MapPin size={14} />{event.is_online_event ? "Online" : event.location || club.location}</p>
                  <Link to={`/events/${event.slug}`} className="mt-auto pt-8 text-sm font-bold text-primary-800">View event →</Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 border border-dashed border-background-400 bg-background-50 p-10 text-center">
              <CalendarDays className="mx-auto text-primary-700" />
              <h3 className="mt-4 font-heading text-xl font-semibold">New activity is being prepared</h3>
              <p className="mt-2 text-sm text-foreground-600">Confirmed {club.name} events will appear here when published.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-primary-500 px-5 py-16">
        <div className="container-content flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div><p className="text-xs font-black uppercase tracking-[.18em]">Your regional professional community</p><h2 className="mt-3 font-heading text-4xl font-semibold">Take part in {club.name}.</h2></div>
          {active ? <Link to={`/user/clubs/${club.slug}`} className="inline-flex min-h-12 items-center justify-center gap-2 bg-background-950 px-7 text-sm font-bold text-white">Open member hub<ArrowRight size={17} /></Link> : <button type="button" onClick={openJoinModal} disabled={joining || pending} className="inline-flex min-h-12 items-center justify-center gap-2 bg-background-950 px-7 text-sm font-bold text-white disabled:opacity-60">{pending ? "Request pending" : "Request to join"}<ArrowRight size={17} /></button>}
        </div>
      </section>

      <MembershipGateModal
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        showSignIn={!user}
        title={`Join IPC before requesting access to ${club.name}.`}
        description="Club communities are available to active IPC members. Explore membership or sign in to continue."
      />
      <ClubJoinModal clubName={club.name} open={joinOpen} saving={joining} onClose={() => setJoinOpen(false)} onSubmit={(details) => void joinClub(details)} />
    </main>
  );
}

function HeroFact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="flex gap-3"><Icon className="mt-0.5 shrink-0 text-primary-300" size={18} /><div><dt className="text-[10px] font-bold uppercase tracking-[.14em] text-white/45">{label}</dt><dd className="mt-1 text-sm leading-6 text-white/85">{value}</dd></div></div>;
}

function Metric({ value, label }: { value: string; label: string }) {
  return <div className="border-b border-background-300 px-5 py-8 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 md:px-8"><strong className="font-heading text-4xl">{value}</strong><p className="mt-2 text-xs font-bold uppercase tracking-[.12em] text-foreground-600">{label}</p></div>;
}
