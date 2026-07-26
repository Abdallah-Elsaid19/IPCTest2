import { useEffect, useState } from "react";
import { Eye, X } from "lucide-react";
import SectionHeader from "@/components/base/SectionHeader";
import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const scholarshipRoutes = [
  {
    id: "access-hardship",
    title: "Access & Hardship Bursary",
    subtitle: "Removing financial and access barriers",
    description:
      "For applicants who cannot reasonably access professional education or development without financial support, including people who are unemployed, underemployed, on a low income, without employer sponsorship or facing significant financial pressure.",
    consideration:
      "Financial circumstances, caring responsibilities, housing pressure, limited employer support, educational barriers, interrupted employment and the likely impact of the award.",
    evidence:
      "A personal statement, employment circumstances, explanation of the barrier, reference from a support organisation or other proportionate evidence of need.",
  },
  {
    id: "character-service",
    title: "Character & Service Scholarship",
    subtitle: "Recognising integrity and service to others",
    description:
      "For people who demonstrate responsibility, reliability, honesty and a sustained willingness to support others. Good character means there is credible evidence of positive conduct, responsibility and intention.",
    consideration:
      "Volunteering, caring, mentoring, community service, helping vulnerable people, ethical leadership, reliability and positive personal change.",
    evidence:
      "A reference from an employer, charity, community leader, colleague, mentor or professional contact who has observed the applicant's contribution.",
  },
  {
    id: "community-impact",
    title: "Community Impact Scholarship",
    subtitle: "Supporting people who improve their communities",
    description:
      "For applicants whose work, volunteering or leadership creates positive local or social impact. Small, consistent and meaningful contribution can be valuable.",
    consideration:
      "Youth mentoring, support for disadvantaged families, refugee support, community education, local campaigns, food support, neighbourhood initiatives, disability inclusion and public benefit.",
    evidence:
      "A short impact summary, public information where appropriate, a reference from a community organisation, volunteer record or explanation of beneficiaries supported.",
  },
  {
    id: "social-media-good",
    title: "Social Media for Good Scholarship",
    subtitle: "Positive influence for a public-benefit cause",
    description:
      "For creators and public communicators who use social media to support education, charity, community support, social mobility, professional development, entrepreneurship or public benefit.",
    consideration:
      "Authentic audience, quality of content, public benefit, responsible communication, positive engagement and willingness to promote project controls careers ethically.",
    evidence:
      "Relevant public profiles and examples of responsible, positive communication. Follower numbers alone do not create merit.",
  },
  {
    id: "charity-ngo",
    title: "Charity & NGO Leadership Scholarship",
    subtitle: "Better project delivery for public benefit",
    description:
      "For employees, trustees, volunteers and leaders working in charities, NGOs, community groups and social organisations.",
    consideration:
      "Responsibility for programmes, fundraising, operations, volunteers, community delivery, governance, budgets, public benefit or organisational improvement.",
    evidence:
      "A role profile, trustee or leadership confirmation, project summary, reference from the organisation or explanation of how the learning would improve charitable delivery.",
  },
  {
    id: "public-service",
    title: "Armed Forces, Veterans & Public Service Transition",
    subtitle: "Translating service experience into civilian careers",
    description:
      "For armed forces leavers, veterans, reservists, emergency service personnel and public-service professionals moving into civilian project controls, infrastructure, construction, consultancy, logistics, risk or programme delivery careers.",
    consideration:
      "Leadership, planning, logistics, risk awareness, discipline, responsibility, operational coordination, transition need and transferable service experience.",
    evidence:
      "Service background, transition plan, CV, resettlement evidence, reference, career goals and an explanation of how project controls learning supports civilian employment.",
  },
  {
    id: "second-chance",
    title: "Second Chance Career Repositioning Scholarship",
    subtitle: "Supporting positive reintegration and rebuilding",
    description:
      "For people rebuilding their professional lives after custody, conviction, homelessness, addiction recovery, long-term unemployment or another significant disruption. Applications should be handled sensitively and fairly.",
    consideration:
      "Evidence of positive change, rehabilitation, commitment, reliability, support from a recognised organisation, career plan, safeguarding considerations and readiness to participate.",
    evidence:
      "A past difficulty should not automatically define a person's future. Suitability, risk and safeguarding may still be considered where relevant.",
  },
  {
    id: "independent",
    title: "Self-Employed Professionals & Consultants Bursary",
    subtitle: "Professional development without employer sponsorship",
    description:
      "For freelancers, sole traders, independent consultants and small consultancy owners who need professional development but do not have access to a large employer training budget.",
    consideration:
      "Business need, professional development plan, client benefit, income barrier, potential to create work, support other organisations or build an ethical specialist consultancy.",
    evidence:
      "Applicants may include independent planners, cost consultants, project managers, quantity surveyors, claims consultants, advisers, trainers and technical professionals.",
  },
  {
    id: "career-returner",
    title: "Career Returner & Repositioning Bursary",
    subtitle: "Returning after interruption or changing direction",
    description:
      "For people returning to work after childcare, caring responsibilities, illness, bereavement, redundancy, relocation or another significant career break, and professionals changing sector or moving into project controls.",
    consideration:
      "Length and reason for the career break, transferable experience, confidence barriers, re-entry plan, skills refresh need and the value of structured support.",
    evidence:
      "Potential transitions may come from operations, administration, engineering, finance, construction, logistics, procurement, commercial management, data, PMO and project coordination.",
  },
  {
    id: "emerging-talent",
    title: "Emerging Talent Scholarship",
    subtitle: "Supporting potential at the start of a career",
    description:
      "For school leavers, college leavers, graduates, apprentices, junior employees and early-career professionals who show promise but have limited access to professional networks, training or employer support.",
    consideration:
      "Motivation, learning attitude, responsibility, problem-solving, communication, service, academic or workplace potential and commitment to building a project controls career.",
    evidence:
      "Applicants are not expected to have advanced project controls knowledge. The scholarship exists to help strong potential become professional capability.",
  },
];

