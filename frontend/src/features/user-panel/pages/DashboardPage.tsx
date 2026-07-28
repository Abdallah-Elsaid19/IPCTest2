import { useCallback } from "react";
import { Award, CalendarDays, FileText, Users, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { panelApi } from "../api";
import { useLoad } from "../hooks";
import { Card, Empty, ErrorState, Loading, PageHeading, Status } from "../components/PanelUI";

export default function DashboardPage() {
  const load = useCallback((signal: AbortSignal) => panelApi.dashboard(signal), []);
  const { data, loading, error, reload } = useLoad(load);
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error} retry={reload} />;
  const activities = [...data.scholarship_applications, ...data.award_nominations].slice(0, 5);
  const stats: [string | number, string, LucideIcon][] = [
    [`${data.profile_completion.percentage}%`, "Profile complete", Award],
    [data.active_clubs, "Active clubs", Users],
    [data.bookings.length, "Upcoming bookings", CalendarDays],
    [data.document_count, "Documents", FileText],
  ];
  return <>
    <PageHeading title="Welcome to your member area" description="Track your IPC journey, applications, events and professional community from one secure place." action={<Link to="../profile" className="btn-primary">Complete profile</Link>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(([value, label, Icon]) => <Card key={label}><Icon className="text-primary-600" size={22} /><p className="mt-4 text-3xl font-bold">{value}</p><p className="mt-1 text-sm text-foreground-600">{label}</p></Card>)}
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <Card><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Applications</h2><Link to="../membership" className="text-sm font-semibold text-primary-700">View all</Link></div>{activities.length ? <div className="divide-y divide-background-200">{activities.map((item, index) => <div className="flex items-center justify-between gap-3 py-4" key={item.public_id || index}><div><p className="font-medium">{item.scholarship_title || item.programme_title || item.nominee_name || "Application"}</p><p className="mt-1 text-xs text-foreground-500">{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "In progress"}</p></div><Status value={item.status} /></div>)}</div> : <Empty title="No applications yet" text="Your submitted and draft applications will appear here." />}</Card>
      <Card><h2 className="text-lg font-semibold">Profile strength</h2><div className="mt-5 h-2.5 overflow-hidden rounded-full bg-background-200"><div className="h-full rounded-full bg-primary-500" style={{ width: `${data.profile_completion.percentage}%` }} /></div><p className="mt-3 text-sm text-foreground-600">{data.profile_completion.percentage}% complete</p>{data.profile_completion.missing.length > 0 && <p className="mt-4 text-xs leading-5 text-foreground-500">Next: {data.profile_completion.missing.slice(0, 3).join(", ")}</p>}</Card>
    </div>
  </>;
}
