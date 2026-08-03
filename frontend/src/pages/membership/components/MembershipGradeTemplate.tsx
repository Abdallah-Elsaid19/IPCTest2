import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import useScrollReveal from "@/hooks/useScrollReveal";
import type { MembershipGradeData } from "@/mocks/membershipGrades";
import ResponsiveImage from "@/components/base/ResponsiveImage";
import SEO from "@/components/seo/SEO";
import { buildBreadcrumbSchema } from "@/lib/seo/structuredData";
import { useAuth } from "@/features/auth/AuthContext";

interface Step {
  step: number;
  title: string;
  content: string;
  icon: string;
  links?: { label: string; href: string }[];
  ctaText?: string;
  ctaHref?: string;
}

const normaliseIdentifier = (value?: string | null) =>
  value?.replace(/[^a-z0-9]/gi, "").toLowerCase() ?? "";

const isMembershipApplicationCta = (label?: string) =>
  ["join", "joinnow", "apply", "applynow"].includes(normaliseIdentifier(label));

const shouldRenderCta = (
  label: string | undefined,
  currentGrade: string,
  user: ReturnType<typeof useAuth>["user"],
  isAuthLoading: boolean,
) => {
  if (!isMembershipApplicationCta(label)) return true;
  if (isAuthLoading) return false;
  if (!user?.membership_active) return true;
  return normaliseIdentifier(user.membership_grade) !== normaliseIdentifier(currentGrade);
};

