import { Search } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import ClubJoinModal, { type ClubJoinDetails } from "@/features/clubs/components/ClubJoinModal";
import { panelApi, rows } from "../api";
import { Card, Empty, ErrorState, inputClass, Loading, PageHeading, Status } from "../components/PanelUI";
import { useLoad } from "../hooks";
import type { DirectoryItem } from "../types";

const config = {
  scholarships: { title: "Scholarships", description: "Explore funding opportunities and start a secure application.", empty: "No active scholarships are currently listed." },
  awards: { title: "Awards", description: "Discover IPC recognition programmes and nominate outstanding professionals.", empty: "No active awards are currently listed." },
  clubs: { title: "Professional clubs", description: "Connect with regional and specialist IPC communities.", empty: "No active clubs are currently listed." },
  programmes: { title: "Programmes", description: "Explore professional learning programmes and contact the programme team.", empty: "No active programmes are currently listed." },
} as const;

export default function DirectoryPage({ kind }: { kind: keyof typeof config }) {
  const load = useCallback((signal: AbortSignal) => panelApi.list<DirectoryItem>(kind, signal), [kind]);
  const { data, loading, error, reload } = useLoad(load);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState("");
  const [joiningClub, setJoiningClub] = useState<DirectoryItem | null>(null);
  const items = useMemo(
    () => rows(data).filter((item) =>
      `${item.title || item.name} ${item.summary || ""} ${item.category || item.location || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
    [data, query],
  );

  async function act(item: DirectoryItem, clubDetails?: ClubJoinDetails) {
    const id = item.slug;
    setBusy(id);
    try {
      if (kind === "clubs") {
        await panelApi.action(`clubs/${id}/join`, clubDetails);
      } else if (kind === "scholarships") {
        await panelApi.create("scholarships/applications", { scholarship: id, current_step: 1, statement: "", responses: {} });
      } else {
        await panelApi.create("programmes/enquiries", { programme: id, message: "I would like more information about this programme." });
      }
      toast.success(kind === "clubs" ? "Join request sent" : "Draft created");
      if (kind === "clubs") {
        setJoiningClub(null);
        reload();
      }
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Action failed");
    } finally {
      setBusy("");
    }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorState message={error} retry={reload} />;

  return (
    <>
      <PageHeading title={config[kind].title} description={config[kind].description} />
      <label className="relative mb-6 block max-w-xl">
        <Search className="absolute left-3 top-3.5 text-foreground-400" size={18} />
        <input aria-label={`Search ${kind}`} className={`${inputClass} mt-0 pl-10`} placeholder={`Search ${kind}…`} value={query} onChange={(event) => setQuery(event.target.value)} />
      </label>
      {items.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const pending = kind === "clubs" && item.membership_status === "pending";
            return (
              <Card key={item.slug} className="flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary-700">{item.category || item.location || item.provider || kind.slice(0, -1)}</p>
                  {item.membership_status && <Status value={item.membership_status} />}
                </div>
                <h2 className="mt-3 text-xl font-semibold">{item.title || item.name}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-foreground-600">{item.summary || item.description}</p>
                {item.deadline && <p className="mt-4 text-xs text-foreground-500">Deadline: {new Date(item.deadline).toLocaleDateString()}</p>}
                {kind === "awards" ? (
                  <Link to={`/user/awards/${item.slug}/apply`} className="btn-primary mt-5 w-full">Start nomination</Link>
                ) : kind === "clubs" && item.membership_status === "active" ? (
                  <Link to={item.slug} className="btn-primary mt-5 w-full">Open community</Link>
                ) : (
                  <button
                    disabled={busy === item.slug || pending}
                    onClick={() => kind === "clubs" ? setJoiningClub(item) : void act(item)}
                    className={`mt-5 min-h-12 w-full rounded-xl px-4 text-xs font-black uppercase tracking-wide ${pending ? "cursor-not-allowed border border-amber-300 bg-amber-50 text-amber-800 opacity-80" : "btn-primary"}`}
                  >
                    {busy === item.slug ? "Please wait…" : pending ? "Pending admin approval" : kind === "clubs" ? "Request to join" : kind === "programmes" ? "Request information" : "Start application"}
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      ) : <Empty title={`No ${kind} found`} text={config[kind].empty} />}

      {joiningClub && (
        <ClubJoinModal
          clubName={joiningClub.name || joiningClub.title || "IPC Club"}
          open
          saving={busy === joiningClub.slug}
          onClose={() => setJoiningClub(null)}
          onSubmit={(details) => void act(joiningClub, details)}
        />
      )}
    </>
  );
}
