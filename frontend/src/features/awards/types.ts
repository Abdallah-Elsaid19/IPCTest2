export interface AwardCategory {
  id: number;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  icon_class: string;
  highlights: string[];
  is_active: boolean;
  sort_order: number;
}

export interface AdminAwardCategory extends AwardCategory {
  created_at: string;
  updated_at: string;
}

export type AwardCategoryPayload = Omit<
  AwardCategory,
  "id" | "slug"
>;

export interface AwardProgramme {
  id: number;
  title: string;
  slug: string;
  description: string;
  criteria: string[];
  category: string;
  category_title: string;
  is_active: boolean;
}

export interface AdminAwardProgramme extends AwardProgramme {
  created_at: string;
  updated_at: string;
}

export interface AwardProgrammePayload {
  title: string;
  description: string;
  criteria: string[];
  category: string;
  is_active: boolean;
}
