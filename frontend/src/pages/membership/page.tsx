import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import PathwayCard from "@/components/base/PathwayCard";
import ResponsiveImage from "@/components/base/ResponsiveImage";
import { apiJson, type MembershipGrade } from "@/lib/api";
import { ManagedContentProvider, ManagedSectionGate, useManagedSection } from "@/components/content/ManagedContentProvider";
import ManagedPageSeo from "@/components/content/ManagedPageSeo";
import { pageSeo } from "@/config/pageSeo";
import MembershipComparisonTable from "@/pages/membership/components/MembershipComparisonTable";
import MembershipCompetenceMatrix from "@/pages/membership/components/MembershipCompetenceMatrix";
import MembershipValuePathway from "@/pages/membership/components/MembershipValuePathway";
import OrganisationalMembership from "@/pages/membership/components/OrganisationalMembership";
import ApplicationJourney from "@/pages/membership/components/ApplicationJourney";
import ProfessionalVisibility from "@/pages/membership/components/ProfessionalVisibility";
import MembershipQuestions from "@/pages/membership/components/MembershipQuestions";
import GradeFinderModal from "@/pages/membership/components/GradeFinderModal";

const membershipHeroBackground = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/54a9aa170171439581b2022efdf51f29.webp";
const membershipGradesBackground = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/f3a1049f03fb4811b7d859f44f2491d1.webp";

function MembershipHero() {
  const content = useManagedSection("hero", {
    eyebrow: "Professional recognition",
    title: "Membership and recognition",
    description: "Five progressive routes connect professional identity, evidence, development and contribution—from an entry relationship through active professional membership, evidence-based competence and senior recognition.",
    cta_label: "Explore membership grades",
    cta_url: "#grades",
  });
  return (
    <section className="relative min-h-[720px] overflow-hidden bg-background-950 pb-12 sm:flex sm:min-h-[76svh] sm:items-center sm:pb-20 md:min-h-[80vh]">
      <div className="absolute inset-x-0 top-0 aspect-[8/5] w-full sm:inset-y-0 sm:left-auto sm:right-0 sm:h-auto sm:w-[72%] sm:aspect-auto lg:w-[68%]">
        <ResponsiveImage
          src={membershipHeroBackground}
          alt=""
          width={1600}
          height={1000}
          sizes="(max-width: 639px) 100vw, 72vw"
          priority
          className="h-full w-full object-contain object-top sm:object-right"
        />
      </div>
      <div
        className="absolute inset-0 hidden sm:block"
        style={{
          background: "linear-gradient(90deg, oklch(var(--background-950)) 0%, oklch(var(--background-950) / 0.98) 27%, oklch(var(--background-950) / 0.78) 47%, oklch(var(--background-950) / 0.16) 72%, transparent 100%)",
        }}
      />
      <div className="absolute inset-0 hidden bg-gradient-to-b from-background-950/30 via-transparent to-background-950/65 sm:block" />
      <div className="absolute inset-x-0 top-0 aspect-[8/5] bg-gradient-to-b from-transparent from-[35%] via-background-950/45 via-[70%] to-background-950 sm:hidden" />
      <div className="container-content relative z-10 w-full pt-[calc(62.5vw+1.5rem)] sm:pt-24 md:pt-32">
        <div className="max-w-3xl reveal">
          <span className="eyebrow mb-4 block text-primary-400">{content.eyebrow}</span>
          <h1 className="mb-6 font-heading text-4xl font-bold leading-[1.1] text-background-50 sm:text-5xl md:text-6xl lg:text-7xl">{content.title}</h1>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-background-200 md:text-lg">{content.description}</p>
          <a href={content.cta_url} className="btn-primary inline-flex items-center gap-2"><i className="ri-layout-grid-line" />{content.cta_label}</a>
        </div>
      </div>
    </section>
  );
}

