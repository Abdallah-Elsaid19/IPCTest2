import { z } from "zod";

export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const ACCEPTED_IDENTITY_DOCUMENT_TYPES = [
  ...ACCEPTED_DOCUMENT_TYPES,
  ...ACCEPTED_IMAGE_TYPES,
];

function firstFile(value: unknown) {
  if (value instanceof File) return value;
  if (typeof FileList !== "undefined" && value instanceof FileList) return value.item(0) || undefined;
  return undefined;
}

export const requiredImageSchema = z
  .custom<FileList | File>((value) => Boolean(firstFile(value)), "Please upload an image.")
  .refine((value) => (firstFile(value)?.size || 0) <= MAX_IMAGE_SIZE, "Image must be less than 2MB.")
  .refine((value) => ACCEPTED_IMAGE_TYPES.includes(firstFile(value)?.type || ""), "Only JPG, JPEG, PNG, and WebP images are allowed.");

export const requiredDocumentSchema = z
  .custom<FileList | File>((value) => Boolean(firstFile(value)), "Please upload the required file.")
  .refine((value) => (firstFile(value)?.size || 0) <= MAX_DOCUMENT_SIZE, "File must be less than 10MB.")
  .refine((value) => ACCEPTED_DOCUMENT_TYPES.includes(firstFile(value)?.type || ""), "Only PDF, DOC, and DOCX files are allowed.");

export const requiredIdentityDocumentSchema = z
  .custom<FileList | File>((value) => Boolean(firstFile(value)), "Upload a government-issued proof of identification.")
  .refine((value) => (firstFile(value)?.size || 0) <= MAX_DOCUMENT_SIZE, "File must be less than 10MB.")
  .refine(
    (value) => ACCEPTED_IDENTITY_DOCUMENT_TYPES.includes(firstFile(value)?.type || ""),
    "Only PDF, DOC, DOCX, JPG, JPEG, PNG and WebP files are allowed.",
  );

export function getSelectedFile(value: FileList | File | undefined) {
  return firstFile(value);
}
