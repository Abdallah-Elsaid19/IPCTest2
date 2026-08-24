import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Award, Bell, CalendarDays, GraduationCap, LoaderCircle, MapPin, Search, ShieldCheck, Trophy, X } from "lucide-react";
import { Link } from "react-router-dom";

import SEO from "@/components/seo/SEO";
import { apiJson } from "@/lib/api";

const ANNOUNCEMENT_TIME = Date.parse("2026-09-10T14:00:00+01:00");
const SHOW_COUNTDOWN_WIDGET = true;
const IPC_HOME_OWL_IMAGE = `${__BASE_PATH__.replace(/\/$/, "")}/images/ipc-home-owl.webp`;

type CountdownUnit = {
  label: string;
  value: number;
};

function getCountdown(now: number, announcementTime: number): CountdownUnit[] {
  const remaining = Math.max(0, announcementTime - now);

  return [
    { label: "Days", value: Math.floor(remaining / 86_400_000) },
    { label: "Hours", value: Math.floor((remaining / 3_600_000) % 24) },
    { label: "Minutes", value: Math.floor((remaining / 60_000) % 60) },
    { label: "Seconds", value: Math.floor((remaining / 1_000) % 60) },
  ];
}

function CountdownCard({ label, value }: CountdownUnit) {
  const digits = String(value).padStart(2, "0").split("");

  return (
    <div className="min-w-0 text-center">
      <div className="flex justify-center gap-1.5 sm:gap-2" aria-label={`${String(value).padStart(2, "0")} ${label}`}>
        {digits.map((digit, index) => (
          <FlipDigit key={`${label}-${index}`} digit={digit} />
        ))}
      </div>
      <span className="mt-4 block font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-primary-300 sm:mt-5 sm:text-[10px]">
        {label}
      </span>
    </div>
  );
}

function FlipDigit({ digit }: { digit: string }) {
  const previousDigit = useRef(digit);
  const hasChanged = previousDigit.current !== digit;
  const outgoingDigit = previousDigit.current;

  useEffect(() => {
    previousDigit.current = digit;
  }, [digit]);

  return (
    <span
      className="countdown-flap relative grid h-[clamp(4.4rem,8vw,7rem)] w-[clamp(2.8rem,5vw,4.35rem)] shrink-0 place-items-center overflow-hidden rounded-[0.6rem] border border-primary-300/30 bg-[linear-gradient(180deg,#e7a33a_0%,#db9325_49.4%,#b96e11_50.6%,#c57b18_100%)] shadow-[0_13px_28px_rgba(0,0,0,.32),inset_0_1px_0_rgba(255,255,255,.18)]"
      aria-hidden="true"
    >
      <span key={digit} className={`countdown-digit ${hasChanged ? "countdown-digit-in" : ""}`}>
        {digit}
      </span>
      {hasChanged && (
        <span key={`${outgoingDigit}-${digit}`} className="countdown-digit countdown-digit-out">
          {outgoingDigit}
        </span>
      )}
      <span className="pointer-events-none absolute -left-px top-1/2 z-30 h-2.5 w-1.5 -translate-y-1/2 rounded-r-full border-y border-r border-white/50 bg-black" />
      <span className="pointer-events-none absolute -right-px top-1/2 z-30 h-2.5 w-1.5 -translate-y-1/2 rounded-l-full border-y border-l border-white/50 bg-black" />
    </span>
  );
}

function AnnouncementDatePanel() {
  return (
    <>
      <div className="inline-flex max-w-[90vw] items-center gap-3 border border-primary-400/35 bg-primary-400/[0.08] px-4 py-2.5 text-primary-200">
        <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-400" />
        </span>
        <span className="whitespace-nowrap font-mono text-[9px] font-semibold uppercase tracking-[0.2em] sm:text-[10px]">
          IPC Scholarship Fund &middot; 2026
        </span>
      </div>

      <div className="w-[min(26rem,82vw)] border border-white/15 bg-[#0d111b]/90 p-3 text-center shadow-[0_24px_70px_rgba(0,0,0,.28)] backdrop-blur-md sm:p-4">
        <CalendarDays className="mx-auto text-primary-300" size={19} aria-hidden="true" />
        <p className="mt-2.5 font-heading text-lg font-semibold text-white sm:text-xl">10 September 2026</p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-background-400">2:00 PM London time</p>
      </div>
    </>
  );
}

