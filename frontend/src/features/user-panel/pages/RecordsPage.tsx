import { useCallback, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, CreditCard, Eye, MailCheck, MapPin, Ticket, XCircle } from "lucide-react";
import { notifications } from "@/lib/notifications";
import { panelApi, rows } from "../api";
import { useLoad } from "../hooks";
import type { Notification, Page, Preference } from "../types";
import { Card, Empty, ErrorState, inputClass, Loading, PageHeading, Status } from "../components/PanelUI";

type Kind = "membership" | "awards" | "bookings" | "documents" | "notifications" | "support";
const descriptions: Record<Kind, [string, string]> = {
  membership: ["Membership", "Review your membership application, evidence and current status."],
  awards: ["My award nominations", "Track only the award nominations submitted or saved through your account."],
  bookings: ["Event bookings", "View and manage events registered through your IPC account."],
  documents: ["Documents", "Access certificates, receipts and application documents securely."],
  notifications: ["Notifications", "Important account, application and community updates."],
  support: ["Support", "Track support requests and contact the IPC team securely."],
};

export default function RecordsPage({ kind }: { kind: Kind }) {
  const path = kind === "membership" ? "membership/applications" : kind === "awards" ? "awards/nominations" : kind;
  const load = useCallback(async (signal: AbortSignal): Promise<Page<Record<string, unknown>> | Record<string, unknown>[]> => {
    if (kind === "notifications") return panelApi.notifications(signal) as unknown as Page<Record<string, unknown>>;
    return panelApi.list<Record<string, unknown>>(path, signal);
  }, [kind, path]);
  const { data, loading, error, reload } = useLoad(load);
  const [busy, setBusy] = useState("");
  const [ticketOpen, setTicketOpen] = useState(false);
  async function action(record: Record<string, unknown>) {
    const id = String(record.application_reference || record.reference || record.public_id); setBusy(id);
    try {
      if (kind === "membership") await panelApi.action(`membership/applications/${id}/submit`);
      if (kind === "bookings") await panelApi.action(`bookings/${id}/cancel`);
      if (kind === "notifications") await panelApi.action(`notifications/${id}/read`);
      notifications.success("Updated successfully"); reload();
    } catch (reason) { notifications.error(reason instanceof Error ? reason.message : "Update failed"); }
    finally { setBusy(""); }
  }
  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;
  const items = rows(data as never) as Record<string, unknown>[];
  const [title, description] = descriptions[kind];
  const headingAction = kind === "support"
    ? <button className="btn-primary" onClick={() => setTicketOpen((value) => !value)}>New request</button>
    : kind === "awards"
      ? <Link className="btn-primary" to="explore">Explore awards</Link>
      : undefined;
  return <><PageHeading title={title} description={description} action={headingAction} />{ticketOpen && <SupportForm done={() => { setTicketOpen(false); reload(); }} />}{items.length ? <div className="space-y-3">{items.map((record, index) => {
    const id = String(record.application_reference || record.reference || record.public_id || index);
    const notification = record as unknown as Notification;
    if (kind === "bookings") {
      return <BookingCard key={id} record={record} busy={busy === id} onCancel={() => void action(record)} />;
    }
    return <Card key={id} className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{String(record.title || record.subject || record.grade_title || record.event_name || record.original_name || record.programme_title || `Record ${index + 1}`)}</h2>{record.status ? <Status value={String(record.status)} /> : notification.is_read === false ? <Status value="new" /> : null}</div><p className="mt-1 text-sm text-foreground-600">{String(record.message || record.category || record.nominee_name || record.application_reference || "")}</p></div><div className="flex gap-2">{kind === "documents" && <a className="btn-secondary" href={String(record.download_url)}>Download</a>}{kind === "notifications" && !notification.is_read && <button disabled={busy === id} className="btn-secondary" onClick={() => void action(record)}>Mark read</button>}{kind === "awards" && ["draft", "more_info_required"].includes(String(record.status)) && <Link className="btn-primary" to={`nominations/${record.public_id}`}>Continue nomination</Link>}{kind === "membership" && ["draft", "more_info_required"].includes(String(record.status)) && <button disabled={busy === id} className="btn-primary" onClick={() => void action(record)}>Submit</button>}</div></Card>;
  })}</div> : <Empty title={kind === "awards" ? "You have no award nominations yet" : `No ${title.toLowerCase()} yet`} text={kind === "awards" ? "Explore the available awards to start and save a nomination." : "Items linked to your account will appear here automatically."} />}</>;
}

