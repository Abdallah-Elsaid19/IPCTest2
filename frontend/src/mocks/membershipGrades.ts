export interface MembershipGradeData {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  abbreviation: string;
  heroEyebrow: string;
  heroDescription: string;
  heroImage: string;
  heroPersonImage: string;
  personName?: string;
  personTitle?: string;
  whoIsItFor: {
    title: string;
    paragraphs: string[];
    highlight?: string;
  };
  howToApply: {
    intro: string;
    description: string;
    steps: {
      step: number;
      title: string;
      content: string;
      icon: string;
      links?: { label: string; href: string }[];
      ctaText?: string;
      ctaHref?: string;
    }[];
    priceLabel: string;
    priceValue: string;
    pricePeriod: string;
    ctaText: string;
    ctaHref: string;
    employerNote?: string;
  };
  benefits: {
    eyebrow: string;
    title: string;
    items: string[];
  };
  whySection: {
    title: string;
    paragraphs: string[];
    testimonial?: {
      quote: string;
      author: string;
      role: string;
      videoUrl?: string;
      thumbnailUrl?: string;
    };
    videoNote?: string;
  };
  pricingBanner: {
    text: string;
    ctaText: string;
    ctaHref: string;
  };
  otherGrades: {
    slug: string;
    title: string;
    description: string;
    image: string;
  }[];
  contactCta: {
    title: string;
    queries: string;
    queriesIntl: string;
  };
  stats: {
    value: string;
    label: string;
    prefix?: string;
    suffix?: string;
    highlight?: boolean;
  }[];
  theme: "light" | "warm" | "dark";
}

