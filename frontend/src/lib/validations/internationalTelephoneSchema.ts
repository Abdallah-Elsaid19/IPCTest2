import { parsePhoneNumberFromString } from "libphonenumber-js";
import { z } from "zod";

import { normaliseUkTelephone } from "./ukTelephoneSchema";

export const INTERNATIONAL_TELEPHONE_ERROR =
  "Enter a valid telephone number with its country calling code, for example +20 106 705 5973 or +44 7700 900123.";

export function normaliseInternationalTelephone(value: string) {
  let compact = value.trim().replace(/[\s().-]/g, "");
  if (compact.startsWith("00")) compact = `+${compact.slice(2)}`;
  if (!compact.startsWith("+")) return normaliseUkTelephone(compact);
  const telephone = parsePhoneNumberFromString(compact);
  return telephone?.isPossible() ? telephone.number : null;
}

export const internationalTelephoneSchema = z
  .string()
  .trim()
  .min(1, "Telephone number is required.")
  .refine(
    (value) => normaliseInternationalTelephone(value) !== null,
    INTERNATIONAL_TELEPHONE_ERROR,
  )
  .transform((value) => normaliseInternationalTelephone(value) as string);
