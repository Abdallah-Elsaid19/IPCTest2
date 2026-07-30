import {
  defaultBursaryApplicationValues,
  type BursaryApplicationFormValues,
} from "./schema";

export const BURSARY_DRAFT_STORAGE_KEY = "ipc:bursary-application:draft:v1";
export const BURSARY_DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface BursaryApplicationDraft {
  version: 1;
  updatedAt: number;
  expiresAt: number;
  currentStep: number;
  completedSteps: number[];
  values: BursaryApplicationFormValues;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeKnownValue(defaultValue: unknown, savedValue: unknown): unknown {
  if (Array.isArray(defaultValue)) {
    return Array.isArray(savedValue)
      ? savedValue.filter((item) => typeof item === "string")
      : [...defaultValue];
  }
  if (isRecord(defaultValue)) {
    const savedRecord = isRecord(savedValue) ? savedValue : {};
    return Object.fromEntries(
      Object.entries(defaultValue).map(([key, value]) => [
        key,
        mergeKnownValue(value, savedRecord[key]),
      ]),
    );
  }
  if (savedValue === undefined) return defaultValue;
  if (defaultValue === undefined) {
    return ["string", "number", "boolean"].includes(typeof savedValue)
      ? savedValue
      : defaultValue;
  }
  return typeof savedValue === typeof defaultValue ? savedValue : defaultValue;
}

export function parseBursaryDraft(
  raw: string | null,
  now = Date.now(),
): BursaryApplicationDraft | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !isRecord(parsed)
      || parsed.version !== 1
      || typeof parsed.expiresAt !== "number"
      || parsed.expiresAt <= now
      || !isRecord(parsed.values)
    ) {
      return null;
    }
    const currentStep =
      typeof parsed.currentStep === "number" && Number.isInteger(parsed.currentStep)
        ? Math.min(5, Math.max(0, parsed.currentStep))
        : 0;
    const completedSteps = Array.isArray(parsed.completedSteps)
      ? [...new Set(
          parsed.completedSteps.filter(
            (step): step is number =>
              typeof step === "number"
              && Number.isInteger(step)
              && step >= 0
              && step <= 5,
          ),
        )]
      : [];

    return {
      version: 1,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : now,
      expiresAt: parsed.expiresAt,
      currentStep,
      completedSteps,
      values: mergeKnownValue(
        defaultBursaryApplicationValues,
        parsed.values,
      ) as BursaryApplicationFormValues,
    };
  } catch {
    return null;
  }
}

export function loadBursaryDraft(): BursaryApplicationDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BURSARY_DRAFT_STORAGE_KEY);
    const draft = parseBursaryDraft(raw);
    if (!draft && raw) window.localStorage.removeItem(BURSARY_DRAFT_STORAGE_KEY);
    return draft;
  } catch {
    return null;
  }
}

export function saveBursaryDraft(
  values: BursaryApplicationFormValues,
  currentStep: number,
  completedSteps: Iterable<number>,
  now = Date.now(),
) {
  if (typeof window === "undefined") return false;
  const draft: BursaryApplicationDraft = {
    version: 1,
    updatedAt: now,
    expiresAt: now + BURSARY_DRAFT_TTL_MS,
    currentStep: Math.min(5, Math.max(0, currentStep)),
    completedSteps: [...completedSteps],
    values,
  };
  try {
    window.localStorage.setItem(
      BURSARY_DRAFT_STORAGE_KEY,
      JSON.stringify(draft),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearBursaryDraft() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(BURSARY_DRAFT_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in privacy modes; there is nothing else to clear.
  }
}