function StepLink({ href, children }: { href: string; children: ReactNode }) {
  const isExternal = href.startsWith("mailto:") || href.startsWith("http");
  if (isExternal) {
    return (
      <a href={href} className="underline underline-offset-2 hover:text-primary-600 transition-colors duration-200">
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className="underline underline-offset-2 hover:text-primary-600 transition-colors duration-200">
      {children}
    </Link>
  );
}

function HowToApplyAccordion({ steps, applicationPath, currentGrade }: { steps: Step[]; applicationPath: string; currentGrade: string }) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const { user, isLoading: isAuthLoading } = useAuth();
  const active = steps[activeStep];

  return (
    <div>
      {/* ===== DESKTOP: Tabs left + Content right ===== */}
      <div className="hidden lg:flex gap-8">
        {/* LEFT: Vertical tabs */}
        <div className="w-[280px] xl:w-[320px] flex-shrink-0">
          <div className="bg-background-50 border border-background-200/70 overflow-hidden">
            {steps.map((s, index) => {
              const isActive = activeStep === index;
              return (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(index)}
                  className={`w-full flex items-center gap-4 px-5 py-4 text-left cursor-pointer transition-all duration-300 border-b border-background-200/50 last:border-b-0 group ${
                    isActive
                      ? "bg-primary-50 border-l-4 border-l-primary-500"
                      : "hover:bg-background-100/50 border-l-4 border-l-transparent"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isActive
                        ? "bg-primary-500 text-background-950"
                        : "bg-background-100 text-foreground-400 group-hover:bg-primary-50 group-hover:text-primary-600"
                    }`}
                  >
                    <i className={`${s.icon} text-base`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-400 block">
                      Step {s.step}
                    </span>
                    <span className={`font-heading font-semibold text-sm leading-snug ${isActive ? "text-background-950" : "text-foreground-700"}`}>
                      {s.title}
                    </span>
                  </div>
                  <i className={`ri-arrow-right-s-line text-lg transition-all duration-300 ${isActive ? "text-primary-500" : "text-foreground-300 opacity-0 group-hover:opacity-100"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Content panel */}
        <div className="flex-1">
          <div key={activeStep} className="animate-fadeIn bg-background-50 border border-background-200/70 p-8 xl:p-10">
            <div className="flex items-start gap-5 mb-6">
              <div className="w-14 h-14 bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                <i className={`${active.icon} text-2xl text-primary-600`} />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-600 mb-1 block">
                  Step {active.step}
                </span>
                <h3 className="font-heading text-xl xl:text-2xl font-semibold text-background-950 leading-tight">
                  {active.title}
                </h3>
              </div>
            </div>

            <div className="pl-[76px]">
              <p className="text-sm md:text-base text-foreground-600 leading-relaxed mb-6 max-w-xl">
                {active.links ? (
                  <>
                    {active.content.split(new RegExp(`(${active.links.map((l) => l.label).join("|")})`, "g")).map((part, i) => {
                      const link = active.links?.find((l) => l.label === part);
                      if (link) {
                        return (
                          <StepLink key={i} href={link.href}>
                            {part}
                          </StepLink>
                        );
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </>
                ) : (
                  active.content
                )}
              </p>
              {active.ctaText && active.ctaHref && shouldRenderCta(active.ctaText, currentGrade, user, isAuthLoading) && (
                <StepLink href={applicationPath}>
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-background-950 text-sm font-semibold hover:bg-primary-600 transition-all duration-200 group/btn">
                    {active.ctaText}
                    <i className="ri-arrow-right-line group-hover/btn:translate-x-0.5 transition-transform" />
                  </span>
                </StepLink>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== MOBILE: Accordion ===== */}
      <div className="lg:hidden bg-background-50 border border-background-200/70 overflow-hidden">
        {steps.map((s, index) => {
          const isActive = activeStep === index;
          return (
            <button
              key={s.step}
              onClick={() => setActiveStep(index)}
              className={`w-full text-left cursor-pointer transition-all duration-300 border-b last:border-b-0 border-background-200/50 ${
                isActive ? "bg-primary-50" : "hover:bg-background-100/50"
              }`}
            >
              <div className="flex items-center gap-3 px-5 py-4">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? "bg-primary-500 text-background-950" : "bg-background-100 text-foreground-400"}`}>
                  <i className={`${s.icon} text-base`} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-400 block">Step {s.step}</span>
                  <span className="font-heading font-semibold text-sm">{s.title}</span>
                </div>
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isActive ? "border-primary-500 bg-primary-50" : "border-background-200"}`}>
                  <i className={`ri-${isActive ? "subtract" : "add"}-line text-xs ${isActive ? "text-primary-600" : "text-foreground-500"}`} />
                </div>
              </div>
              <div className={`overflow-hidden transition-all duration-400 ease-out ${isActive ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-5 pb-5 pt-1">
                  <p className="text-sm text-foreground-600 leading-relaxed mb-4">
                    {s.links ? (
                      <>
                        {s.content.split(new RegExp(`(${s.links.map((l) => l.label).join("|")})`, "g")).map((part, i) => {
                          const link = s.links?.find((l) => l.label === part);
                          if (link) {
                            return (<StepLink key={i} href={link.href}>{part}</StepLink>);
                          }
                          return <span key={i}>{part}</span>;
                        })}
                      </>
                    ) : (s.content)}
                  </p>
                  {s.ctaText && s.ctaHref && shouldRenderCta(s.ctaText, currentGrade, user, isAuthLoading) && (
                    <StepLink href={applicationPath}>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                        {s.ctaText}<i className="ri-arrow-right-line" />
                      </span>
                    </StepLink>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface Props {
  data: MembershipGradeData;
}

export default function MembershipGradeTemplate({ data }: Props) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const location = useLocation();
  const { user, isLoading: isAuthLoading } = useAuth();
  const applicationPath = `/membership/${data.slug}/apply`;
  const showApplicationCta = shouldRenderCta(data.howToApply.ctaText, data.abbreviation, user, isAuthLoading);
  const showPricingCta = shouldRenderCta(data.pricingBanner.ctaText, data.abbreviation, user, isAuthLoading);

  useScrollReveal(0.08);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/home" },
    { name: "Membership", path: "/membership" },
    { name: data.title, path: `/membership/${data.slug}` },
  ]);

  return (
    <div className="bg-background-50">
      <SEO
        title={data.title}
        description={data.heroDescription}
        canonicalPath={`/membership/${data.slug}`}
        image={data.heroImage}
        keywords={["project controls membership", data.title.toLowerCase(), data.abbreviation]}
        structuredData={breadcrumbSchema}
      />
      {/* ===== HERO ===== */}
      <section className="relative min-h-[540px] md:min-h-[640px] flex items-end overflow-hidden bg-background-950">
        <div className="absolute inset-0">
          <ResponsiveImage src={data.heroImage} alt="" width={1600} height={900} sizes="100vw" priority className="w-full h-full object-cover opacity-15" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background-950/60 via-background-950/90 to-background-950" />
        <div className="relative z-10 container-content w-full pb-14 md:pb-20 pt-32">
          <div className="flex flex-col lg:flex-row items-end gap-12 lg:gap-20">
            <div className="flex-1 max-w-2xl">
              <nav className="flex items-center gap-2 text-xs mb-8 tracking-wide">
                <Link to="/home" className="text-background-500 hover:text-background-300 transition-colors duration-200">Home</Link>
                <i className="ri-arrow-right-s-line text-background-700 text-[10px]" />
                <Link to="/membership" className="text-background-500 hover:text-background-300 transition-colors duration-200">Membership</Link>
                <i className="ri-arrow-right-s-line text-background-700 text-[10px]" />
                <span className="text-background-300 font-medium">{data.title}</span>
              </nav>
              <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-400 mb-5">{data.heroEyebrow}</span>
              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-background-50 leading-[1.05] mb-6">
                {data.title}
              </h1>
              <p className="text-base md:text-lg text-background-400 leading-relaxed max-w-lg mb-10">
                {data.heroDescription}
              </p>
              {showApplicationCta && (
                <Link to={applicationPath} className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary-500 text-background-950 text-sm font-semibold hover:bg-primary-600 transition-all duration-200 group">
                  {data.howToApply.ctaText}
                  <i className="ri-arrow-right-line group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>
            <div className="hidden lg:block flex-shrink-0 w-[300px] xl:w-[360px]">
              <div className="relative">
                <div className="absolute -top-3 -right-3 w-full h-full bg-primary-500/15" />
                <div className="relative overflow-hidden border border-background-800/50">
                  <ResponsiveImage src={data.heroPersonImage} alt={data.personName || data.title} width={600} height={800} sizes="360px" className="w-full h-[420px] object-cover" />
                  {data.personName && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background-950 via-background-950/80 to-transparent p-6">
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <div className="bg-background-900 border-b border-background-800">
        <div className="container-content reveal">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {data.stats.map((stat, index) => (
              <div
                key={index}
                className={`flex flex-col items-center justify-center py-9 md:py-12 px-4 reveal-delay-${index + 1} ${
                  index < data.stats.length - 1 ? "border-r border-background-800/40" : ""
                } ${index === 0 && index !== data.stats.length - 1 ? "col-span-2 lg:col-span-1 border-r lg:border-r" : ""}`}
              >
                <div className="flex items-baseline gap-0.5 mb-1">
                  {stat.prefix && <span className="text-lg font-semibold text-primary-400">{stat.prefix}</span>}
                  <span className={`font-heading text-4xl md:text-5xl font-bold ${stat.highlight ? "text-primary-500" : "text-background-50"}`}>
                    {stat.value}
                  </span>
                  {stat.suffix && <span className="text-lg font-semibold text-primary-400">{stat.suffix}</span>}
                </div>
                <span className="text-[11px] md:text-xs text-background-500 font-medium uppercase tracking-[0.12em] text-center">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== WHO IS IT FOR + HOW TO APPLY ===== */}
      <section className="py-16 md:py-24">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-20">
            {/* Who is it for */}
            <div className="lg:col-span-7 reveal-left">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600 mb-3 block">Overview</span>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-background-950 mb-6 leading-tight">
                {data.whoIsItFor.title}
              </h2>
              <div className="space-y-4">
                {data.whoIsItFor.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm md:text-base text-foreground-600 leading-[1.7]">{p}</p>
                ))}
              </div>
              {data.whoIsItFor.highlight && (
                <div className="mt-8 p-5 bg-background-100 border-l-4 border-primary-500">
                  <p className="text-sm text-foreground-700 leading-relaxed">
                    <strong className="text-background-950">{data.whoIsItFor.highlight}</strong>
                  </p>
                </div>
              )}
            </div>

            {/* How to apply summary */}
            <div className="lg:col-span-5">
              <div className="bg-background-50 border border-background-200/70 p-6 md:p-8 sticky top-6 reveal-right">
                <h3 className="font-heading text-xl font-semibold text-background-950 mb-4">How to apply</h3>
                <p className="text-sm text-foreground-600 leading-relaxed mb-6">{data.howToApply.intro}</p>
                <div className="mb-6 pb-6 border-b border-background-200/50">
                  <p className="text-sm text-foreground-500 mb-1">{data.howToApply.priceLabel}</p>
                  <p className="text-2xl font-heading font-bold text-background-950">{data.howToApply.priceValue} <span className="text-sm font-normal text-foreground-500">{data.howToApply.pricePeriod}</span></p>
                </div>
                {data.howToApply.employerNote && (
                  <div className="mb-6 p-4 bg-secondary-50 border border-secondary-200/60">
                    <div className="flex items-start gap-3">
                      <i className="ri-building-line text-secondary-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-secondary-900 mb-1">Employer funding available</p>
                        <p className="text-xs text-secondary-700 leading-relaxed">{data.howToApply.employerNote}</p>
                      </div>
                    </div>
                  </div>
                )}
                {showApplicationCta && (
                  <Link to={applicationPath} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-500 text-background-950 text-sm font-semibold hover:bg-primary-600 transition-all duration-200 group">
                    {data.howToApply.ctaText}
                    <i className="ri-arrow-right-line group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* ===== ACCORDION STEPS ===== */}
          <div className="mb-8 reveal">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600 mb-3 block">Process</span>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-background-950 mb-3 leading-tight">
              How to Apply
            </h2>
            <p className="text-sm md:text-base text-foreground-600 max-w-2xl leading-relaxed mb-10">
              {data.howToApply.description}
            </p>
          </div>
          <HowToApplyAccordion steps={data.howToApply.steps} applicationPath={applicationPath} currentGrade={data.abbreviation} />
        </div>
      </section>

      {/* ===== BENEFITS ===== */}
      <section className="bg-background-100 py-16 md:py-24">
        <div className="container-content">
          <div className="max-w-3xl mb-12 reveal">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600 mb-3 block">What you get</span>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-background-950 leading-tight">
              {data.benefits.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {data.benefits.items.map((item, i) => (
              <div key={i} className={`reveal-scale reveal-delay-${Math.min(i + 1, 10)} group bg-background-50 border border-background-200/60 p-5 md:p-6 hover:border-primary-300/50 hover:shadow-sm transition-all duration-300`}>
                <div className="w-9 h-9 bg-primary-500/10 flex items-center justify-center mb-4 group-hover:bg-primary-500/15 transition-colors duration-300">
                  <i className="ri-check-line text-sm text-primary-600" />
                </div>
                <p className="text-sm text-foreground-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          {showApplicationCta && (
            <div className="mt-12 text-center reveal">
              <Link to={applicationPath} className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary-500 text-background-950 text-sm font-semibold hover:bg-primary-600 transition-all duration-200 group">
                {data.howToApply.ctaText}
                <i className="ri-arrow-right-line group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===== WHY [GRADE] ===== */}
      <section className="bg-background-50 py-16 md:py-24">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-7 reveal-left">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600 mb-3 block">Why this grade</span>
              <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-background-950 mb-6 leading-tight">
                {data.whySection.title}
              </h2>
              <div className="space-y-4">
                {data.whySection.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm md:text-base text-foreground-600 leading-[1.7]">{p}</p>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 reveal-right">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -top-3 -right-3 h-20 w-20 bg-[#2563EB] md:h-24 md:w-24" />
                <div className="relative z-10 aspect-[3/4] overflow-hidden bg-background-950">
                  <ResponsiveImage
                    src={data.heroPersonImage}
                    alt={`${data.title} membership`}
                    width={900}
                    height={1200}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRICING BANNER ===== */}
      <section className="relative bg-background-950 py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <ResponsiveImage src={data.heroImage} alt="" width={1600} height={900} sizes="100vw" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-950 via-background-950 to-background-900/80" />
        <div className="relative z-10 container-content">
          <div className="max-w-2xl mx-auto text-center reveal">
            <h2 className="font-heading text-2xl font-semibold text-background-50 md:text-3xl">
              {data.pricingBanner.text}
            </h2>
            <p className="mx-auto mb-8 mt-4 max-w-md text-sm text-background-500">
              Join a growing community of project controls professionals and unlock your career potential.
            </p>
            {showPricingCta && (
              <Link to={applicationPath} className="inline-flex items-center gap-2.5 px-8 py-4 bg-primary-500 text-background-950 text-sm font-semibold hover:bg-primary-600 transition-all duration-200 group">
                {data.pricingBanner.ctaText}
                <i className="ri-arrow-right-line group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ===== EXPLORE OTHER GRADES ===== */}
      <section className="py-16 md:py-24 bg-background-50">
        <div className="container-content">
          <div className="text-center mb-12 reveal">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600 mb-3 block">Pathway</span>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-background-950">
              Explore our other membership grades
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6  md:px-10 lg:px-20">
            {data.otherGrades.map((grade, index) => (
              <Link
                key={grade.slug}
                to={`/membership/${grade.slug}`}
                className={`reveal-scale reveal-delay-${index + 1} group block bg-background-50 overflow-hidden border border-background-200/60 hover:border-primary-300/50 transition-all duration-300 hover:shadow-sm`}
              >
                <div className="h-[400px] md:h-[320px] overflow-hidden">
                  <ResponsiveImage src={grade.image} alt={grade.title} width={400} height={500} sizes="(max-width: 768px) 100vw, 33vw" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="font-heading text-base font-semibold text-background-950 mb-2 group-hover:text-primary-700 transition-colors duration-200">
                    {grade.title}
                  </h3>
                  <p className="text-sm text-foreground-600 leading-relaxed">{grade.description}</p>
                  <span className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-primary-600 group-hover:text-primary-700 transition-colors duration-200">
                    Learn more <i className="ri-arrow-right-line group-hover:translate-x-0.5 transition-transform duration-200" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="bg-background-100 py-16 md:py-24">
        <div className="container-content max-w-3xl">
          <div className="text-center mb-12 reveal">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-600 mb-3 block">Support</span>
            <h2 className="font-heading text-2xl md:text-3xl font-semibold text-background-950 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-foreground-500">
              Common questions about {data.title.toLowerCase()}.
            </p>
          </div>
          <div className="space-y-3 reveal">
            {[
              { q: `What is the difference between ${data.title} and other grades?`, a: `Each grade is designed for a different career stage. ${data.title} is positioned at ${data.subtitle}. You can view other grades above to compare requirements and benefits.` },
              { q: "How long does the application process take?", a: "Applications are typically reviewed within two to four weeks, depending on the completeness of your evidence and the grade being sought." },
              { q: "Can I upgrade my membership grade later?", a: "Yes. All grades are designed as a progressive pathway. Members may progress to higher grades when their experience and evidence meet the requirements." },
              { q: "What counts as acceptable evidence?", a: "Evidence includes your CV, professional statements, CPD records, work portfolios, case studies, training certificates and references. Specific requirements vary by grade." },
              { q: "Is there a fee for membership?", a: `The first year of ${data.title} is complimentary. Renewal details will be confirmed before the end of your first year.` },
              { q: "Do I need to be based in the UK?", a: "No. The Institute of Project Controls is an international body. Membership is open to project controls professionals wherever they are based." },
            ].map((faq, index) => (
              <div key={index} className={`reveal reveal-delay-${index + 1} bg-background-50 border border-background-200/60 overflow-hidden`}>
                <button
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                  className="w-full flex items-start justify-between p-5 md:p-6 text-left cursor-pointer hover:bg-background-100/50 transition-colors duration-200"
                >
                  <span className="font-medium text-background-950 pr-4 text-sm md:text-[15px] leading-snug">{faq.q}</span>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 mt-0.5 ${faqOpen === index ? "bg-primary-500 text-background-950" : "bg-background-200 text-foreground-500"}`}>
                    <i className={`ri-${faqOpen === index ? "subtract" : "add"}-line text-xs`} />
                  </span>
                </button>
                <div className={`overflow-hidden transition-all duration-400 ease-out ${faqOpen === index ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="px-5 md:px-6 pb-5 md:pb-6 pt-0">
                    <p className="text-sm text-foreground-600 leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT CTA ===== */}
      <section className="bg-background-950 py-12 md:py-16 border-t border-background-800 reveal">
        <div className="container-content">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-heading text-xl md:text-2xl font-semibold text-background-50 mb-2">
                {data.contactCta.title}
              </h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 text-sm text-background-500">
                <span className="flex items-center gap-2">
                  <i className="ri-mail-line text-background-600" />
                  {data.contactCta.queries}
                </span>
                <span className="hidden sm:inline text-background-800">|</span>
                <span className="flex items-center gap-2">
                  <i className="ri-global-line text-background-600" />
                  {data.contactCta.queriesIntl}
                </span>
              </div>
            </div>
            {showApplicationCta && (
              <Link to={applicationPath} className="inline-flex max-w-full items-center justify-center gap-2 border border-background-700 px-5 py-3 text-center text-sm font-medium text-background-300 transition-all duration-200 hover:bg-background-800 hover:text-background-100 sm:px-6">
                {data.howToApply.ctaText}
                <i className="ri-arrow-right-line" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
