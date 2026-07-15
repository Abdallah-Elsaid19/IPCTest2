import { AdminPageHeader, AdminPageState, EmptyState, ManageLink, StatusBadge } from "@/features/admin/components/AdminPage";
import { useAdminDashboard } from "@/features/admin/context/AdminDashboardContext";
import { adminUrl, formatDate } from "@/features/admin/utils";

export default function AdminEventsPage() {
  const { data, isLoading } = useAdminDashboard();
  return <AdminPageState isLoading={isLoading} hasData={Boolean(data)}>{data && <><AdminPageHeader eyebrow="Programme" title="Events and registrations" description="Upcoming IPC events and their latest registrations." action={<ManageLink href={`${adminUrl}events/event/`}>Manage events</ManageLink>} />
    <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-3">{data.upcoming_events.length ? data.upcoming_events.map((event) => <div key={event.id} className="rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] p-4 shadow-[0_8px_25px_rgba(66,48,31,0.04)]"><p className="font-bold">{event.title}</p><p className="mt-2 text-xs text-[#83776C]">{formatDate(event.starts_at)}{event.location ? ` · ${event.location}` : ""}</p><p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-wider text-primary-800">{event.registrations}{event.capacity ? ` / ${event.capacity}` : ""} registrations</p></div>) : <EmptyState>No upcoming published events.</EmptyState>}</div>
      {data.recent_registrations.length ? <div className="overflow-x-auto rounded-2xl border border-[#DED2C3] bg-[#FFFDF9]"><table className="w-full min-w-[540px] text-left text-sm"><thead className="bg-[#ECE2D6] text-[10px] uppercase tracking-wider text-[#766C62]"><tr><th className="px-4 py-3.5">Registrant</th><th className="px-4 py-3.5">Event</th><th className="px-4 py-3.5">Status</th></tr></thead><tbody className="divide-y divide-[#E8DED2]">{data.recent_registrations.map((item) => <tr key={item.id} className="hover:bg-[#FAF5EE]"><td className="px-4 py-4"><p className="font-semibold">{item.name}</p><p className="mt-1 text-xs text-[#8A7E72]">{item.email}</p></td><td className="max-w-[220px] truncate px-4 py-4 text-[#554E47]">{item.event_name}</td><td className="px-4 py-4"><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div> : <EmptyState>No event registrations have been received.</EmptyState>}
    </div></>}</AdminPageState>;
}
