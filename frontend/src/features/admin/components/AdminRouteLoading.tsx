import {
  CalendarDays,
  FileText,
  Inbox,
  LayoutDashboard,
  Menu,
  UserRound,
  UsersRound,
} from "lucide-react";

const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Applications", icon: FileText },
  { label: "Enquiries", icon: Inbox },
  { label: "Events", icon: CalendarDays },
  { label: "Users", icon: UsersRound },
  { label: "Profile", icon: UserRound },
];

export default function AdminRouteLoading() {
  return (
    <div
      className="min-h-[100svh] bg-[#F4ECE1] text-[#221E1A] xl:grid xl:grid-cols-[280px_minmax(0,1fr)]"
      role="status"
      aria-label="Loading admin session"
    >
      <aside className="hidden h-[100dvh] p-5 pr-0 xl:block">
        <div className="flex h-full flex-col overflow-hidden rounded-[22px] bg-[#0B0B0B] text-white shadow-[0_18px_50px_rgba(11,11,11,0.18)]">
          <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-500 text-xs font-black text-[#0B0B0B]">
                IPC
              </span>
              <div>
                <p className="text-sm font-bold">IPC Admin</p>
                <p className="text-[9px] uppercase tracking-[0.18em] text-white/40">
                  Control centre
                </p>
              </div>
            </div>
            <Menu size={21} className="text-white/60" />
          </div>
          <nav className="flex-1 space-y-1 px-4 py-5" aria-hidden="true">
            <p className="mb-3 px-3 font-mono text-[9px] uppercase tracking-[0.24em] text-white/30">
              Workspace
            </p>
            {navigation.map(({ label, icon: Icon }, index) => (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${index === 0 ? "bg-primary-500 font-semibold text-[#0B0B0B]" : "text-white/45"}`}
              >
                <Icon size={18} />
                {label}
              </div>
            ))}
          </nav>
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-2.5">
              <span className="h-10 w-10 rounded-full bg-primary-500" />
              <div className="space-y-2">
                <span className="block h-2.5 w-24 rounded bg-white/15" />
                <span className="block h-2 w-32 rounded bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 p-4 xl:py-5 xl:pr-5">
        <header className="flex h-16 items-center rounded-2xl border border-white/80 bg-[#FFFDF9] px-4 shadow-[0_8px_30px_rgba(66,48,31,0.06)] md:px-6">
          <Menu size={20} className="mr-3 xl:hidden" />
          <div>
            <p className="text-sm font-bold">Admin</p>
            <p className="hidden text-xs text-[#7A7066] sm:block">
              Institute of Project Controls
            </p>
          </div>
        </header>
        <main className="mt-4 grid min-h-[calc(100vh-6.75rem)] place-items-center rounded-2xl border border-white/70 bg-white/65 shadow-[0_8px_30px_rgba(66,48,31,0.04)]">
          <div className="flex flex-col items-center gap-4">
            <img
              src={`${import.meta.env.BASE_URL}images/admin-loading.gif`}
              alt=""
              className="h-28 w-28 object-contain"
            />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-primary-800">
              Loading dashboard
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
