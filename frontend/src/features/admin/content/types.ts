export type ContentSectionValue = Record<string, unknown> | Array<Record<string, unknown>>;

export interface AdminContentTable {
  slug: string;
  label: string;
  table_name: string;
  is_active: boolean;
  updated_at: string;
  sections: Record<string, ContentSectionValue>;
}
