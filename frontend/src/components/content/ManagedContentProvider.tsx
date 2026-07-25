/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import { apiJson } from "@/lib/api";
import { subscribeToContentUpdates, type ContentPageSlug } from "@/lib/contentSync";

type ManagedContent = Record<string, unknown>;
const INTERNAL_CONTENT_PATTERN = /\bCMS-ready\b|\bplaceholder(?:s)?\b|\breplace this\b|\[confirmed|managed in CMS/i;

function sanitisePublicContent<T>(value: T): T {
  if (typeof value === "string") return (INTERNAL_CONTENT_PATTERN.test(value) ? "" : value) as T;
  if (Array.isArray(value)) return value.map(sanitisePublicContent) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sanitisePublicContent(item)])) as T;
  }
  return value;
}

const ManagedContentContext = createContext<ManagedContent>({});

export function ManagedContentProvider({ endpoint, slug, children }: { endpoint: string; slug: ContentPageSlug; children: React.ReactNode }) {
  const [content, setContent] = useState<ManagedContent>({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await apiJson<ManagedContent>(endpoint, undefined, { cache: "no-store" });
        if (!cancelled) setContent(response);
      } catch {
        if (!cancelled) setContent({});
      }
    };
    void load();
    const unsubscribe = subscribeToContentUpdates(slug, () => void load());
    return () => { cancelled = true; unsubscribe(); };
  }, [endpoint, slug]);

  return (
    <ManagedContentContext.Provider value={content}>
      {content.is_active === false ? null : children}
    </ManagedContentContext.Provider>
  );
}

export function useManagedSection<T>(name: string, fallback: T): T {
  const content = useContext(ManagedContentContext);
  const value = content[name];
  if (!value || typeof value !== "object") return fallback;
  if (
    !Array.isArray(value)
    && !Array.isArray(fallback)
    && fallback
    && typeof fallback === "object"
  ) {
    return sanitisePublicContent({ ...(fallback as Record<string, unknown>), ...(value as Record<string, unknown>) }) as T;
  }
  return sanitisePublicContent(value as T);
}

export function isManagedItemActive(item: unknown): boolean {
  return !item || typeof item !== "object" || !("is_active" in item) || (item as { is_active?: boolean }).is_active !== false;
}

export function ManagedSectionGate({ name, children }: { name: string; children: React.ReactNode }) {
  const content = useContext(ManagedContentContext);
  return isManagedItemActive(content[name]) ? children : null;
}
