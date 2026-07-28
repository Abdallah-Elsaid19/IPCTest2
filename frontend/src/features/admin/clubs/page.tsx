import { Building2, Mail, MapPin, Search, UserCheck, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { adminApi } from "@/features/admin/adminApi";
import { AdminPageHeader, AdminPageState, EmptyState } from "@/features/admin/components/AdminPage";
import type { AdminClub, AdminClubMembership } from "@/features/admin/types";
import { notifications } from "@/lib/notifications";

export default function AdminClubsPage() {
  const [clubs, setClubs] = useState<AdminClub[] | null>(null);
  const [requests, setRequests] = useState<AdminClubMembership[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    const [clubRows, requestRows] = await Promise.all([
      adminApi.clubs(signal),
      adminApi.clubMemberships(signal),
    ]);
    setClubs(clubRows);
    setRequests(requestRows);
    setSelectedSlug((current) =>
      current && clubRows.some((club) => club.slug === current)
        ? current
        : clubRows[0]?.slug || "",
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).catch((reason: unknown) => {
      if (!controller.signal.aborted) {
        notifications.error(reason instanceof Error ? reason.message : "Clubs could not be loaded.");
        setClubs([]);
      }
    });
    return () => controller.abort();
  }, [load]);

  const selectedClub = clubs?.find((club) => club.slug === selectedSlug);
  const pendingCount = requests.filter((request) => request.status === "pending").length;
  const filteredMembers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return (selectedClub?.members || []).filter((member) =>
      !search || [member.name, member.job_title, member.employer, member.city, member.club_role]
        .some((value) => value.toLowerCase().includes(search)),
    );
  }, [query, selectedClub]);

  return (
    <AdminPageState isLoading={clubs === null} hasData={clubs !== null}>
      <AdminPageHeader
        eyebrow="Regional communities"
        title="Clubs"
        description="View every IPC regional club and manage the members with active access to its private community."
        action={
          <Link to="/admin/club-requests" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary-500 px-5 text-xs font-black text-[#171411] shadow-sm hover:bg-primary-600">
            <UserCheck size={17} />Club requests
            {pendingCount > 0 && <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-[#171411] px-1 text-[9px] text-white">{pendingCount}</span>}
          </Link>
        }
      />

      {clubs?.length ? (
        <>
          <section className="mt-8 overflow-hidden rounded-2xl border border-[#DDD1C2] bg-[#FFFDF9] shadow-sm">
            <div className="flex gap-1 overflow-x-auto border-b border-[#D8CCBD] bg-[#E9DED0] p-1.5" role="tablist" aria-label="IPC clubs">
              {clubs.map((club) => (
                <button
                  key={club.slug}
                  type="button"
                  role="tab"
                  aria-selected={selectedSlug === club.slug}
                  onClick={() => { setSelectedSlug(club.slug); setQuery(""); }}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[10px] border border-transparent px-4 text-xs font-black transition ${
                    selectedSlug === club.slug
                      ? "border-[#E6DBCE] bg-[#FFFDF9] text-primary-900 shadow-sm"
                      : "text-[#756B61] hover:bg-[#F2E9DE] hover:text-primary-900"
                  }`}
                >
                  <Building2 size={15} />{club.name}
                  <span className={`grid min-h-6 min-w-6 place-items-center rounded-full px-1.5 text-[10px] font-black ${
                    selectedSlug === club.slug
                      ? "bg-[#F2E9DE] text-primary-900"
                      : "bg-[#F7F1E9] text-[#6F655C]"
                  }`}>{club.active_member_count}</span>
                </button>
              ))}
            </div>

            {selectedClub && (
              <>
                <div className="grid gap-5 border-b border-[#E5DACD] p-5 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-black">{selectedClub.name}</h2><span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase text-emerald-700">{selectedClub.active_member_count} active members</span></div>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-[#756B61]">{selectedClub.summary || selectedClub.description}</p>
                    <div className="mt-3 flex flex-wrap gap-4 text-[10px] font-bold text-[#82776D]"><span className="flex items-center gap-1.5"><MapPin size={13} />{selectedClub.location}</span><span className="flex items-center gap-1.5"><Users size={13} />{selectedClub.discussion_count} discussions</span></div>
                  </div>
                  <label className="relative w-full lg:w-80"><Search className="absolute left-3 top-3 text-[#8A7F75]" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-11 w-full rounded-xl border border-[#D9CDBE] bg-white pl-10 pr-3 text-sm outline-none focus:border-primary-500" placeholder="Search club members…" /></label>
                </div>

                {filteredMembers.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-[#EEE4D7] text-[10px] uppercase tracking-[.12em] text-[#756B61]">
                        <tr><th className="px-5 py-3">Member</th><th className="px-5 py-3">Professional role</th><th className="px-5 py-3">Organisation</th><th className="px-5 py-3">Location</th><th className="px-5 py-3">Club role</th></tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7DDD1] bg-[#FFFDF9]">
                        {filteredMembers.map((member, index) => (
                          <tr key={`${member.name}-${index}`}>
                            <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#17191B] text-[10px] font-black text-white">{member.initials}</span><div><p className="font-black">{member.name}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-[#8A7F75]"><Mail size={11} />IPC member profile</p></div></div></td>
                            <td className="px-5 py-4 text-[#4F4943]">{member.job_title || "Not provided"}</td>
                            <td className="px-5 py-4 text-[#4F4943]">{member.employer || "Not provided"}</td>
                            <td className="px-5 py-4 text-[#6F655C]">{member.city || "Not provided"}</td>
                            <td className="px-5 py-4"><span className="rounded-full bg-primary-100 px-3 py-1 text-[9px] font-black uppercase text-primary-900">{member.club_role}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-5"><EmptyState>{query ? "No members match your search." : "This club has no active members yet."}</EmptyState></div>
                )}
              </>
            )}
          </section>
        </>
      ) : (
        <div className="mt-8"><EmptyState>No clubs are configured yet.</EmptyState></div>
      )}
    </AdminPageState>
  );
}