const CONFETTI_COLOURS = ["#f7d37a", "#d89524", "#fff0b8", "#b87513"];

function GoldenConfetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden" aria-hidden="true">
      {Array.from({ length: 48 }, (_, index) => (
        <span
          key={index}
          className="gold-confetti-strip absolute -top-12 block"
          style={{
            left: `${(index * 37) % 101}%`,
            width: `${4 + (index % 4)}px`,
            height: `${22 + ((index * 7) % 25)}px`,
            backgroundColor: CONFETTI_COLOURS[index % CONFETTI_COLOURS.length],
            animationDelay: `${(index % 13) * 0.075}s`,
            animationDuration: `${2.8 + (index % 8) * 0.16}s`,
          }}
        />
      ))}
    </div>
  );
}

type ScholarshipRecipient = {
  id: number;
  name: string;
  award: string;
  country: string;
  modules: string[];
  category: string;
  year: number;
  award_round: 1 | 2;
  photo_url: string;
};

function recipientInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "IPC";
}

function RecipientPortrait({ recipient, className = "" }: { recipient: ScholarshipRecipient; className?: string }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(recipient.photo_url) && !imageFailed;

  return (
    <div className={`relative aspect-[4/5] overflow-hidden bg-[#121722] ${className}`}>
      {showImage ? (
        <img
          src={recipient.photo_url}
          alt={`2026 IPC scholarship recipient announcement for ${recipient.name}`}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_50%_35%,rgba(216,149,36,.25),transparent_55%),linear-gradient(145deg,#171c28,#090b10)]">
          <span className="grid h-28 w-28 place-items-center rounded-full border border-primary-300/35 bg-primary-400/10 font-heading text-4xl font-semibold tracking-[-0.05em] text-primary-200 shadow-[0_0_55px_rgba(216,149,36,.16)] sm:h-32 sm:w-32 sm:text-5xl">
            {recipientInitials(recipient.name)}
          </span>
        </div>
      )}
    </div>
  );
}