function BookingCard({
  record,
  busy,
  onCancel,
}: {
  record: Record<string, unknown>;
  busy: boolean;
  onCancel: () => void;
}) {
  const status = String(record.status || "registered");
  const reference = String(record.reference || "");
  const startsAt = record.starts_at ? new Date(String(record.starts_at)) : null;
  const canCancel = !["cancelled", "attended"].includes(status) && (!startsAt || startsAt.getTime() > Date.now());
  const location = record.is_online_event
    ? "Online event"
    : String(record.venue_name || record.location || "Location to be confirmed");
  const amount = Number(record.total_amount || 0);
  const total = amount > 0
    ? new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: String(record.currency || "GBP"),
    }).format(amount)
    : "Free";

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[#E8DED2] bg-[#FFFDF9] px-5 py-5 md:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-black tracking-[-.02em] text-[#171411]">{String(record.event_name || "IPC event")}</h2>
              <Status value={status} />
            </div>
            <p className="mt-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[.16em] text-primary-800">
              <Ticket size={14} />
              Booking reference: {reference || "Pending"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {reference && (
              <Link to={`/events/registration/${encodeURIComponent(reference)}`} className="btn-primary">
                <Eye size={16} />
                View booking
              </Link>
            )}
            {canCancel && (
              <button
                type="button"
                disabled={busy}
                onClick={onCancel}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-700/25 bg-white px-4 text-xs font-bold uppercase tracking-wide text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <XCircle size={16} />
                {busy ? "Cancelling..." : "Cancel booking"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-[#E8DED2] sm:grid-cols-2 xl:grid-cols-4">
        <BookingDetail
          icon={CalendarDays}
          label="Date"
          value={startsAt ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(startsAt) : "To be confirmed"}
        />
        <BookingDetail
          icon={Clock3}
          label="Time"
          value={startsAt ? `${new Intl.DateTimeFormat("en-GB", { timeStyle: "short" }).format(startsAt)} · ${String(record.timezone || "Local time")}` : "To be confirmed"}
        />
        <BookingDetail icon={MapPin} label="Location" value={location} />
        <BookingDetail icon={Ticket} label="Ticket" value={`${String(record.ticket_name || "Event registration")} × ${Number(record.quantity || 1)}`} />
        <BookingDetail icon={CreditCard} label="Payment" value={`${total} · ${String(record.payment_status || "not required").replaceAll("_", " ")}`} />
        <BookingDetail icon={MailCheck} label="Confirmation email" value={String(record.confirmation_email_status || "pending")} />
        <BookingDetail label="Booked for" value={String(record.name || record.email || "IPC member")} />
        <BookingDetail
          label="Booked on"
          value={record.created_at ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(String(record.created_at))) : "—"}
        />
      </div>
    </Card>
  );
}

function BookingDetail({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white px-5 py-4">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em] text-[#8A7E72]">
        {Icon && <Icon size={14} className="text-primary-700" />}
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold capitalize text-[#322C27]">{value}</p>
    </div>
  );
}

function SupportForm({ done }: { done: () => void }) {
  const [saving, setSaving] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setSaving(true);
    try { await panelApi.create("support", { category: form.get("category"), subject: form.get("subject"), initial_message: form.get("message") }); notifications.success("Support request created"); done(); }
    catch (reason) { notifications.error(reason instanceof Error ? reason.message : "Could not create request"); }
    finally { setSaving(false); }
  }
  return <Card className="mb-6"><form onSubmit={(event) => void submit(event)} className="grid gap-4 sm:grid-cols-2"><label><span className="text-sm font-medium">Category</span><select name="category" className={inputClass}><option value="account">Account</option><option value="membership">Membership</option><option value="events">Events</option><option value="other">Other</option></select></label><label><span className="text-sm font-medium">Subject</span><input required name="subject" className={inputClass} /></label><label className="sm:col-span-2"><span className="text-sm font-medium">How can we help?</span><textarea required minLength={10} name="message" rows={4} className={inputClass} /></label><button disabled={saving} className="btn-primary sm:col-span-2 sm:justify-self-start">{saving ? "Sending…" : "Send request"}</button></form></Card>;
}

export function SettingsPage() {
  const load = useCallback(() => panelApi.preferences(), []);
  const { data, loading, error, reload, setData } = useLoad(load);
  const [saving, setSaving] = useState(false);
  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error} retry={reload} />;
  async function update(patch: Partial<Preference>) {
    setSaving(true);
    try { const next = await panelApi.updatePreferences(patch); setData(next); notifications.success("Preferences saved"); }
    catch (reason) { notifications.error(reason instanceof Error ? reason.message : "Could not save preferences"); }
    finally { setSaving(false); }
  }
  return <><PageHeading title="Settings and privacy" description="Control profile visibility and the communications you receive from IPC." /><Card className="max-w-3xl"><label className="block"><span className="text-sm font-medium">Profile visibility</span><select disabled={saving} className={`${inputClass} max-w-sm`} value={data.profile_visibility} onChange={(event) => void update({ profile_visibility: event.target.value as Preference["profile_visibility"] })}><option value="private">Private</option><option value="members">IPC members</option><option value="public">Public</option></select></label><div className="mt-6 divide-y divide-background-200">{(["email_notifications", "club_communications", "event_reminders", "marketing_consent"] as const).map((key) => <label key={key} className="flex cursor-pointer items-center justify-between gap-4 py-4"><span className="text-sm font-medium capitalize">{key.replaceAll("_", " ")}</span><input type="checkbox" className="h-5 w-5 accent-primary-600" checked={data[key]} onChange={(event) => void update({ [key]: event.target.checked })} /></label>)}</div></Card></>;
}