export default function Membership() {
  const [membershipGrades, setMembershipGrades] = useState<MembershipGrade[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [gradeFinderTrigger, setGradeFinderTrigger] = useState<HTMLButtonElement | null>(null);

  const gradeCards = useMemo(
    () =>
      membershipGrades.map((grade) => ({
        slug: grade.slug,
        title: grade.short_title || grade.title,
        description: grade.description || "",
        image: grade.image_url,
        postNominal: grade.post_nominal,
      })),
    [membershipGrades],
  );

  const pathwaySteps = useMemo(
    () =>
      membershipGrades.map((grade) => ({
        grade: grade.short_title,
        abbreviation: grade.post_nominal,
        title: grade.title,
        description: grade.pathway_description,
        slug: grade.slug,
      })),
    [membershipGrades],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [gradeCards.length]);
  useEffect(() => {
    let cancelled = false;

    async function loadMembershipGrades() {
      try {
        setLoadError("");
        const grades = await apiJson<MembershipGrade[]>(
          "/api/membership-grades",
          undefined,
          { cache: "no-store" },
        );
        if (!cancelled) setMembershipGrades(grades);
      } catch (error) {
        if (!cancelled) {
          setMembershipGrades([]);
          setLoadError(
            error instanceof Error
              ? error.message
              : "Membership grades could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadMembershipGrades();

    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <ManagedContentProvider endpoint="/api/membership/content" slug="membership">
    <div>
      <ManagedPageSeo fallback={{ ...pageSeo.membership, canonical_path: pageSeo.membership.canonicalPath }} />
      <MembershipHero />
      <div hidden aria-hidden="true">
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-background-950 pb-20">
        <div className="absolute inset-0">
          <ResponsiveImage
            src="/images/membership/hero.svg"
            alt="Membership background"
            width={1600}
            height={900}
            sizes="100vw"
            priority
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-950 via-background-950/95 to-background-950/70" />
        <div className="relative z-10 container-content w-full pt-24 md:pt-32">
          <div className="max-w-3xl reveal">
            <span className="eyebrow text-primary-400 mb-4 block">
              Professional Recognition
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-background-50 leading-[1.1] mb-6">
              Membership &amp; Recognition
            </h1>
            <p className="text-base md:text-lg text-background-200 leading-relaxed max-w-xl mb-8">
              Join a professional institute for project controls excellence,
              recognition and career progression. Five progressive grades from
              Affiliate to Fellow — each with detailed benefits, requirements
              and a clear pathway forward.
            </p>
            <a
              href="#grades"
              className="btn-primary inline-flex items-center gap-2"
            >
              <i className="ri-layout-grid-line" />
              Explore Membership Grades
            </a>
          </div>
        </div>
      </section>
      </div>

      {/* ===== GRADE CARDS GRID ===== */}
      <section
        id="grades"
        className="relative overflow-hidden bg-background-50 section-padding scroll-mt-16"
      >
        <ResponsiveImage
          src={membershipGradesBackground}
          alt=""
          width={2048}
          height={1152}
          sizes="100vw"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-background-50/45" aria-hidden="true" />
        <div className="container-content relative z-10">
          <div className="reveal text-center mb-12">
            <span className="eyebrow text-primary-500 mb-3 block">
              Choose Your Grade
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-background-950 mb-4">
              Explore Membership Grades
            </h2>
            <p className="text-foreground-600 max-w-2xl mx-auto">
              Every membership grade has a standard annual price of £100. New
              applicants begin with Affiliate membership and progress through
              the IPC membership pathway.
            </p>
          </div>
          <div className="mx-auto mb-10 flex max-w-4xl flex-col gap-5 border border-primary-300 bg-primary-50/95 p-6 text-left shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-8">
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center bg-primary-500 text-background-950">
                <i className="ri-percent-line text-xl" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-800">Event attendee benefit</p>
                <h3 className="mt-2 font-heading text-xl font-semibold text-background-950">Attend an IPC event and receive 100% off membership</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-700">The standard annual membership price is £100. After confirmed event attendance, your membership fee is reduced to £0.</p>
              </div>
            </div>
            <Link to="/events" className="inline-flex shrink-0 items-center justify-center gap-2 bg-primary-500 px-5 py-3 text-sm font-semibold text-background-950 transition hover:bg-primary-600">
              View events <i className="ri-arrow-right-line" aria-hidden="true" />
            </Link>
          </div>
          {isLoading && (
            <div
              className="flex items-center justify-center gap-3 py-20 text-foreground-600"
              role="status"
            >
              <span
                className="h-6 w-6 animate-spin rounded-full border-2 border-background-300 border-t-primary-600"
                aria-hidden="true"
              />
              Loading membership grades…
            </div>
          )}
          {!isLoading && loadError && (
            <div
              className="border border-red-200 bg-red-50 px-6 py-8 text-center text-red-800"
              role="alert"
            >
              {loadError}
            </div>
          )}
          {!isLoading && !loadError && gradeCards.length === 0 && (
            <div className="border border-background-200 bg-background-100 px-6 py-8 text-center text-foreground-600">
              No active membership grades are currently available.
            </div>
          )}
          <div
            className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:px-20 lg:pb-20 ${
              isLoading || loadError ? "hidden" : ""
            }`}
          >
            {gradeCards.map((grade, index) => (
              <Link
                key={grade.slug}
                to={`/membership/${grade.slug}`}
                className="group reveal flex h-full flex-col overflow-hidden border border-background-200/70 bg-background-100 transition-all duration-300 hover:border-primary-300"
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <div className="relative h-[280px] shrink-0 overflow-hidden md:h-[320px]">
                  <ResponsiveImage
                    src={grade.image}
                    alt={grade.title}
                    width={400}
                    height={400}
                    sizes="(max-width: 640px) 100vw, (max-width: 700px) 50vw, 33vw"
                    className="image-zoom h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5 md:p-6">
                  <h3 className="mb-2 font-heading text-xl font-semibold text-background-950 transition-colors group-hover:text-primary-700">
                    {grade.title}
                  </h3>

                  <p className="mb-4 text-sm leading-relaxed text-foreground-600">
                    {grade.description}
                  </p>

                  <div className="mt-auto">
                    <p className="mb-4 text-sm font-bold text-background-950">
                      £100 <span className="font-normal text-foreground-500">per year</span>
                    </p>

                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors group-hover:text-primary-700">
                      View Details
                      <i className="ri-arrow-right-line" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MembershipComparisonTable />

      <MembershipCompetenceMatrix />

      <MembershipValuePathway />

      <ProfessionalVisibility />

      <ApplicationJourney onOpenGradeFinder={setGradeFinderTrigger} />

      <OrganisationalMembership />

      <ManagedSectionGate name="questions">
        <MembershipQuestions onOpenGradeFinder={setGradeFinderTrigger} />
      </ManagedSectionGate>

      <GradeFinderModal
        isOpen={gradeFinderTrigger !== null}
        onClose={() => setGradeFinderTrigger(null)}
        returnFocusElement={gradeFinderTrigger}
      />

      {/* ===== FINAL CTA ===== */}
      <section className="bg-background-950 py-20 md:py-28">
        <div className="container-content">
          <div className="reveal max-w-2xl mx-auto text-center">
            <h3 className="font-heading text-2xl md:text-3xl font-semibold text-background-50 mb-4">
              Start your membership journey with Affiliate
            </h3>
            <p className="text-background-300 mb-8">
              New applicants join as Affiliate members first. The remaining
              grades form a progressive pathway based on professional evidence,
              competence and contribution.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
              {gradeCards.map((grade) => (
                <Link
                  key={grade.slug}
                  to={`/membership/${grade.slug}`}
                  className="group flex items-center justify-between border border-background-800 bg-background-900 p-4 transition-colors hover:border-primary-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <div>
                    <span className="block text-sm font-semibold text-background-100">
                      {grade.title}
                    </span>
                    <span className="mt-1 block text-xs text-primary-400">
                      {grade.postNominal}
                    </span>
                  </div>
                  <i className="ri-arrow-right-line text-primary-500 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
    </ManagedContentProvider>
  );
}
