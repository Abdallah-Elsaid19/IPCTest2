import {
  ArrowRight,
  Bell,
  CalendarDays,
  Clock3,
  MapPin,
  MessageCircle,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { useCallback, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { useAuth } from "@/features/auth/AuthContext";
import { apiJson } from "@/lib/api";
import { panelApi, rows } from "../api";
import { useLoad } from "../hooks";
import { Card, Empty, ErrorState, inputClass, Loading, PageHeading, Status } from "../components/PanelUI";
import type { DirectoryItem } from "../types";

type ClubMember = {
  name: string;
  initials: string;
  club_role: string;
  job_title: string;
  employer: string;
  city: string;
};
type ClubDetail = DirectoryItem & {
  membership_role?: string;
  membership_joined_at?: string | null;
  active_member_count: number;
  discussion_count: number;
  message_count: number;
  members: ClubMember[];
  categories: { id: number; name: string; slug: string }[];
};
type Thread = {
  public_id: string;
  title: string;
  body: string;
  author_name: string;
  category_name: string;
  reply_count: number;
  is_pinned: boolean;
  updated_at: string;
};
type Message = {
  public_id: string;
  body: string;
  sender_name: string;
  created_at: string;
};
type ClubEvent = {
  id: number;
  slug: string;
  title: string;
  description: string;
  location: string;
  starts_at: string | null;
  is_online_event: boolean;
};
type PublicClubSummary = { upcoming_events: ClubEvent[] };
type Tab = "overview" | "events" | "discussions" | "chat" | "members";

const tabItems: Array<{ id: Tab; label: string; icon: typeof Bell }> = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "events", label: "Events", icon: CalendarDays },
  { id: "discussions", label: "Discussions", icon: MessageSquareText },
  { id: "chat", label: "Club chat", icon: MessageCircle },
  { id: "members", label: "Members", icon: Users },
];