function ScholarshipRecipientsReveal() {
  const [recipients, setRecipients] = useState<ScholarshipRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [awardFilter, setAwardFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [selectedRecipient, setSelectedRecipient] = useState<ScholarshipRecipient | null>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const modalTriggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError("");
    void apiJson<ScholarshipRecipient[]>(
      "/api/scholarship-announcement/recipients",
      undefined,
      { signal: controller.signal, cache: "no-store", requestSource: "ScholarshipAnnouncementRecipients" },
    )
      .then(setRecipients)
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : "The recipient register could not be loaded.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  const awardOptions = useMemo(
    () => [...new Set(recipients.map((recipient) => recipient.award).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [recipients],
  );
  const countryOptions = useMemo(
    () => [...new Set(recipients.map((recipient) => recipient.country).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [recipients],
  );
  const filteredRecipients = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return recipients.filter((recipient) => {
      const searchable = [
        recipient.name,
        recipient.award,
        recipient.country,
        recipient.category,
        ...recipient.modules,
      ].join(" ").toLocaleLowerCase();
      return (!query || searchable.includes(query))
        && (awardFilter === "all" || recipient.award === awardFilter)
        && (countryFilter === "all" || recipient.country === countryFilter);
    });
  }, [awardFilter, countryFilter, recipients, searchQuery]);

  const filtersAreActive = Boolean(searchQuery.trim()) || awardFilter !== "all" || countryFilter !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setAwardFilter("all");
    setCountryFilter("all");
  };

  const openRecipient = (recipient: ScholarshipRecipient, trigger: HTMLElement) => {
    modalTriggerRef.current = trigger;
    setSelectedRecipient(recipient);
  };

  const closeRecipient = useCallback(() => {
    setSelectedRecipient(null);
    window.requestAnimationFrame(() => modalTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!selectedRecipient) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalCloseRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRecipient();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [closeRecipient, selectedRecipient]);

  return (
    <div className="relative pb-0">
      <div className="pointer-events-none absolute inset-x-1/2 top-[-7rem] h-[48rem] w-screen -translate-x-1/2 overflow-hidden" aria-hidden="true">
        <div className="announcement-gold-haze absolute inset-0" />
        {Array.from({ length: 26 }, (_, index) => (
          <span key={index} className="announcement-gold-speck absolute rounded-sm bg-primary-400" style={{ left: `${(index * 41) % 99}%`, top: `${8 + ((index * 29) % 82)}%`, animationDelay: `${(index % 9) * 0.18}s` }} />
        ))}
        <span className="announcement-ribbon announcement-ribbon-left" />
        <span className="announcement-ribbon announcement-ribbon-right" />
      </div>
      <div className="relative grid min-h-[39rem] items-center gap-12 py-14 lg:grid-cols-[minmax(0,1.12fr)_minmax(24rem,.72fr)] lg:gap-20 lg:py-20">
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-primary-400">
            <Award size={15} aria-hidden="true" /> Official recipient announcement <span aria-hidden="true">✦</span>
          </span>
          <h1 className="mt-7 max-w-[49rem] font-heading text-[clamp(3rem,6.2vw,6.7rem)] font-semibold leading-[0.88] tracking-[-0.055em] text-white">
            Celebrating the<br />
            <span className="bg-gradient-to-b from-[#ffe2a0] via-[#dba13a] to-[#9d6415] bg-clip-text text-transparent">2026 IPC</span><br />
            Scholarship &amp;<br />Bursary Recipients
          </h1>
          <p className="mt-8 max-w-2xl text-sm leading-7 text-background-300 sm:text-base">
            The Institute of Project Controls is pleased to recognise the professionals selected for support through the <strong className="font-semibold text-white">IPC Scholarship and Bursary Fund</strong>. Each person listed below has been awarded the stated professional-development support for the 2026 intake.
          </p>
          <div className="mt-7 flex max-w-2xl items-start gap-4 rounded-xl border border-primary-400/35 bg-black/45 px-5 py-4 text-sm leading-6 text-background-200 shadow-[inset_0_1px_rgba(255,221,153,.08),0_18px_50px_rgba(0,0,0,.35)] backdrop-blur-sm">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-primary-400/65 text-primary-300" aria-hidden="true">★</span>
            <p><strong className="font-semibold text-white">These are the approved Round Two recipients.</strong>{" "}Only applications approved for public release are included in this register.</p>
          </div>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a href="#recipient-register" className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 bg-gradient-to-r from-[#f2c567] to-[#d99b2f] px-8 text-[11px] font-black uppercase tracking-[0.12em] text-black shadow-[0_10px_35px_rgba(216,149,36,.2)] transition hover:brightness-110">
              View all recipients <ArrowRight size={16} aria-hidden="true" />
            </a>
            <Link to="/bursary-scholarship-application" className="inline-flex min-h-[3.25rem] items-center justify-center border border-primary-400/55 bg-black/30 px-8 text-[11px] font-bold uppercase tracking-[0.12em] text-primary-100 transition hover:bg-primary-400 hover:text-background-950">
              Apply for IPC support <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-[1.75rem] border border-primary-400/55 bg-[linear-gradient(145deg,rgba(32,29,24,.94),rgba(8,9,9,.98))] p-6 shadow-[0_30px_100px_rgba(0,0,0,.65),inset_0_0_70px_rgba(216,149,36,.06)] backdrop-blur-md sm:p-9" aria-label="Official announcement details">
          <div className="pointer-events-none absolute inset-3 rounded-[1.25rem] border border-primary-400/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full border border-primary-400/15" aria-hidden="true" />
          <div className="relative mx-auto w-fit border border-primary-400/35 bg-primary-400/[.07] px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[.22em] text-primary-300">✦ IPC Scholarship Fund · 2026</div>
          <div className="relative mx-auto mt-7 flex h-28 w-44 items-center justify-center" aria-hidden="true">
            <span className="absolute left-0 text-7xl text-primary-500/80">❧</span>
            <span className="absolute right-0 -scale-x-100 text-7xl text-primary-500/80">❧</span>
            <span className="grid h-20 w-20 place-items-center rounded-full border-2 border-primary-400 bg-black font-heading text-2xl font-bold text-primary-200 shadow-[0_0_35px_rgba(216,149,36,.25)]">IPC</span>
          </div>
          <h2 className="relative mt-4 text-center font-heading text-[clamp(2rem,3vw,3rem)] font-semibold leading-tight tracking-[-0.035em] text-white">Official 2026<br />Recipient Register</h2>
          <p className="relative mx-auto mt-5 max-w-md text-center text-sm leading-6 text-background-400">
            This page is the approved public record of IPC scholarship and bursary recipients. Details appear only where publication consent has been confirmed.
          </p>
          <dl className="relative mt-8 grid overflow-hidden rounded-xl border border-primary-400/30 sm:grid-cols-2">
            {[
              ["Announcement date", "10 September 2026"],
              ["Academic intake", "2026 programme year"],
              ["Total 2026 recipients", isLoading ? "Loading…" : `${recipients.length} recipients`],
              ["Record status", "Official announcement"],
            ].map(([label, value]) => (
              <div key={label} className="border-b border-primary-400/20 bg-black/35 p-5 odd:border-r sm:[&:nth-last-child(-n+2)]:border-b-0">
                <dt className="font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-primary-400">{label}</dt>
                <dd className="mt-2 text-sm font-semibold text-white">{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>

      <section id="recipient-register" className="relative left-1/2 w-screen -translate-x-1/2 scroll-mt-28 border-y border-primary-400/20 bg-[radial-gradient(circle_at_50%_0%,rgba(216,149,36,.07),transparent_30%),#080909] py-14 text-white lg:py-20" aria-label="Recipient directory">
        <div className="container-content">
        <div className="flex items-center gap-3" aria-hidden="true">
          <span className="h-px w-12 bg-primary-500" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-primary-400">Recipient directory</span>
          <span className="h-px flex-1 bg-gradient-to-r from-primary-500/70 to-transparent" />
        </div>
      {isLoading && (
        <div className="grid min-h-64 place-items-center" role="status">
          <div className="text-center text-primary-800"><LoaderCircle className="mx-auto animate-spin" size={28} /><p className="mt-3 text-sm">Preparing the announcement…</p></div>
        </div>
      )}

      {!isLoading && error && (
        <div className="mx-auto mt-12 max-w-xl bg-red-700/10 p-6 text-center text-sm text-red-800" role="alert">{error}</div>
      )}

      {!isLoading && !error && recipients.length === 0 && (
        <div className="mx-auto mt-12 max-w-2xl bg-white/65 p-8 text-center shadow-[0_20px_60px_rgba(61,42,12,.08)]">
          <GraduationCap className="mx-auto text-primary-700" size={34} aria-hidden="true" />
          <h2 className="mt-5 font-heading text-2xl font-semibold text-background-950">Recipients will be published shortly.</h2>
          <p className="mt-3 text-sm leading-7 text-foreground-700">The announcement is open. Approved recipient profiles will appear here as soon as they are available.</p>
        </div>
      )}

      {!isLoading && !error && recipients.length > 0 && (
        <>
          <div className="mt-7 rounded-2xl border border-primary-400/20 bg-[linear-gradient(100deg,rgba(34,31,27,.98),rgba(65,61,55,.72))] p-4 shadow-[0_24px_70px_rgba(0,0,0,.32),inset_0_1px_rgba(255,255,255,.05)] sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(16rem,1.4fr)_minmax(12rem,.8fr)_minmax(12rem,.8fr)_auto]">
              <label className="relative block">
                <span className="sr-only">Search recipients</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search by recipient or award"
                  className="min-h-[3.25rem] w-full rounded-lg border border-primary-400/35 bg-black/70 py-3 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-background-500 focus:border-primary-400"
                />
              </label>
              <label>
                <span className="sr-only">Filter by award</span>
                <select
                  value={awardFilter}
                  onChange={(event) => setAwardFilter(event.target.value)}
                  className="min-h-[3.25rem] w-full rounded-lg border border-primary-400/25 bg-black/55 px-4 py-3 text-sm text-background-200 outline-none transition focus:border-primary-400"
                >
                  <option value="all">All awards</option>
                  {awardOptions.map((award) => <option key={award} value={award}>{award}</option>)}
                </select>
              </label>
              <label>
                <span className="sr-only">Filter by location</span>
                <select
                  value={countryFilter}
                  onChange={(event) => setCountryFilter(event.target.value)}
                  className="min-h-[3.25rem] w-full rounded-lg border border-primary-400/25 bg-black/55 px-4 py-3 text-sm text-background-200 outline-none transition focus:border-primary-400"
                >
                  <option value="all">All locations</option>
                  {countryOptions.map((country) => <option key={country} value={country}>{country}</option>)}
                </select>
              </label>
              <button
                type="button"
                onClick={clearFilters}
                disabled={!filtersAreActive}
                className="min-h-[3.25rem] rounded-lg border border-primary-400/30 bg-primary-400/[.05] px-5 text-xs font-semibold text-primary-200 transition hover:border-primary-400 hover:bg-primary-400/10 disabled:cursor-default disabled:opacity-35"
              >
                Clear filters
              </button>
            </div>
            <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-background-400" aria-live="polite">
              Showing <strong className="text-primary-300">{filteredRecipients.length}</strong> of <strong className="text-white">{recipients.length}</strong> recipients
            </p>
          </div>

          {filteredRecipients.length > 0 ? (
            <div className="mx-auto mt-9 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-6">
              {filteredRecipients.map((recipient, index) => (
                <article
                  key={recipient.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`View award details for ${recipient.name}`}
                  onClick={(event) => openRecipient(recipient, event.currentTarget)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openRecipient(recipient, event.currentTarget);
                    }
                  }}
                  className={`group relative cursor-pointer overflow-hidden rounded-lg border border-primary-400/50 bg-[#0d0f10] shadow-[0_24px_65px_rgba(0,0,0,.55),0_0_18px_rgba(216,149,36,.08)] transition duration-300 hover:-translate-y-1 hover:border-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 lg:col-span-2 ${filteredRecipients.length === 5 && index === 3 ? "lg:col-start-2" : ""}`}
                >
                  <span className="pointer-events-none absolute inset-2 z-10 rounded border border-primary-300/10" aria-hidden="true" />
                  <RecipientPortrait recipient={recipient} />
                  <div className="sr-only">
                    <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full border border-primary-500/15" aria-hidden="true" />
                    <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full border border-primary-500/10" aria-hidden="true" />
                    <h2 className="relative font-heading text-2xl font-semibold tracking-[-0.025em] text-background-950">{recipient.name}</h2>
                    <p className="relative mt-3 flex items-start gap-2 text-sm font-medium leading-6 text-foreground-700"><GraduationCap className="mt-0.5 shrink-0 text-primary-700" size={16} aria-hidden="true" />{recipient.award || "IPC Scholarship Fund 2026"}</p>
                    {recipient.country && <p className="relative mt-2 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-primary-800"><MapPin className="text-primary-600" size={14} aria-hidden="true" />{recipient.country}</p>}
                    <div className="relative mt-6 flex items-center justify-between border-t border-background-950/10 pt-4 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-primary-800">
                      <span>Official award · {recipient.year}</span>
                      <span className="inline-flex items-center gap-1.5">Details <ArrowRight size={13} aria-hidden="true" /></span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 border border-primary-400/25 bg-white/[.04] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,.28)]">
              <Search className="mx-auto text-primary-400" size={30} aria-hidden="true" />
              <h2 className="mt-4 font-heading text-2xl font-semibold text-white">No recipients match these filters.</h2>
              <p className="mt-2 text-sm text-background-400">Try another name, award or location.</p>
              <button type="button" onClick={clearFilters} className="mt-6 bg-primary-500 px-6 py-3 text-xs font-bold uppercase tracking-[0.1em] text-background-950 hover:bg-primary-400">Clear filters</button>
            </div>
          )}
        </>
      )}

        {!isLoading && !error && recipients.length > 0 && (
          <div className="mx-auto mt-10 flex max-w-6xl items-start gap-4 rounded-xl border border-primary-400/35 bg-primary-400/[.045] p-5 text-sm leading-7 text-background-300 sm:p-6">
            <ShieldCheck className="mt-0.5 shrink-0 text-primary-400" size={23} aria-hidden="true" />
            <p><strong className="font-semibold text-primary-200">Publication notice.</strong> Only information approved for public release is shown. Financial values, personal contact details and private circumstances are intentionally excluded to protect recipient privacy.</p>
          </div>
        )}
        </div>
      </section>

      <section id="future-opportunities" className="relative left-1/2 w-screen -translate-x-1/2 scroll-mt-28 overflow-hidden border-b border-primary-400/25 bg-[#0a0b0b]" aria-labelledby="future-opportunities-title">
        <div className="announcement-next-bg pointer-events-none absolute inset-0" aria-hidden="true" />
        <span className="announcement-ribbon announcement-ribbon-left !bottom-[-8rem] !left-[-11rem] !top-auto" aria-hidden="true" />
        <span className="announcement-ribbon announcement-ribbon-right !right-[-10rem] !top-[1rem]" aria-hidden="true" />
        <div className="container-content relative grid items-center gap-10 py-14 lg:grid-cols-[16rem_minmax(0,1fr)] lg:py-20">
          <div className="relative mx-auto flex h-52 w-52 items-end justify-center" aria-hidden="true">
            <div className="absolute bottom-0 h-5 w-48 rounded-[50%] bg-primary-400/20 blur-xl" />
            <div className="absolute bottom-0 h-8 w-48 rounded-t-lg border border-primary-400/45 bg-[linear-gradient(#2f2414,#0b0b0b)]" />
            <div className="absolute bottom-7 h-6 w-36 rounded-t-lg border border-primary-400/45 bg-[linear-gradient(#413019,#111)]" />
            <Trophy size={150} strokeWidth={1.05} className="absolute bottom-10 text-[#e7b751] drop-shadow-[0_0_20px_rgba(216,149,36,.45)]" />
            <span className="absolute bottom-[6.9rem] grid h-12 w-12 place-items-center rounded-full border border-primary-200 bg-black font-heading text-xs font-bold text-primary-200">IPC</span>
          </div>
          <div className="relative">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.27em] text-primary-400">Be part of the next generation</p>
            <h2 id="future-opportunities-title" className="mt-4 max-w-3xl font-heading text-[clamp(2.7rem,5vw,5.1rem)] font-semibold leading-[.92] tracking-[-0.045em] text-white">Be part of the next<br /><span className="text-primary-400">IPC Fund round.</span></h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-background-300 sm:text-base">Round Two recipients have been announced. New scholarship and bursary applications remain subject to eligibility review, available funding and written approval by IPC.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/bursary-scholarship-application" className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 bg-gradient-to-r from-[#f2c567] to-[#d99b2f] px-8 text-[11px] font-black uppercase tracking-[0.12em] text-black transition hover:brightness-110">Apply for IPC support <ArrowRight size={16} aria-hidden="true" /></Link>
              <Link to="/contact" className="inline-flex min-h-[3.25rem] items-center justify-center border border-primary-400/45 bg-black/40 px-8 text-[11px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-primary-400 hover:text-black">Contact IPC</Link>
            </div>
          </div>
        </div>
      </section>

      {selectedRecipient && (
        <div
          className="fixed inset-0 z-[100] grid overflow-y-auto bg-black/85 p-4 backdrop-blur-md sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recipient-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeRecipient();
          }}
        >
          <div className="relative m-auto grid w-full max-w-5xl overflow-hidden bg-[#f6f0e7] shadow-[0_40px_120px_rgba(0,0,0,.65)] lg:grid-cols-[minmax(18rem,.8fr)_minmax(0,1.2fr)]">
            <button
              ref={modalCloseRef}
              type="button"
              onClick={closeRecipient}
              aria-label="Close recipient details"
              className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-black/75 text-white backdrop-blur-md transition hover:bg-primary-500 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
            >
              <X size={20} aria-hidden="true" />
            </button>
            <div className="min-h-72 lg:min-h-[36rem]">
              <RecipientPortrait recipient={selectedRecipient} className="h-full min-h-72 aspect-auto lg:min-h-[36rem]" />
            </div>
            <div className="relative overflow-hidden p-7 sm:p-10 lg:p-12">
              <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border border-primary-600/15" aria-hidden="true" />
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-primary-700">Official {selectedRecipient.year} recipient</p>
              <h2 id="recipient-dialog-title" className="mt-4 max-w-2xl font-heading text-4xl font-semibold leading-tight tracking-[-0.04em] text-background-950 sm:text-5xl">{selectedRecipient.name}</h2>
              <p className="mt-4 text-lg font-semibold leading-7 text-primary-800">{selectedRecipient.award || "IPC Scholarship Fund"}</p>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-foreground-700 sm:text-base">
                {selectedRecipient.name} has been selected for support through the IPC Scholarship Fund for {selectedRecipient.year}, recognising their commitment to continued professional development in project controls.
              </p>

              <dl className="mt-8 grid gap-5 border-y border-background-950/10 py-6 sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.17em] text-primary-700">Programme</dt>
                  <dd className="mt-2 text-sm font-semibold text-background-950">{selectedRecipient.award || "IPC Scholarship Fund"}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.17em] text-primary-700">Location</dt>
                  <dd className="mt-2 text-sm font-semibold text-background-950">{selectedRecipient.country || "Not specified"}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.17em] text-primary-700">Award year</dt>
                  <dd className="mt-2 text-sm font-semibold text-background-950">{selectedRecipient.year}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.17em] text-primary-700">Category</dt>
                  <dd className="mt-2 text-sm font-semibold text-background-950">{selectedRecipient.category}</dd>
                </div>
              </dl>

              {selectedRecipient.modules.length > 0 && (
                <div className="mt-7">
                  <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary-700">Selected professional modules</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedRecipient.modules.map((module) => (
                      <span key={module} className="bg-primary-700/10 px-3 py-2 text-xs font-semibold text-primary-900">{module}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScholarshipAnnouncementPage() {
  const announcementTime = ANNOUNCEMENT_TIME;
  const [now, setNow] = useState(() => Date.now());
  const [email, setEmail] = useState("");
  const [reminderState, setReminderState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [reminderMessage, setReminderMessage] = useState("");
  const countdown = useMemo(() => getCountdown(now, announcementTime), [announcementTime, now]);
  const hasArrived = now >= announcementTime;

  useEffect(() => {
    if (hasArrived) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [hasArrived]);

  const requestReminder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReminderState("submitting");
    setReminderMessage("");

    try {
      await apiJson("/api/scholarship-reminders", {
        email: email.trim(),
        consent: true,
      }, {
        requestSource: "scholarship-announcement-reminder",
      });
      setReminderState("success");
      setReminderMessage("Your reminder request has been saved successfully.");
      setEmail("");
    } catch (error) {
      setReminderState("error");
      setReminderMessage(error instanceof Error ? error.message : "We could not save your reminder. Please try again.");
    }
  };

  return (
    <div className="relative isolate min-h-[calc(100svh-2.25rem)] overflow-hidden bg-black text-background-50">
      <SEO
        title="IPC Scholarship Announcement Countdown"
        description="Countdown to the Institute of Project Controls Round Two scholarship and bursary announcement on 10 September 2026."
        canonicalPath="/scholarships/announcement"
        keywords={["IPC scholarship announcement", "project controls bursary", "10 September 2026"]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Event",
          name: "IPC Scholarship and Bursary Announcement",
          startDate: "2026-09-10T14:00:00+01:00",
          eventStatus: "https://schema.org/EventScheduled",
          eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
          organizer: {
            "@type": "Organization",
            name: "Institute of Project Controls",
          },
        }}
      />

      <div className="pointer-events-none absolute inset-0 dot-grid-gold opacity-[0.16]" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-[-24rem] h-[54rem] w-[54rem] -translate-x-1/2 rounded-full bg-primary-500/[0.11] blur-[120px]" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-64 bottom-[-20rem] h-[46rem] w-[46rem] rounded-full bg-[#71599b]/10 blur-[150px]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-24 h-px bg-gradient-to-r from-transparent via-primary-400/30 to-transparent" aria-hidden="true" />

      {hasArrived && <GoldenConfetti />}

      <section className="container-content relative min-h-[calc(100svh-2.25rem)] pb-16 pt-28 lg:pb-20 lg:pt-32">
        {!hasArrived && <div className="relative flex min-w-0 flex-col items-start gap-5 sm:min-h-11 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/scholarships"
            className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-background-300 transition-colors hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Scholarships
          </Link>

          <div className="ml-auto hidden max-w-full items-center gap-3 border border-primary-400/35 bg-primary-400/[0.08] px-4 py-2.5 text-primary-200 lg:inline-flex">
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-400" />
            </span>
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.2em] sm:text-[10px]">
              IPC Scholarship Fund · 2026
            </span>
          </div>
        </div>}

        {hasArrived ? (
          <ScholarshipRecipientsReveal />
        ) : (
        <div className="relative mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:gap-16">
          <div className="order-2 min-w-0 lg:order-1 lg:-translate-y-12">
          <p className="mt-7 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-primary-400">
            Announcement countdown
          </p>
          <h1 className="mt-5 max-w-4xl font-heading text-[clamp(2.75rem,7vw,6.6rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-white">
            {hasArrived ? "The announcement day is here." : "The next chapter is almost here."}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-background-300 sm:text-lg sm:leading-8">
            Approved Round Two IPC scholarship and bursary applicants will be announced on 10 September 2026 at 2:00 PM London time and contacted directly using the details in their application.
          </p>

          {SHOW_COUNTDOWN_WIDGET && (
            <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3" aria-label="Time remaining until the scholarship announcement">
              {countdown.map((unit) => <CountdownCard key={unit.label} {...unit} />)}
            </div>
          )}

          <form onSubmit={requestReminder} className="mt-9 max-w-2xl" aria-label="Request a scholarship announcement reminder">
            <div className="flex flex-col gap-3 sm:flex-row">
              <label htmlFor="scholarship-reminder-email" className="sr-only">Email address</label>
              <input
                id="scholarship-reminder-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (reminderState !== "submitting") setReminderState("idle");
                }}
                required
                autoComplete="email"
                placeholder="Enter your email address"
                aria-describedby="scholarship-reminder-note scholarship-reminder-status"
                className="min-h-14 min-w-0 flex-1 border border-white/20 bg-white/[0.06] px-5 text-base text-white outline-none transition-colors placeholder:text-background-500 focus:border-primary-400 focus:bg-white/[0.09]"
              />
              <button
                type="submit"
                disabled={reminderState === "submitting"}
                className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 bg-primary-500 px-7 text-sm font-bold uppercase tracking-[0.08em] text-background-950 transition-colors hover:bg-primary-400 disabled:cursor-wait disabled:opacity-65"
              >
                {reminderState === "submitting" ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Bell size={18} aria-hidden="true" />}
                {reminderState === "submitting" ? "Saving..." : "Remind me"}
              </button>
            </div>
            <p id="scholarship-reminder-note" className="mt-3 text-xs leading-5 text-background-500">
              By requesting a reminder, you agree to receive IPC scholarship announcement updates at this email address.
            </p>
            <p
              id="scholarship-reminder-status"
              role="status"
              className={`mt-3 min-h-5 text-sm ${reminderState === "error" ? "text-red-300" : "text-primary-300"}`}
            >
              {reminderMessage}
            </p>
          </form>
          </div>

          <aside className="relative order-1 mx-auto min-h-[32rem] w-full max-w-[38rem] sm:min-h-[38rem] lg:order-2 lg:min-h-[46rem]" aria-label="IPC scholarship announcement date">
            <div
              className="pointer-events-none absolute -inset-x-6 inset-y-0 sm:-left-[12%] sm:-right-[20vw]"
              style={{
                WebkitMaskImage: "radial-gradient(ellipse 115% 115% at 100% 100%, black 0%, black 54%, rgba(0, 0, 0, 0.92) 68%, transparent 100%)",
                maskImage: "radial-gradient(ellipse 115% 115% at 100% 100%, black 0%, black 54%, rgba(0, 0, 0, 0.92) 68%, transparent 100%)",
              }}
            >
              <img
                src={IPC_HOME_OWL_IMAGE}
                alt="IPC owl from the home page, representing wisdom and foresight"
                width={1920}
                height={1280}
                loading="eager"
                fetchPriority="high"
                className="h-full w-full object-cover object-[center_48%] sm:object-left"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-black/20 via-transparent to-black/75 sm:from-transparent sm:via-black/30 sm:to-black/85" aria-hidden="true" />
              <div className="absolute inset-0 bg-gradient-to-b from-black via-black/20 to-black/55 sm:from-black/50 sm:via-transparent sm:to-black/70" aria-hidden="true" />
            </div>
            <div className="pointer-events-none absolute -inset-x-6 bottom-0 z-10 h-[52%] bg-gradient-to-b from-transparent via-black/75 to-black sm:-left-[12%] sm:-right-[20vw] sm:h-[46%]" aria-hidden="true" />

            {SHOW_COUNTDOWN_WIDGET && (
              <div className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-3 lg:hidden">
                <AnnouncementDatePanel />
              </div>
            )}

          </aside>

          {SHOW_COUNTDOWN_WIDGET && (
            <div className="absolute left-1/2 top-[-4.75rem] z-20 hidden w-[min(26rem,82vw)] -translate-x-1/2 border border-white/15 bg-[#0d111b]/90 p-4 text-center shadow-[0_24px_70px_rgba(0,0,0,.28)] backdrop-blur-md lg:block">
              <CalendarDays className="mx-auto text-primary-300" size={19} aria-hidden="true" />
              <p className="mt-2.5 font-heading text-lg font-semibold text-white sm:text-xl">10 September 2026</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-background-400">2:00 PM London time</p>
            </div>
          )}
        </div>
        )}
      </section>
    </div>
  );
}
