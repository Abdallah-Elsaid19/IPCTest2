export interface AwardContentCard {
  icon: string;
  title: string;
  description: string;
  is_active?: boolean;
}

export interface AwardTimelineStep {
  phase: string;
  period: string;
  description: string;
  is_active?: boolean;
}

export interface AwardSectionIntro {
  eyebrow: string;
  title: string;
  description: string;
  is_active?: boolean;
  image_url?: string;
  image_alt?: string;
  disclaimer?: string;
  secondary_cta_label?: string;
  secondary_cta_url?: string;
}

export interface AwardBeneficiary {
  title: string;
  description: string;
  cta_label: string;
  cta_url: string;
  is_active?: boolean;
}

export interface AwardPartnership {
  title: string;
  items: string[];
  cta_label: string;
  cta_url: string;
  is_active?: boolean;
}

export interface AwardFaqItem {
  question: string;
  answer: string;
  is_active?: boolean;
}

export interface AwardPageContent {
  hero: AwardSectionIntro & {
    primary_cta_label: string;
    primary_cta_url: string;
    secondary_cta_label: string;
    secondary_cta_url: string;
  };
  framework_intro: AwardSectionIntro;
  featured_intro: AwardSectionIntro;
  timeline_intro: AwardSectionIntro;
  nomination_timeline: AwardTimelineStep[];
  benefits_intro: AwardSectionIntro;
  impact_benefits: AwardContentCard[];
  beneficiaries_intro: AwardSectionIntro;
  beneficiaries: AwardBeneficiary[];
  integrity_intro: AwardSectionIntro;
  integrity_principles: AwardContentCard[];
  partnerships_intro: AwardSectionIntro;
  partnerships: AwardPartnership[];
  faq: AwardSectionIntro & { items: AwardFaqItem[] };
  interest_intro: AwardSectionIntro;
  final_cta: AwardSectionIntro & {
    cta_label: string;
    cta_url: string;
    items: Array<{ title: string; description: string; is_active?: boolean }>;
  };
  seo: {
    title: string;
    description: string;
    canonical_path: string;
    noindex?: boolean;
    nofollow?: boolean;
  };
  updated_at: string;
}
