import type { SEOProps } from "@/components/seo/SEO";

type StaticPageSeo = Required<Pick<SEOProps, "title" | "description" | "canonicalPath">> &
  Pick<SEOProps, "image" | "keywords" | "noIndex" | "type">;

/**
 * Static, route-level SEO metadata for every public and utility page.
 * Dynamic pages (membership grades, event details) build their own SEO
 * props from loaded data instead of living here — see their page components.
 */
export const pageSeo = {
  landing: {
    title: "Institute of Project Controls | A Professional Home for Project Controls",
    description:
      "A professional home for project controls. Recognition, competence, community and career progression for project controls professionals worldwide.",
    canonicalPath: "/",
    keywords: [
      "project controls",
      "professional membership",
      "IPC",
      "project management",
      "cost engineering",
      "planning",
      "risk management",
    ],
  },
  home: {
    title: "Explore the Institution",
    description:
      "Discover how the Institute of Project Controls builds recognition, community and career pathways for planners, cost engineers and risk professionals worldwide.",
    canonicalPath: "/home",
    keywords: ["project controls institution", "professional recognition", "project controls community"],
  },
  membership: {
    title: "Membership & Professional Recognition",
    description:
      "Explore five progressive project controls membership grades from Affiliate to Fellow, each with clear benefits, requirements and a defined career pathway.",
    canonicalPath: "/membership",
    keywords: ["project controls membership", "professional recognition", "AffIPC", "MIPC", "AFIPC", "FIPC"],
  },
  scholarships: {
    title: "Scholarships",
    description:
      "Scholarships and bursaries from the Institute of Project Controls open access to project controls education for students, career changers and new entrants.",
    canonicalPath: "/scholarships",
    keywords: ["project controls scholarships", "bursaries", "career change", "student membership"],
  },
  sponsorship: {
    title: "Sponsorship",
    description:
      "Partner with the Institute of Project Controls to sponsor learners, events, awards, clubs and publications, creating ethical visibility and social impact.",
    canonicalPath: "/sponsorship",
    keywords: ["project controls sponsorship", "corporate partnership", "event sponsorship"],
  },
  awards: {
    title: "Awards & Prizes",
    description:
      "Celebrate excellence in project controls. Explore IPC's academic, commercial and professional awards, nomination timeline and independent judging process.",
    canonicalPath: "/awards",
    keywords: ["project controls awards", "professional recognition prizes", "IPC awards"],
  },
  events: {
    title: "Events",
    description:
      "Join IPC master classes, technical sessions, roundtables and mentoring circles across London, Nottingham, Manchester and Kent for project controls professionals.",
    canonicalPath: "/events",
    keywords: ["project controls events", "master classes", "networking", "professional development"],
  },
  clubs: {
    title: "Regional Clubs",
    description:
      "Discover IPC's regional professional clubs in London, Nottingham, Manchester and Kent, offering talks, networking, mentoring and site visits.",
    canonicalPath: "/clubs",
    keywords: ["project controls clubs", "regional networking", "professional community"],
  },
  about: {
    title: "About the Institute",
    description:
      "Learn about the Institute of Project Controls: our founding, vision, mission and the core values that guide professional recognition worldwide.",
    canonicalPath: "/about",
    keywords: ["about IPC", "institute history", "project controls profession"],
  },
  contact: {
    title: "Contact",
    description:
      "Get in touch with the Institute of Project Controls for membership, recognition, events, awards or sponsorship enquiries.",
    canonicalPath: "/contact",
    keywords: ["contact IPC", "project controls enquiries"],
  },
  privacy: {
    title: "Privacy & Policies",
    description:
      "Read the Institute of Project Controls' privacy policy and related policies governing how member and visitor data is handled.",
    canonicalPath: "/privacy",
    keywords: ["IPC privacy policy", "data protection"],
  },
  login: {
    title: "Sign In",
    description:
      "Sign in to your Institute of Project Controls member portal to access your profile, applications and professional records.",
    canonicalPath: "/login",
    noIndex: true,
  },
  resetPassword: {
    title: "Reset Your Password",
    description: "Set a new password for your Institute of Project Controls member account.",
    canonicalPath: "/reset-password",
    noIndex: true,
  },
  forgotPassword: {
    title: "Forgot Password",
    description: "Request a secure password-reset link for your IPC member account.",
    canonicalPath: "/forgot-password",
    noIndex: true,
  },
  profile: {
    title: "Member Profile",
    description: "View your Institute of Project Controls member account details.",
    canonicalPath: "/profile",
    noIndex: true,
  },
  booking: {
    title: "Discuss Sponsorship — Book a Meeting",
    description:
      "Book a meeting with the IPC team to discuss sponsorship opportunities, partnership options and the most suitable package for your organisation.",
    canonicalPath: "/booking",
    noIndex: true,
  },
  notFound: {
    title: "Page Not Found",
    description: "The page you are looking for could not be found.",
    canonicalPath: "/404",
    noIndex: true,
  },
} satisfies Record<string, StaticPageSeo>;
