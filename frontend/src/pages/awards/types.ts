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
  secondary_description?: string;
  tertiary_description?: string;
  closing_description?: string;
  image_url?: string;
  image_alt?: string;
  disclaimer?: string;
  secondary_cta_label?: string;
  secondary_cta_url?: string;
  tertiary_cta_label?: string;
  tertiary_cta_url?: string;
  programme_items?: Array<{
    eyebrow: string;
    title: string;
    description: string;
    is_active?: boolean;
  }>;
  families_eyebrow?: string;
  families_title?: string;
  families_description?: string;
  quarterly_eyebrow?: string;
  quarterly_title?: string;
  quarterly_description?: string;
  quarterly_supporting_copy?: string;
  quarterly_items?: Array<{
    title: string;
    description: string;
    is_active?: boolean;
  }>;
  checklist_title?: string;
  checklist?: string[];
  cta_label?: string;
  cta_url?: string;
  criteria_title?: string;
  criteria?: Array<{
    title: string;
    weight: number;
    is_active?: boolean;
  }>;
  governance_eyebrow?: string;
  governance_title?: string;
  governance_description?: string;
  sponsorship_eyebrow?: string;
  sponsorship_title?: string;
  sponsorship_description?: string;
  sponsorship_cta_label?: string;
  sponsorship_cta_url?: string;
  sponsorship_items?: Array<{
    title: string;
    description: string;
    is_active?: boolean;
  }>;
}

export interface AwardBeneficiary {
  title: string;
  description: string;
  cta_label?: string;
  cta_url?: string;
  is_active?: boolean;
}

export interface AwardPartnership {
  title: string;
  description?: string;
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
    highlights?: Array<{
      title: string;
      description: string;
      is_active?: boolean;
    }>;
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
  recognition_intro: AwardSectionIntro;
  recognition_benefits: Array<{
    title: string;
    description: string;
    is_active?: boolean;
  }>;
  partnerships_intro: AwardSectionIntro;
  partnerships: AwardPartnership[];
  faq: AwardSectionIntro & { items: AwardFaqItem[] };
  interest_intro: AwardSectionIntro;
  final_cta: AwardSectionIntro & {
    cta_label: string;
    cta_url: string;
    secondary_cta_label?: string;
    secondary_cta_url?: string;
    items: Array<{ title: string; description: string; is_active?: boolean }>;
  };
  categories?: AwardCategory[];
  programmes?: AwardProgramme[];
  seo: {
    title: string;
    description: string;
    canonical_path: string;
    noindex?: boolean;
    nofollow?: boolean;
  };
  updated_at: string;
}
import type {
  AwardCategory,
  AwardProgramme,
} from "@/features/awards/types";