export default function ClubCommunityPage() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const initialTab: Tab = location.pathname.endsWith("/chat")
    ? "chat"
    : location.pathname.endsWith("/discussions")
      ? "discussions"
      : "overview";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (signal: AbortSignal) => {
    const club = await apiJson<ClubDetail>(`/api/user/clubs/${slug}`, undefined, {
      signal,
      requestSource: "user-panel",
    });
    if (club.membership_status !== "active") {
      return { club, threads: [] as Thread[], messages: [] as Message[], events: [] as ClubEvent[] };
    }
    const [threads, messages, publicClub] = await Promise.all([
      panelApi.list<Thread>(`clubs/${slug}/threads`, signal),
      panelApi.list<Message>(`clubs/${slug}/chat`, signal),
      apiJson<PublicClubSummary>(`/api/clubs/${slug}`, undefined, {
        signal,
        requestSource: "user-panel",
      }),
    ]);
    return {
      club,
      threads: rows(threads),
      messages: rows(messages),
      events: publicClub.upcoming_events || [],
    };
  }, [slug]);
  const { data, loading, error, reload } = useLoad(load);

  const members = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query || !data) return data?.club.members || [];
    return data.club.members.filter((member) =>
      [member.name, member.job_title, member.employer, member.city]
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [data, search]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error} retry={reload} />;

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setSaving(true);
    try {
      if (tab === "chat") {
        await panelApi.create(`clubs/${slug}/chat`, { body: form.get("body") });
      } else {
        await panelApi.create(`clubs/${slug}/threads`, {
          category: Number(form.get("category")),
          title: form.get("title"),
          body: form.get("body"),
        });
      }
      formElement.reset();
      toast.success(tab === "chat" ? "Message sent" : "Discussion published");
      reload();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Could not publish");
    } finally {
      setSaving(false);
    }
  }

  if (data.club.membership_status !== "active") {
    return (
      <>
        <PageHeading title={data.club.name || "Club"} description={data.club.description || "IPC professional club community"} />
        <Card>
          <Empty title="Active club membership required" text={`Your request status is ${data.club.membership_status || "not joined"}. The Member Hub opens after approval.`} />
          <div className="mt-5 flex justify-center"><Link to={`/clubs/${slug}`} className="btn-primary">View public club page</Link></div>
        </Card>
      </>
    );
  }

  const announcements = data.threads.filter((thread) => thread.is_pinned);
  const recentThreads = data.threads.slice(0, 4);
  const firstName = user?.first_name || user?.name?.split(" ")[0] || "Member";

  return (
    <>
      <PageHeading
        title={`${data.club.name} Member Hub`}
        description="Your private club workspace for regional events, announcements, professional discussions and member connections."
        action={<Link to={`/clubs/${slug}`} className="btn-secondary">Public club page<ArrowRight size={16} /></Link>}
      />

      <Card className="mb-6 overflow-hidden p-0">
        <div className="grid gap-6 bg-[linear-gradient(110deg,#102326_0%,#17191B_62%,#3B3018_100%)] p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="font-mono text-[9px] font-black uppercase tracking-[.2em] text-primary-300">Active club membership</p>
            <h2 className="mt-3 font-heading text-3xl font-bold">Welcome back, {firstName}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-white/65">{data.club.summary}</p>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-right">
            <WelcomeFact label="Member since" value={formatDate(data.club.membership_joined_at)} />
            <WelcomeFact label="Club role" value={data.club.membership_role || "Member"} />
          </dl>
        </div>
        <nav className="flex gap-2 overflow-x-auto border-t border-[#E4D9CB] bg-[#FBF8F3] p-3" aria-label="Club member hub">
          {tabItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-xs font-bold transition ${
                tab === id ? "bg-primary-500 text-[#171411]" : "text-[#6F655C] hover:bg-white"
              }`}
            >
              <Icon size={15} />{label}
            </button>
          ))}
        </nav>
      </Card>

      {tab === "overview" && (
        <Overview
          club={data.club}
          events={data.events}
          announcements={announcements}
          recentThreads={recentThreads}
          onTab={setTab}
        />
      )}
      {tab === "events" && <EventsTab events={data.events} clubName={data.club.name || "Club"} />}
      {tab === "discussions" && (
        <DiscussionsTab club={data.club} threads={data.threads} saving={saving} onSubmit={create} />
      )}
      {tab === "chat" && (
        <ChatTab messages={data.messages} saving={saving} onSubmit={create} />
      )}
      {tab === "members" && (
        <MembersTab members={members} search={search} onSearch={setSearch} total={data.club.active_member_count} />
      )}
    </>
  );
}

function Overview({
  club,
  events,
  announcements,
  recentThreads,
  onTab,
}: {
  club: ClubDetail;
  events: ClubEvent[];
  announcements: Thread[];
  recentThreads: Thread[];
  onTab: (tab: Tab) => void;
}) {
  const metrics = [
    { label: "Active members", value: club.active_member_count, icon: Users },
    { label: "Upcoming events", value: events.length, icon: CalendarDays },
    { label: "Discussions", value: club.discussion_count, icon: MessageSquareText },
    { label: "Chat messages", value: club.message_count, icon: MessageCircle },
  ];
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-start justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-100 text-primary-800"><Icon size={18} /></span>
              <strong className="font-heading text-3xl">{value}</strong>
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[.12em] text-[#756A61]">{label}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="font-heading text-xl font-bold">Quick actions</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickAction icon={CalendarDays} label="View club events" onClick={() => onTab("events")} />
          <QuickAction icon={MessageSquareText} label="Start a discussion" onClick={() => onTab("discussions")} />
          <QuickAction icon={MessageCircle} label="Open club chat" onClick={() => onTab("chat")} />
          <QuickAction icon={Users} label="Member directory" onClick={() => onTab("members")} />
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-4"><div><p className="font-mono text-[9px] font-black uppercase tracking-[.16em] text-primary-800">Club updates</p><h2 className="mt-2 font-heading text-xl font-bold">Announcements</h2></div><Bell className="text-primary-700" size={20} /></div>
          <div className="mt-5 space-y-3">
            {(announcements.length ? announcements : recentThreads.slice(0, 2)).map((thread) => (
              <article key={thread.public_id} className="rounded-xl border border-[#E6DBCF] bg-[#FBF8F3] p-4">
                <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-black">{thread.title}</h3>{thread.is_pinned && <Status value="active" />}</div>
                <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#766B62]">{thread.body}</p>
                <p className="mt-3 text-[10px] text-[#8A7F75]">{thread.author_name} · {formatDate(thread.updated_at)}</p>
              </article>
            ))}
            {!recentThreads.length && <Empty title="No announcements yet" text="Club announcements and pinned discussions will appear here." />}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4"><div><p className="font-mono text-[9px] font-black uppercase tracking-[.16em] text-primary-800">Next in the programme</p><h2 className="mt-2 font-heading text-xl font-bold">Upcoming events</h2></div><CalendarDays className="text-primary-700" size={20} /></div>
          <div className="mt-5 space-y-3">
            {events.slice(0, 3).map((event) => <CompactEvent key={event.id} event={event} />)}
            {!events.length && <Empty title="No published regional events" text="New club activity will appear here when confirmed." />}
          </div>
          {events.length > 0 && <button type="button" onClick={() => onTab("events")} className="mt-5 text-xs font-black text-primary-800">View the club calendar →</button>}
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[9px] font-black uppercase tracking-[.16em] text-primary-800">Professional exchange</p><h2 className="mt-2 font-heading text-xl font-bold">Recent discussions</h2></div><button type="button" onClick={() => onTab("discussions")} className="btn-secondary">View all discussions</button></div>
        <div className="mt-5 divide-y divide-[#E7DDD1]">
          {recentThreads.map((thread) => <ThreadRow key={thread.public_id} thread={thread} />)}
          {!recentThreads.length && <Empty title="Start the first discussion" text="Share a question, practical insight or regional project-controls topic." />}
        </div>
      </Card>
    </>
  );
}

function DiscussionsTab({
  club,
  threads,
  saving,
  onSubmit,
}: {
  club: ClubDetail;
  threads: Thread[];
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <Card className="h-fit">
        <p className="font-mono text-[9px] font-black uppercase tracking-[.16em] text-primary-800">New topic</p>
        <h2 className="mt-2 font-heading text-xl font-bold">Start a discussion</h2>
        <form onSubmit={onSubmit} className="mt-5 grid gap-3">
          <label><span className="text-xs font-bold">Category</span><select required name="category" className={inputClass}>{club.categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
          <label><span className="text-xs font-bold">Title</span><input required name="title" className={inputClass} placeholder="What would you like to discuss?" /></label>
          <label><span className="text-xs font-bold">Message</span><textarea required minLength={2} name="body" className={inputClass} rows={5} placeholder="Add useful context for club members…" /></label>
          <button disabled={saving} className="btn-primary"><Send size={15} />{saving ? "Publishing…" : "Publish discussion"}</button>
        </form>
      </Card>
      <Card>
        <div className="flex items-end justify-between gap-3"><div><h2 className="font-heading text-xl font-bold">Club discussions</h2><p className="mt-1 text-xs text-[#766B62]">Professional questions, shared practice and regional insight.</p></div><span className="text-xs font-bold text-primary-800">{threads.length} topics</span></div>
        <div className="mt-5 divide-y divide-[#E7DDD1]">
          {threads.map((thread) => <ThreadRow key={thread.public_id} thread={thread} />)}
          {!threads.length && <Empty title="No discussions yet" text="Publish the first discussion for this club." />}
        </div>
      </Card>
    </div>
  );
}

function ChatTab({ messages, saving, onSubmit }: { messages: Message[]; saving: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[#E4D9CB] bg-[#FBF8F3] px-5 py-4">
        <h2 className="font-heading text-xl font-bold">Club chat</h2>
        <p className="mt-1 text-xs text-[#766B62]">A shared conversation for active club members.</p>
      </div>
      <div className="min-h-[440px] space-y-4 p-5 md:p-7">
        {messages.slice().reverse().map((message) => (
          <article key={message.public_id} className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#17191B] text-[10px] font-black text-white">{initials(message.sender_name)}</span>
            <div className="max-w-2xl rounded-2xl rounded-tl-sm bg-[#F1ECE5] px-4 py-3">
              <div className="flex flex-wrap items-center gap-3"><strong className="text-xs">{message.sender_name}</strong><span className="text-[9px] text-[#8A7F75]">{formatDateTime(message.created_at)}</span></div>
              <p className="mt-2 text-sm leading-6 text-[#4F4842]">{message.body}</p>
            </div>
          </article>
        ))}
        {!messages.length && <Empty title="No chat messages yet" text="Start a useful conversation with your club community." />}
      </div>
      <form onSubmit={onSubmit} className="flex items-end gap-3 border-t border-[#E4D9CB] bg-[#FBF8F3] p-4">
        <textarea required minLength={2} name="body" className={`${inputClass} mt-0 min-h-11 flex-1 resize-none`} rows={1} placeholder="Write a message…" />
        <button disabled={saving} className="btn-primary min-w-28"><Send size={15} />{saving ? "Sending…" : "Send"}</button>
      </form>
    </Card>
  );
}

function EventsTab({ events, clubName }: { events: ClubEvent[]; clubName: string }) {
  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[9px] font-black uppercase tracking-[.16em] text-primary-800">Regional programme</p><h2 className="mt-2 font-heading text-2xl font-bold">Upcoming {clubName} events</h2></div><Link to="/events" className="btn-secondary">All IPC events</Link></div>
      {events.length ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {events.map((event) => (
            <article key={event.id} className="flex min-h-64 flex-col rounded-2xl border border-[#E1D6C8] bg-white p-5">
              <div className="flex items-start justify-between gap-3"><span className="rounded-full bg-primary-100 px-3 py-1 text-[9px] font-black uppercase text-primary-900">{event.is_online_event ? "Online" : "Regional event"}</span><CalendarDays className="text-primary-700" size={18} /></div>
              <h3 className="mt-5 font-heading text-xl font-bold">{event.title}</h3>
              <p className="mt-3 line-clamp-3 text-xs leading-6 text-[#756A61]">{event.description}</p>
              <div className="mt-5 flex flex-wrap gap-4 text-[10px] font-bold text-[#756A61]"><span className="flex items-center gap-1.5"><Clock3 size={13} />{event.starts_at ? formatDateTime(event.starts_at) : "Date to be confirmed"}</span><span className="flex items-center gap-1.5"><MapPin size={13} />{event.is_online_event ? "Online" : event.location}</span></div>
              <Link to={`/events/${event.slug}`} className="btn-primary mt-auto pt-3">View and register<ArrowRight size={15} /></Link>
            </article>
          ))}
        </div>
      ) : <div className="mt-6"><Empty title="No upcoming events" text="Confirmed regional events will appear here automatically." /></div>}
    </Card>
  );
}

function MembersTab({ members, search, onSearch, total }: { members: ClubMember[]; search: string; onSearch: (value: string) => void; total: number }) {
  return (
    <Card>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div><p className="font-mono text-[9px] font-black uppercase tracking-[.16em] text-primary-800">Member directory</p><h2 className="mt-2 font-heading text-2xl font-bold">{total} active club members</h2><p className="mt-1 text-xs text-[#766B62]">Only profiles shared with IPC members are shown.</p></div>
        <label className="relative w-full md:max-w-sm"><Search className="absolute left-3 top-3.5 text-[#8A7F75]" size={16} /><input value={search} onChange={(event) => onSearch(event.target.value)} className={`${inputClass} mt-0 pl-9`} placeholder="Search members…" /></label>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {members.map((member, index) => (
          <article key={`${member.name}-${index}`} className="flex items-start gap-3 rounded-2xl border border-[#E2D7CA] bg-white p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#17191B] text-xs font-black text-white">{member.initials || initials(member.name)}</span>
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate text-sm font-black">{member.name}</h3>{member.club_role === "moderator" && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[8px] font-black uppercase text-primary-900">Moderator</span>}</div><p className="mt-1 text-xs text-[#6F655C]">{member.job_title || "IPC member"}</p>{member.employer && <p className="mt-1 truncate text-[10px] text-[#91867C]">{member.employer}{member.city ? ` · ${member.city}` : ""}</p>}</div>
          </article>
        ))}
      </div>
      {!members.length && <div className="mt-6"><Empty title="No matching members" text="Try a different name, role, organisation or city." /></div>}
    </Card>
  );
}

function ThreadRow({ thread }: { thread: Thread }) {
  return (
    <article className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-800"><MessageSquareText size={17} /></span>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-black">{thread.title}</h3>{thread.is_pinned && <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[8px] font-black uppercase text-primary-900">Pinned</span>}</div><p className="mt-1 text-[10px] text-[#81766C]">{thread.author_name} · {thread.category_name} · {thread.reply_count} replies · {formatDate(thread.updated_at)}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#6F655C]">{thread.body}</p></div>
    </article>
  );
}

function CompactEvent({ event }: { event: ClubEvent }) {
  return (
    <Link to={`/events/${event.slug}`} className="flex gap-3 rounded-xl border border-[#E6DBCF] bg-[#FBF8F3] p-4 hover:border-primary-400">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-800"><CalendarDays size={17} /></span>
      <div><h3 className="text-sm font-black">{event.title}</h3><p className="mt-1 text-[10px] text-[#81766C]">{event.starts_at ? formatDateTime(event.starts_at) : "Date to be confirmed"} · {event.is_online_event ? "Online" : event.location}</p></div>
    </Link>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: typeof Bell; label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex min-h-24 items-center gap-3 rounded-2xl border border-[#E1D6C8] bg-white p-4 text-left hover:border-primary-400 hover:bg-primary-50"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-100 text-primary-800"><Icon size={18} /></span><span className="text-xs font-black">{label}</span></button>;
}

function WelcomeFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/5 p-3"><dt className="text-[9px] uppercase tracking-[.12em] text-white/40">{label}</dt><dd className="mt-2 text-xs font-bold capitalize text-white">{value}</dd></div>;
}

function formatDate(value?: string | null) {
  if (!value) return "Recently joined";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "IPC";
}
