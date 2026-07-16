import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import PathwayCard from "@/components/base/PathwayCard";
import ResponsiveImage from "@/components/base/ResponsiveImage";
import { apiJson, type MembershipGrade } from "@/lib/api";
import SEO from "@/components/seo/SEO";
import { pageSeo } from "@/config/pageSeo";

export default function Membership() {
  const [membershipGrades, setMembershipGrades] = useState<MembershipGrade[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const gradeCards = useMemo(
    () =>
      membershipGrades.map((grade) => ({
        slug: grade.slug,
        title: grade.short_title || grade.title,
        description: grade.description || "",
        image: grade.image_url,
        postNominal: grade.short_title,
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
    <div>
      <SEO {...pageSeo.membership} />
      {/* ===== HERO ===== */}
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

      {/* ===== GRADE CARDS GRID ===== */}
      <section
        id="grades"
        className="bg-background-50 section-padding scroll-mt-16"
      >
        <div className="container-content">
          <div className="reveal text-center mb-12">
            <span className="eyebrow text-primary-500 mb-3 block">
              Choose Your Grade
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-background-950 mb-4">
              Explore Membership Grades
            </h2>
            <p className="text-foreground-600 max-w-2xl mx-auto">
              Click any grade to view full details, benefits, pricing and how to
              apply.
            </p>
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
            className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:p-20 ${
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

                  <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors group-hover:text-primary-700">
                    View Details
                    <i className="ri-arrow-right-line" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PATHWAY CARDS ===== */}
      <section className="bg-background-100 section-padding">
        <div className="container-content">
          <div className="reveal text-center mb-12">
            <span className="eyebrow text-primary-500 mb-3 block">
              Progressive Pathway
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-semibold text-background-950 mb-4">
              Your Career Pathway
            </h2>
            <p className="text-foreground-600 max-w-2xl mx-auto">
              From first affiliation to senior Fellowship, each grade builds on
              the last with clear evidence requirements and professional
              development support.
            </p>
          </div>
          <div className="mt-12 md:mt-16">
            <div className="flex gap-5 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide justify-start md:justify-center">
              {pathwaySteps.map((step, index) => (
                <div key={step.abbreviation} className="snap-start">
                  <PathwayCard
                    grade={step.grade}
                    abbreviation={step.abbreviation}
                    title={step.title}
                    description={step.description}
                    step={index + 1}
                    isLast={index === pathwaySteps.length - 1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== STANDARDS-INFORMED ===== */}
      <section className="bg-background-50 section-padding">
        <div className="container-content">
          <div className="reveal">
            <SectionHeader
              eyebrow="Standards-Informed"
              title="A standards-informed basis for recognition"
              subtitle="The IPC framework is built on recognised project controls practice rather than generic membership language. The foundation includes the Project Controls Technician Level 3 standard and the Project Controls Professional Level 6 standard."
              centered
            />
          </div>
          <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="reveal bg-background-100 border border-background-200/70 p-8 text-center hover:border-primary-300 transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-accent-100 flex items-center justify-center mb-5">
                <span className="font-heading text-2xl font-bold text-accent-600">
                  L3
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-background-950 mb-3">
                Foundation
              </h3>
              <p className="text-sm text-foreground-600 leading-relaxed">
                The Level 3 standard describes a technician who controls,
                monitors and analyses progress and performance data on
                engineering, manufacturing, construction and infrastructure
                projects.
              </p>
            </div>
            <div className="reveal bg-background-100 border border-background-200/70 p-8 text-center hover:border-primary-300 transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-primary-100 flex items-center justify-center mb-5">
                <span className="font-heading text-2xl font-bold text-primary-600">
                  L4
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-background-950 mb-3">
                Applied
              </h3>
              <p className="text-sm text-foreground-600 leading-relaxed">
                Applied practitioner recognition for professionals who can apply
                project controls independently on live projects or programmes.
              </p>
            </div>
            <div className="reveal bg-background-100 border border-background-200/70 p-8 text-center hover:border-primary-300 transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-background-800 flex items-center justify-center mb-5">
                <span className="font-heading text-2xl font-bold text-background-50">
                  L6
                </span>
              </div>
              <h3 className="font-heading text-xl font-semibold text-background-950 mb-3">
                Strategic
              </h3>
              <p className="text-sm text-foreground-600 leading-relaxed">
                The Level 6 standard describes a professional who assures
                information, interprets controls reports, develops controls
                frameworks and influences senior decision-making on complex
                projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="bg-background-950 py-20 md:py-28">
        <div className="container-content">
          <div className="reveal max-w-2xl mx-auto text-center">
            <h3 className="font-heading text-2xl md:text-3xl font-semibold text-background-50 mb-4">
              Choose your grade and apply online
            </h3>
            <p className="text-background-300 mb-8">
              Each grade has a dedicated application matched to its evidence and
              competence requirements. Select the grade that best reflects your
              current career stage.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
              {gradeCards.map((grade) => (
                <Link
                  key={grade.slug}
                  to={`/membership/${grade.slug}/apply`}
                  className="group flex items-center justify-between border border-background-800 bg-background-900 p-4 hover:border-primary-500/60"
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
  );
}