export default function ScholarshipAudienceGrid() {
  const intro = useManagedSection("audiences_intro", {
    eyebrow: "Scholarship and Bursary Categories",
    title: "Inclusive routes for different circumstances, contributions and career journeys.",
    description:
      "Applicants should select the route that best explains why support would make a difference. More than one category may apply, and the categories are intended to widen access rather than place people into narrow labels.",
    open_title: "Do not exclude yourself because no category feels exact.",
    open_description:
      "Applicants whose circumstances do not fit neatly into one category may still apply. Explain the barrier, the opportunity, the personal context and the difference support would make.",
    open_cta_label: "Enquire About Scholarships",
    open_cta_url: "/information-session",
  });
  const routes = useManagedSection("audiences", scholarshipRoutes).filter(
    isManagedItemActive,
  );
  const [selectedRoute, setSelectedRoute] = useState<(typeof scholarshipRoutes)[number] | null>(null);

  useEffect(() => {
    if (!selectedRoute) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedRoute(null);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedRoute]);

  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal">
          <SectionHeader
            eyebrow={intro.eyebrow}
            title={intro.title}
            subtitle={intro.description}
            centered
          />
        </div>
        <div className="mt-12 grid gap-5 md:mt-16 md:gap-6 lg:grid-cols-2">
          {routes.map((route, index) => (
            <article
              key={route.id}
              className="group relative flex min-h-64 h-full flex-col border border-background-300 bg-background-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/60 hover:bg-background-100 md:p-8"
            >
              <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-8 font-heading text-xl font-semibold leading-tight text-background-950 md:text-2xl">
                {route.title}
              </h3>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-primary-800">
                {route.subtitle}
              </p>
              <button
                type="button"
                onClick={() => setSelectedRoute(route)}
                className="mt-auto inline-flex min-h-11 w-fit items-center gap-2 border border-background-300 px-4 py-2 text-sm font-semibold text-background-950 transition-colors hover:border-primary-500 hover:bg-primary-500 hover:text-background-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                aria-label={`View details for ${route.title}`}
              >
                <Eye size={17} aria-hidden="true" />
                View details
              </button>
              <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary-500 transition-transform group-hover:scale-x-100" aria-hidden="true" />
            </article>
          ))}
        </div>

        <div className="reveal mt-8 border-l-2 border-primary-500 bg-background-50 p-6 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
          <div>
            <h3 className="font-heading text-xl font-semibold text-background-950">
              {intro.open_title}
            </h3>
            <p className="mt-3 max-w-4xl text-sm leading-[1.75] text-foreground-600">
              {intro.open_description}
            </p>
          </div>
          <a href={intro.open_cta_url} className="btn-primary mt-6 shrink-0 md:mt-0">
            {intro.open_cta_label}
          </a>
        </div>
      </div>

      {selectedRoute && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background-950/75 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedRoute(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="scholarship-route-dialog-title"
            className="relative max-h-[88vh] w-full max-w-3xl overflow-y-auto border border-background-300 bg-background-50 p-6 shadow-2xl md:p-10"
          >
            <button
              type="button"
              onClick={() => setSelectedRoute(null)}
              className="absolute right-4 top-4 grid h-11 w-11 place-items-center border border-background-300 text-background-950 transition-colors hover:border-primary-500 hover:bg-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 md:right-6 md:top-6"
              aria-label="Close scholarship details"
              autoFocus
            >
              <X size={20} aria-hidden="true" />
            </button>

            <div className="pr-14">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-primary-700">
                Scholarship or bursary route
              </span>
              <h2
                id="scholarship-route-dialog-title"
                className="mt-5 font-heading text-2xl font-semibold leading-tight text-background-950 md:text-4xl"
              >
                {selectedRoute.title}
              </h2>
              <p className="mt-3 font-semibold text-primary-800">
                {selectedRoute.subtitle}
              </p>
            </div>

            <div className="mt-8 border-t border-background-300 pt-7">
              <p className="text-sm leading-[1.8] text-foreground-600 md:text-base">
                {selectedRoute.description}
              </p>
            </div>

            <dl className="mt-8 divide-y divide-background-300 border-y border-background-300">
              <div className="py-7">
                <dt className="text-xs font-bold uppercase tracking-wider text-background-950">
                  What the Institute may consider
                </dt>
                <dd className="mt-3 text-sm leading-[1.8] text-foreground-600">
                  {selectedRoute.consideration}
                </dd>
              </div>
              <div className="py-7">
                <dt className="text-xs font-bold uppercase tracking-wider text-background-950">
                  Useful context or evidence
                </dt>
                <dd className="mt-3 text-sm leading-[1.8] text-foreground-600">
                  {selectedRoute.evidence}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </section>
  );
}