const membershipOverviewImages = {
  affiliate:
    "/images/membership/AFFIPC.png",
  professional:
    "/images/membership/Professional membership.png",
  associateFellowL3:
    "/images/membership/Associate Fellow Level 3.png",
  associateFellowL4:
    "/images/membership/Associate Fellow Level 4.png",
  fellow:
    "/images/membership/Fellow.png",
};
export const membershipGrades: Record<string, MembershipGradeData> = {
  affiliate: {
    id: "affiliate",
    slug: "affiliate",
    title: "Affiliate membership",
    subtitle: "Your first step into the professional community",
    abbreviation: "AffIPC",
    heroEyebrow: "Entry Level",
    heroDescription:
      "Join the Institute community as an Affiliate member. The first visible professional affiliation for learners, new entrants and career changers exploring project controls.",
    heroImage:
      "/images/membership/AFFIPC.png",
    heroPersonImage:
      "/images/membership/AFFIPC.png",
    personName: "Samira Okonkwo",
    personTitle: "Affiliate Member",
    whoIsItFor: {
      title: "Who is it for?",
      paragraphs: [
        "Affiliate Membership is designed for students, graduates, apprentices, career changers and early-career professionals who want to explore project controls and begin building a credible professional pathway.",
        "It is also suitable for people already working in projects, engineering, construction, infrastructure, energy or business who want to understand how planning, cost, risk, change and performance control work together.",
        "No advanced project controls experience is required. What matters is your interest in the discipline, your commitment to professional development and your willingness to learn, connect and grow within the Institute’s community.",
      ],
      highlight:
        "Build your foundation through expert-led learning, practical guides, tools and templates, professional events, and a supportive project controls network.",
    },
    howToApply: {
      intro: "Enter your details to begin your membership subscription.",
      description: "Learn more about each step in the application and onboarding process to become an IPC Affiliate member.",
      steps: [
        {
          step: 1,
          title: "Submit your application",
          content: "Complete the online membership application form with your details.",
          icon: "ri-file-edit-line",
          ctaText: "Apply Now",
          ctaHref: "mailto:office@instituteofprojectcontrols.org",
        },
        {
          step: 2,
          title: "Application review",
          icon: "ri-search-line",
          content: "Our membership team reviews your application details and confirms eligibility for Affiliate membership.",
        },
        {
          step: 3,
          title: "Get approved",
          icon: "ri-shield-check-line",
          content: "Receive approval confirmation via email with your unique Affiliate member number and digital badge.",
        },
        {
          step: 4,
          title: "Access your benefits",
          icon: "ri-key-2-line",
          content: "Log in to the IPC portal, activate your digital badge, and start exploring your exclusive member resources.",
        },
        {
          step: 5,
          icon: "ri-line-chart-line",
          title: "Ongoing development",
          content: "Plan and track your CPD hours, renew your membership annually, and progress to the next grade when ready.",
          links: [
            { label: "CPD guidance", href: "/membership" },
            { label: "grade progression", href: "/membership" },
          ],
        },
      ],
      priceLabel: "Annual subscription:",
      priceValue: "£100",
      pricePeriod: "per year",
      ctaText: "Join now",
      ctaHref: "mailto:office@instituteofprojectcontrols.org",
      employerNote:
        "Ask your employer to fund your IPC membership. Our downloadable resources can help you make the business case.",
    },
    benefits: {
      eyebrow: "Benefits",
      title: "Benefits of Affiliate membership",
      items: [
        "Access to IPC Community, our exclusive members-only online forum",
        "Find a mentor on the IPC Mentoring Programme",
        "Access to IPC Learning, our online development platform",
        "IPC Project Journal subscription",
        "Preferential rates on IPC qualifications and publications",
        "A digital badge to demonstrate alignment to IPC",
        "Free or discounted rates for IPC events and conferences",
        "Access to digital knowledge resources and templates",
        "Plan, track and log CPD hours on My CPD",
        "Access to the IPC Competence Framework tool",
      ],
    },
    whySection: {
      title: "Why Affiliate Membership?",
      paragraphs: [
        "Affiliate Membership provides a credible starting point for students, graduates, career changers and emerging professionals who want to begin their journey in project controls.",
        "It helps you understand the discipline, access learning and professional events, connect with the Institute community and build confidence in your future career direction.",
        "As an Affiliate Member, you can demonstrate your commitment to learning, ethical conduct and professional development while preparing for higher membership and recognition grades.",
      ],
      testimonial: {
        quote:
          "Hear from Affiliate member, Samira, about how her membership has opened doors and built a strong foundation for her career in project controls.",
        author: "Samira Okonkwo",
        role: "Affiliate Member",
        videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://readdy.ai/api/search-image?query=Young%20diverse%20female%20professional%20sitting%20at%20modern%20desk%20in%20bright%20office%20with%20warm%20natural%20lighting%2C%20speaking%20confidently%20to%20camera%2C%20video%20interview%20framing%20with%20shallow%20depth%20of%20field%2C%20professional%20business%20casual%20attire%20in%20neutral%20warm%20tones%2C%20clean%20minimal%20background%20with%20subtle%20office%20interior%2C%20cinematic%20video%20still%20quality%2C%20genuine%20friendly%20expression%2C%20editorial%20documentary%20style&width=800&height=450&seq=video-thumb-affiliate&orientation=landscape",
      },
    },
    pricingBanner: {
      text: "Affiliate membership costs £100 per year",
      ctaText: "Join now",
      ctaHref: "mailto:office@instituteofprojectcontrols.org",
    },
    otherGrades: [
      {
        slug: "professional",
        title: "Professional Member",
        description:
          "Professional membership for practitioners active in project controls or project delivery.",
        image:
          "/images/membership/Professional membership.png",
      },
      {
        slug: "associate-fellow-l3",
        title: "Associate Fellow L3",
        description:
          "Foundation practitioner recognition based on technician-level competence and evidence.",
        image:
          "/images/membership/Associate Fellow Level 3.png",
      },
      {
        slug: "fellow",
        title: "Fellow",
        description:
          "Senior professional recognition for strategic project controls leadership and contribution.",
        image:
          "/images/membership/Fellow.png",
      },
    ],
    contactCta: {
      title: "Need to speak to a customer service advisor?",
      queries: "Membership queries: office@instituteofprojectcontrols.org",
      queriesIntl: "International queries: office@instituteofprojectcontrols.org",
    },
    stats: [
      { value: "100", label: "Annual membership", prefix: "£", suffix: "", highlight: true },
      { value: "5,000+", label: "Global community members", suffix: "" },
      { value: "10+", label: "Exclusive member resources", suffix: "" },
      { value: "24/7", label: "Online learning access", suffix: "" },
    ],
    theme: "light",
  },

  professional: {
    id: "professional",
    slug: "professional",
    title: "Professional membership",
    subtitle: "Visible membership for active practitioners",
    abbreviation: "MIPC",
    heroEyebrow: "Professional Membership",
    heroDescription:
      "Professional Member recognises active membership and involvement in project controls. Suitable for practitioners already working in project delivery.",
    heroImage:
      "/images/membership/Professional membership.png",
    heroPersonImage:
      "/images/membership/Professional membership.png",
    personName: "James Morrison",
    personTitle: "Professional Member",
    whoIsItFor: {
      title: "Who is it for?",
      paragraphs: [
        "Professional Membership is for practitioners already working in project delivery, project controls or related disciplines who want stronger professional recognition.",
        "It is suitable for planners, schedulers, PMO analysts, cost controllers, project coordinators, engineers, consultants and commercial professionals.",
        "Through MIPC, members gain a visible professional identity, structured CPD and a clear pathway to Associate Fellowship and Fellowship.",
      ],
      highlight:
        "Strengthen your professional credibility through recognised membership, CPD and career progression.",
    },
    howToApply: {
      intro: "Enter your details to begin your membership subscription.",
      description: "Learn more about each step in the application and onboarding process to become an IPC Professional Member.",
      steps: [
        {
          step: 1,
          title: "Submit your application",
          content: "Complete the online membership application form with your professional details and payment information.",
          icon: "ri-file-list-3-line",
          ctaText: "Apply Now",
          ctaHref: "mailto:office@instituteofprojectcontrols.org",
        },
        {
          step: 2,
          title: "Application review",
          icon: "ri-search-line",
          content: "Our team reviews your application to confirm you are an active practitioner in project controls or project delivery.",
        },
        {
          step: 3,
          title: "Get approved",
          icon: "ri-shield-check-line",
          content: "Receive approval confirmation with your Professional Member number, digital badge and CPD portal access.",
        },
        {
          step: 4,
          title: "Access your benefits",
          icon: "ri-key-2-line",
          content: "Log in to your member portal, track your CPD hours, join the IPC Community and access exclusive resources.",
        },
        {
          step: 5,
          icon: "ri-line-chart-line",
          title: "Ongoing development",
          content: "Maintain your CPD record, renew your membership annually, and progress to Associate Fellowship when ready.",
          links: [
            { label: "CPD guidance", href: "/membership" },
            { label: "progression route", href: "/membership" },
          ],
        },
      ],
      priceLabel: "Annual subscription:",
      priceValue: "£100",
      pricePeriod: "per year",
      ctaText: "Join now",
      ctaHref: "mailto:office@instituteofprojectcontrols.org",
      employerNote:
        "Ask your employer to fund your IPC membership. Our downloadable resources can help you make the business case.",
    },
    benefits: {
      eyebrow: "Benefits",
      title: "Benefits of Professional membership",
      items: [
        "All Affiliate benefits included",
        "Visible MIPC membership and professional identity",
        "Structured CPD and development framework",
        "Awards and recognition pathway eligibility",
        "Publication and thought leadership opportunities",
        "Career credibility with employers and clients",
        "Regional and specialist community access",
        "Preferential event and conference rates",
        "Mentoring programme access as mentor or mentee",
        "Progression to Associate Fellowship and Fellowship",
      ],
    },
    whySection: {
      title: "Why Professional Membership?",
      paragraphs: [
        "Professional Membership recognises practitioners who are already contributing to project delivery, project controls or related professional roles.",
        "It provides a visible professional identity for members who understand project structures, reliable reporting, baseline information, progress tracking, risk and change, and stakeholder communication.",
        "Through MIPC, members can strengthen their professional credibility, structure their CPD and build evidence towards Associate Fellowship and higher recognition.",
      ],
      testimonial: {
        quote:
          "Hear from Professional member, James, about how his membership has delivered opportunities that have successfully developed his career.",
        author: "James Morrison",
        role: "Professional Member",
        videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://readdy.ai/api/search-image?query=Mid-career%20professional%20woman%20in%20tailored%20navy%20blazer%20speaking%20directly%20to%20camera%20in%20modern%20office%20setting%2C%20warm%20studio%20lighting%20with%20soft%20golden%20highlights%2C%20video%20interview%20cinematic%20framing%2C%20confident%20engaging%20professional%20expression%2C%20clean%20blurred%20corporate%20background%20with%20subtle%20warm%20tones%2C%20shallow%20depth%20of%20field%2C%20editorial%20documentary%20video%20still%20quality&width=800&height=450&seq=video-thumb-professional&orientation=landscape",
      },
    },
    pricingBanner: {
      text: "Professional membership costs £100 per year",
      ctaText: "Join now",
      ctaHref: "mailto:office@instituteofprojectcontrols.org",
    },
    otherGrades: [
      {
        slug: "affiliate",
        title: "Affiliate",
        description:
          "Entry to the professional community for learners, new entrants and career changers.",
        image:
          membershipOverviewImages.affiliate,
      },
      {
        slug: "associate-fellow-l4",
        title: "Associate Fellow L4",
        description:
          "Applied practitioner recognition for independent work on live projects and programmes.",
        image:
          membershipOverviewImages.associateFellowL4,
      },
      {
        slug: "fellow",
        title: "Fellow",
        description:
          "Senior professional recognition for strategic project controls leadership and contribution.",
        image:
          membershipOverviewImages.fellow,
      },
    ],
    contactCta: {
      title: "Need to speak to a customer service advisor?",
      queries: "Membership queries: office@instituteofprojectcontrols.org",
      queriesIntl: "International queries: office@instituteofprojectcontrols.org",
    },
    stats: [
      { value: "100", label: "Annual membership", prefix: "£", suffix: "", highlight: true },
      { value: "15+", label: "CPD hours per year", suffix: "" },
      { value: "50+", label: "Events & conferences annually", suffix: "" },
      { value: "40%", label: "Faster career progression", suffix: "" },
    ],
    theme: "warm",
  },

  "associate-fellow-l3": {
    id: "associate-fellow-l3",
    slug: "associate-fellow-l3",
    title: "Associate Fellow Level 3",
    subtitle: "Foundation practitioner recognition",
    abbreviation: "AFIPC L3",
    heroEyebrow: "Foundation Recognition",
    heroDescription:
      "Associate Fellow Level 3 is the first competence-based recognition grade. Foundation practitioner recognition based on technician-level competence and evidence.",
    heroImage:
      "/images/membership/Associate Fellow Level 3.png",
    heroPersonImage:
      "/images/membership/Associate Fellow Level 3.png",
    personName: "Priya Sharma",
    personTitle: "Associate Fellow L3",
    whoIsItFor: {
      title: "Who is it for?",
      paragraphs: [
        "Associate Fellow Level 3 is for early-career professionals, apprentices, graduates and junior practitioners who want formal recognition of their foundation project controls capability.",
        "It is suitable for assistant planners, junior schedulers, project control technicians, PMO assistants and early-career cost professionals.",
        "Through AFIPC L3, members gain technician-level recognition and a clear pathway to AFIPC Level 4.",
      ],
      highlight:
        "Demonstrate foundation project controls competence and progress towards higher professional recognition.",
    },
    howToApply: {
      intro: "Prepare your evidence and begin your recognition application.",
      description: "Learn more about each step in the recognition application process for Associate Fellow Level 3.",
      steps: [
        {
          step: 1,
          title: "Submit your evidence",
          content: "Prepare and submit your evidence portfolio demonstrating foundation competence. Review our evidence checklist and guidelines to ensure completeness.",
          icon: "ri-file-edit-line",
          links: [
            { label: "evidence checklist", href: "mailto:office@instituteofprojectcontrols.org" },
            { label: "guidelines", href: "mailto:office@instituteofprojectcontrols.org" },
          ],
          ctaText: "Apply Now",
          ctaHref: "mailto:office@instituteofprojectcontrols.org",
        },
        {
          step: 2,
          title: "Panel assessment",
          icon: "ri-search-line",
          content: "Your evidence is assessed by a qualified IPC assessment panel against the L3 competence criteria.",
        },
        {
          step: 3,
          title: "Outcome notification",
          icon: "ri-shield-check-line",
          content: "Receive your assessment outcome with detailed feedback. Successful candidates receive AFIPC L3 status.",
        },
        {
          step: 4,
          title: "Activate membership",
          icon: "ri-key-2-line",
          content: "Activate your post-nominal AFIPC L3, update your profile, and join the recognised practitioner community.",
        },
        {
          step: 5,
          icon: "ri-line-chart-line",
          title: "Ongoing development",
          content: "Maintain your CPD record, renew your recognition annually, and progress to AFIPC L4 and beyond.",
          links: [
            { label: "CPD guidance", href: "/membership" },
            { label: "progression route", href: "/membership" },
          ],
        },
      ],
      priceLabel: "Annual subscription:",
      priceValue: "£100",
      pricePeriod: "per year",
      ctaText: "Apply now",
      ctaHref: "mailto:office@instituteofprojectcontrols.org",
      employerNote:
        "Ask your employer to fund your IPC recognition. Our downloadable resources can help you make the business case.",
    },
    benefits: {
      eyebrow: "Benefits",
      title: "Benefits of Associate Fellowship L3",
      items: [
        "All Affiliate and Professional benefits included",
        "Post-nominal AFIPC L3 visibility on LinkedIn and CV",
        "Foundation practitioner recognition",
        "Regional community and specialist network",
        "Structured professional development route",
        "Career confidence and credibility",
        "Events and CPD programme access",
        "Awards and prizes eligibility",
        "Mentoring programme as mentee",
        "Clear pathway to AFIPC L4 and FIPC",
      ],
    },
    whySection: {
      title: "Why Associate Fellow Level 3?",
      paragraphs: [
        "Associate Fellow Level 3 recognises early-career professionals who have developed a reliable foundation in project controls and are ready to make their capability visible.",
        "Through AFIPC L3, members demonstrate understanding of planning, cost, progress reporting, baseline control, risk, change and professional conduct.",
        "The grade strengthens professional credibility, supports structured development and provides a clear pathway towards AFIPC Level 4.",
      ],
      testimonial: {
        quote:
          "Hear from Associate Fellow L3, Priya, about how foundation recognition gave her the confidence to grow in her project controls career.",
        author: "Priya Sharma",
        role: "Associate Fellow L3",
        videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://readdy.ai/api/search-image?query=Young%20female%20project%20controls%20technician%20in%20smart%20workwear%20speaking%20to%20camera%20in%20industrial%20office%20environment%2C%20warm%20natural%20daylight%20from%20large%20windows%2C%20video%20interview%20framing%20with%20cinematic%20depth%20of%20field%2C%20determined%20enthusiastic%20professional%20expression%2C%20clean%20modern%20technical%20workspace%20background%20with%20subtle%20warm%20earth%20tones%2C%20editorial%20documentary%20style%20video%20still&width=800&height=450&seq=video-thumb-af3&orientation=landscape",
      },
    },
    pricingBanner: {
      text: "Associate Fellowship L3 costs £100 per year",
      ctaText: "Apply now",
      ctaHref: "mailto:office@instituteofprojectcontrols.org",
    },
    otherGrades: [
      {
        slug: "affiliate",
        title: "Affiliate",
        description:
          "Entry to the professional community for learners, new entrants and career changers.",
        image:
          membershipOverviewImages.affiliate,
      },
      {
        slug: "professional",
        title: "Professional",
        description:
          "Professional membership for practitioners active in project controls or project delivery.",
        image:
          membershipOverviewImages.professional,
      },
      {
        slug: "associate-fellow-l4",
        title: "Associate Fellow L4",
        description:
          "Applied practitioner recognition for independent work on live projects and programmes.",
        image:
          membershipOverviewImages.associateFellowL4,
      },
    ],
    contactCta: {
      title: "Need to speak to a customer service advisor?",
      queries: "Membership queries: office@instituteofprojectcontrols.org",
      queriesIntl: "International queries: office@instituteofprojectcontrols.org",
    },
    stats: [
      { value: "100", label: "Annual membership", prefix: "£", suffix: "", highlight: true },
      { value: "92%", label: "Assessment success rate", suffix: "" },
      { value: "3,200+", label: "Recognised practitioners", suffix: "" },
      { value: "18", label: "Months average progression", suffix: " mo" },
    ],
    theme: "light",
  },

  "associate-fellow-l4": {
    id: "associate-fellow-l4",
    slug: "associate-fellow-l4",
    title: "Associate Fellow Level 4",
    subtitle: "Applied practitioner recognition",
    abbreviation: "AFIPC L4",
    heroEyebrow: "Applied Recognition",
    heroDescription:
      "Associate Fellow Level 4 is applied practitioner recognition for professionals who can apply project controls independently on live projects or programmes.",
    heroImage:
      "/images/membership/Associate Fellow Level 4.png",
    heroPersonImage:
      "/images/membership/Associate Fellow Level 4.png",
    personName: "David Chen",
    personTitle: "Associate Fellow L4",
    whoIsItFor: {
      title: "Who is it for?",
      paragraphs: [
        "Associate Fellow Level 4 is for experienced practitioners who apply project controls independently on live projects or programmes.",
        "It is suitable for planners, schedulers, project controllers, PMO analysts, cost engineers, risk professionals, commercial specialists and consultants.",
        "Through AFIPC L4, members gain applied practitioner recognition and a clear pathway towards FIPC Level 6.",
      ],
      highlight:
        "Demonstrate independent project controls capability and progress towards senior professional recognition.",
    },
    howToApply: {
      intro: "Prepare your portfolio and begin your recognition application.",
      description: "Learn more about each step in the recognition application process for Associate Fellow Level 4.",
      steps: [
        {
          step: 1,
          title: "Submit your portfolio",
          content: "Prepare and submit a comprehensive portfolio demonstrating applied competence on live projects. Review our portfolio checklist and assessment guide.",
          icon: "ri-file-edit-line",
          links: [
            { label: "portfolio checklist", href: "mailto:office@instituteofprojectcontrols.org" },
            { label: "assessment guide", href: "mailto:office@instituteofprojectcontrols.org" },
          ],
          ctaText: "Apply Now",
          ctaHref: "mailto:office@instituteofprojectcontrols.org",
        },
        {
          step: 2,
          title: "Panel assessment",
          icon: "ri-search-line",
          content: "Your portfolio undergoes rigorous assessment by senior IPC panellists against the L4 applied competence criteria.",
        },
        {
          step: 3,
          title: "Outcome notification",
          icon: "ri-shield-check-line",
          content: "Receive your detailed assessment outcome with feedback. Successful candidates are awarded AFIPC L4 recognition.",
        },
        {
          step: 4,
          title: "Activate recognition",
          icon: "ri-key-2-line",
          content: "Activate your post-nominal AFIPC L4, update your professional profiles, and access senior practitioner resources.",
        },
        {
          step: 5,
          icon: "ri-line-chart-line",
          title: "Ongoing development",
          content: "Maintain your CPD record, renew your recognition annually, and progress to Fellowship when ready.",
          links: [
            { label: "CPD guidance", href: "/membership" },
            { label: "Fellowship route", href: "/membership/grades/fellow" },
          ],
        },
      ],
      priceLabel: "Annual subscription:",
      priceValue: "£100",
      pricePeriod: "per year",
      ctaText: "Apply now",
      ctaHref: "mailto:office@instituteofprojectcontrols.org",
      employerNote:
        "Ask your employer to fund your IPC recognition. Our downloadable resources can help you make the business case.",
    },
    benefits: {
      eyebrow: "Benefits",
      title: "Benefits of Associate Fellowship L4",
      items: [
        "All lower grade benefits included",
        "Post-nominal AFIPC L4 visibility and professional profile",
        "Applied practitioner recognition",
        "Professional contribution and thought leadership opportunities",
        "Strong market signal to employers and clients",
        "Leadership preparation and development",
        "Awards and honours pathway",
        "Mentoring programme as mentor",
        "Speaking and publication opportunities",
        "Pathway to Fellowship",
      ],
    },
    whySection: {
      title: "Why Associate Fellow Level 4?",
      paragraphs: [
        "Associate Fellow Level 4 recognises professionals who can independently apply project controls techniques within live projects or programmes.",
        "Through AFIPC L4, members demonstrate applied competence in planning, cost, forecasting, performance reporting, risk, change and stakeholder communication.",
        "The grade strengthens professional credibility, confirms practitioner-level capability and provides a clear pathway towards FIPC Level 6.",
      ],
      testimonial: {
        quote:
          "Hear from Associate Fellow L4, David, about how applied recognition elevated his career and positioned him for senior leadership.",
        author: "David Chen",
        role: "Associate Fellow L4",
        videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://readdy.ai/api/search-image?query=Senior%20male%20project%20controls%20manager%20in%20tailored%20dark%20suit%20speaking%20to%20camera%20in%20premium%20corporate%20office%20with%20city%20skyline%20view%2C%20dramatic%20warm%20studio%20lighting%20with%20golden%20accents%2C%20cinematic%20video%20interview%20framing%2C%20authoritative%20confident%20professional%20expression%2C%20elegant%20blurred%20background%20with%20warm%20charcoal%20and%20gold%20tones%2C%20shallow%20depth%20of%20field%2C%20editorial%20documentary%20video%20still%20quality&width=800&height=450&seq=video-thumb-af4&orientation=landscape",
      },
    },
    pricingBanner: {
      text: "Associate Fellowship L4 costs £100 per year",
      ctaText: "Apply now",
      ctaHref: "mailto:office@instituteofprojectcontrols.org",
    },
    otherGrades: [
      {
        slug: "professional",
        title: "Professional",
        description:
          "Professional membership for practitioners active in project controls or project delivery.",
        image:
          membershipOverviewImages.professional,
      },
      {
        slug: "associate-fellow-l3",
        title: "Associate Fellow L3",
        description:
          "Foundation practitioner recognition based on technician-level competence and evidence.",
        image:
          membershipOverviewImages.associateFellowL3,
      },
      {
        slug: "fellow",
        title: "Fellow",
        description:
          "Senior professional recognition for strategic project controls leadership and contribution.",
        image:
          membershipOverviewImages.fellow,
      },
    ],
    contactCta: {
      title: "Need to speak to a customer service advisor?",
      queries: "Membership queries: office@instituteofprojectcontrols.org",
      queriesIntl: "International queries: office@instituteofprojectcontrols.org",
    },
    stats: [
      { value: "100", label: "Annual membership", prefix: "£", suffix: "", highlight: true },
      { value: "85%", label: "Employer-funded applications", suffix: "" },
      { value: "2x", label: "LinkedIn profile visibility", suffix: "" },
      { value: "1,800+", label: "Senior practitioners", suffix: "" },
    ],
    theme: "warm",
  },

  fellow: {
    id: "fellow",
    slug: "fellow",
    title: "Fellow membership",
    subtitle: "Senior professional recognition",
    abbreviation: "FIPC",
    heroEyebrow: "Senior Fellowship",
    heroDescription:
      "Fellowship is the senior professional recognition of the Institute. Aspirational, selective and respected. For strategic project controls leadership and contribution.",
    heroImage:
      "/images/membership/Fellow.png",
    heroPersonImage:
      "/images/membership/Fellow.png",
    personName: "Eleanor Whitfield",
    personTitle: "Fellow",
    whoIsItFor: {
      title: "Who is it for?",
      paragraphs: [
        "Fellow Level 6 is for senior project controls professionals who lead, assure or improve controls across complex projects, programmes or organisations.",
        "It is suitable for project controls managers, planning, cost and risk leads, programme controls managers, senior consultants, claims specialists and heads of profession.",
        "Through FIPC, members gain senior recognition for strategic judgement, leadership and contribution to the profession.",
      ],
      highlight:
        "Demonstrate strategic project controls leadership and recognised senior professional standing.",
    },
    howToApply: {
      intro: "Prepare your senior portfolio and begin your Fellowship application.",
      description: "Learn more about each step in the Fellowship application process to become a senior recognised leader in project controls.",
      steps: [
        {
          step: 1,
          title: "Submit your senior portfolio",
          content: "Prepare and submit a senior portfolio demonstrating strategic leadership and contribution. Review our Fellowship application checklist and guidelines.",
          icon: "ri-file-edit-line",
          links: [
            { label: "application checklist", href: "mailto:office@instituteofprojectcontrols.org" },
            { label: "guidelines", href: "mailto:office@instituteofprojectcontrols.org" },
          ],
          ctaText: "Apply Now",
          ctaHref: "mailto:office@instituteofprojectcontrols.org",
        },
        {
          step: 2,
          title: "Fellowship assessment",
          icon: "ri-search-line",
          content: "Your senior portfolio is assessed by the IPC Fellowship assessment panel against strategic and leadership criteria.",
        },
        {
          step: 3,
          title: "Panel decision",
          icon: "ri-shield-check-line",
          content: "The Fellowship panel reviews your evidence and contribution record before making a decision.",
        },
        {
          step: 4,
          title: "Fellowship awarded",
          icon: "ri-key-2-line",
          content: "Upon successful assessment, receive your FIPC post-nominal, certificate and invitation to the Fellowship community.",
        },
        {
          step: 5,
          title: "Ongoing leadership",
          icon: "ri-vip-crown-line",
          content: "Contribute to Institute governance, mentor the next generation, and maintain your senior recognition through CPD and annual renewal.",
          links: [
            { label: "governance opportunities", href: "/membership" },
            { label: "mentoring programme", href: "/membership" },
          ],
        },
      ],
      priceLabel: "Annual subscription:",
      priceValue: "£100",
      pricePeriod: "per year",
      ctaText: "Apply now",
      ctaHref: "mailto:office@instituteofprojectcontrols.org",
      employerNote:
        "Fellowship recognition is typically employer-supported. Our resources can help you make the case for senior investment.",
    },
    benefits: {
      eyebrow: "Benefits",
      title: "Benefits of Fellowship",
      items: [
        "All lower grade benefits included",
        "Post-nominal FIPC senior professional identity",
        "Speaking and thought leadership platform",
        "Professional magazine and journal contribution",
        "Institute governance and committee opportunities",
        "LinkedIn and CV authority signal",
        "Mentoring and judging programme as senior mentor",
        "Employer and client confidence enhancement",
        "Legacy and professional status",
        "Global professional recognition",
      ],
    },
    whySection: {
      title: "Why Fellowship?",
      paragraphs: [
        "Fellowship recognises senior professionals who demonstrate strategic judgement, leadership and advanced competence across integrated project controls.",
        "Through FIPC, members show their ability to assure project information, challenge assumptions, influence senior decisions and improve project controls systems and practice.",
        "The grade provides the Institute’s highest level of professional recognition, strengthening senior credibility while creating opportunities to mentor, contribute to thought leadership and support the future development of the profession.",
      ],
      testimonial: {
        quote:
          "Hear from Fellow, Eleanor, about how senior recognition enabled her to shape the profession and leave a lasting legacy.",
        author: "Eleanor Whitfield",
        role: "Fellow",
        videoUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
        thumbnailUrl: "https://readdy.ai/api/search-image?query=Distinguished%20senior%20executive%20woman%20in%20premium%20dark%20suit%20speaking%20to%20camera%20in%20elegant%20institutional%20boardroom%2C%20dramatic%20warm%20studio%20lighting%20with%20rich%20golden%20highlights%2C%20cinematic%20video%20interview%20framing%2C%20authoritative%20inspiring%20leadership%20expression%2C%20sophisticated%20background%20with%20dark%20wood%20paneling%20and%20subtle%20warm%20ambient%20glow%2C%20shallow%20depth%20of%20field%2C%20editorial%20documentary%20video%20still%20with%20premium%20quality&width=800&height=450&seq=video-thumb-fellow&orientation=landscape",
      },
    },
    pricingBanner: {
      text: "Fellowship costs £100 per year",
      ctaText: "Apply now",
      ctaHref: "mailto:office@instituteofprojectcontrols.org",
    },
    otherGrades: [
      {
        slug: "associate-fellow-l3",
        title: "Associate Fellow L3",
        description:
          "Foundation practitioner recognition based on technician-level competence and evidence.",
        image:
          membershipOverviewImages.associateFellowL3,
      },
      {
        slug: "associate-fellow-l4",
        title: "Associate Fellow L4",
        description:
          "Applied practitioner recognition for independent work on live projects and programmes.",
        image:
          membershipOverviewImages.associateFellowL4,
      },
      {
        slug: "professional",
        title: "Professional",
        description:
          "Professional membership for practitioners active in project controls or project delivery.",
        image:
          membershipOverviewImages.professional,
      },
    ],
    contactCta: {
      title: "Need to speak to a customer service advisor?",
      queries: "Membership queries: office@instituteofprojectcontrols.org",
      queriesIntl: "International queries: office@instituteofprojectcontrols.org",
    },
    stats: [
      { value: "100", label: "Annual membership", prefix: "£", suffix: "", highlight: true },
      { value: "500+", label: "Senior fellows globally", suffix: "" },
      { value: "15+", label: "Years average experience", suffix: "" },
      { value: "98%", label: "Annual retention rate", suffix: "" },
    ],
    theme: "dark",
  },
};

export const gradeNavTabs = [
  { slug: "affiliate", label: "Affiliate" },
  { slug: "professional", label: "Professional" },
  { slug: "associate-fellow-l3", label: "Associate Fellow L3" },
  { slug: "associate-fellow-l4", label: "Associate Fellow L4" },
  { slug: "fellow", label: "Fellow" },
];
