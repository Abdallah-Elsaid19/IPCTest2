import { z } from "zod";

export const UK_TELEPHONE_ERROR =
  "Enter a valid UK telephone number, for example 07700 900123 or +44 7700 900123.";

export function normaliseUkTelephone(value: string) {
  let compact = value.trim().replace(/[\s().-]/g, "");
  if (compact.startsWith("0044")) compact = `+44${compact.slice(4)}`;
  if (compact.startsWith("+440")) compact = `+44${compact.slice(4)}`;
  else if (compact.startsWith("0")) compact = `+44${compact.slice(1)}`;
  // UK national numbers use 01 (excluding the unallocated 010 range),
  // 02, 03, 07, 08 or 09 prefixes after the domestic trunk zero.
  return /^\+44(?:1[1-9]\d{8}|[23789]\d{9})$/.test(compact) ? compact : null;
}

export const ukTelephoneSchema = z
  .string()
  .trim()
  .min(1, "UK telephone number is required.")
  .refine((value) => normaliseUkTelephone(value) !== null, UK_TELEPHONE_ERROR)
  .transform((value) => normaliseUkTelephone(value) as string);
