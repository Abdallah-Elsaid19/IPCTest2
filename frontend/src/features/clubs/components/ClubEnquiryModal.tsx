import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createClubEnquiry } from "../api/clubEnquiryApi";
import {
  clubEnquirySchema,
  type ClubEnquiryFormValues,
} from "../schemas/clubEnquirySchema";

interface ClubEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubName?: string;
  clubSlug?: string;
}

const focusableSelector = [
  "button:not([disabled])",
  "[href]",
  "input:not([disabled]):not([type='hidden'])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const fieldClass =
  "w-full rounded-lg border bg-background-50 px-4 py-3 text-sm text-background-950 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20";

export default function ClubEnquiryModal({
  isOpen,
  onClose,
  clubName,
  clubSlug,
}: ClubEnquiryModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const successButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClubEnquiryFormValues>({
    resolver: zodResolver(clubEnquirySchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      message: "",
      clubName,
      clubSlug,
      website: "",
    },
  });

  const messageLength = watch("message")?.length ?? 0;

  useEffect(() => {
    if (!isOpen) return;
    reset({ email: "", message: "", clubName, clubSlug, website: "" });
    setIsSuccess(false);
    setSubmitError("");
  }, [clubName, clubSlug, isOpen, reset]);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector)
      );
      if (!focusableElements.length) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isSuccess) successButtonRef.current?.focus();
  }, [isSuccess]);

  async function onSubmit(values: ClubEnquiryFormValues) {
    setSubmitError("");
    try {
      await createClubEnquiry({
        email: values.email,
        message: values.message,
        clubName,
        clubSlug,
        pageUrl: "/clubs",
        website: values.website,
      });
      reset({ email: "", message: "", clubName, clubSlug, website: "" });
      setIsSuccess(true);
    } catch {
      setSubmitError("We could not submit your enquiry at the moment. Please try again.");
    }
  }

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background-950/75 p-2 backdrop-blur-sm motion-safe:animate-[fade-in_180ms_ease-out] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="club-enquiry-title"
        aria-describedby="club-enquiry-description"
        className="relative max-h-[calc(100dvh-1rem)] w-full max-w-xl overflow-y-auto rounded-xl border border-background-200 bg-background-50 shadow-2xl shadow-background-950/30 motion-safe:animate-[fade-in_180ms_ease-out] sm:max-h-[calc(100dvh-3rem)]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close clubs enquiry"
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full text-foreground-500 transition-colors hover:bg-background-100 hover:text-background-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <i className="ri-close-line text-xl" aria-hidden="true" />
        </button>

        <div className="border-b border-background-200 px-6 pb-6 pt-7 pr-16 sm:px-8 sm:pt-8">
          <span className="eyebrow mb-3 block text-primary-600">Regional Communities</span>
          <h2 id="club-enquiry-title" className="font-heading text-2xl font-semibold text-background-950 sm:text-3xl">
            Enquire About Clubs
          </h2>
          <p id="club-enquiry-description" className="mt-3 text-sm leading-relaxed text-foreground-600 sm:text-base">
            Submit your enquiry and a member of the IPC team will contact you with more information about our clubs.
          </p>
        </div>

        {isSuccess ? (
          <div className="px-6 py-10 text-center sm:px-8 sm:py-12" role="status" aria-live="polite">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-100 text-accent-700">
              <i className="ri-check-line text-2xl" aria-hidden="true" />
            </div>
            <h3 className="mt-6 font-heading text-2xl font-semibold text-background-950">
              Thank you for your enquiry.
            </h3>
            <p className="mt-3 text-foreground-600">
              A member of the IPC team will contact you shortly.
            </p>
            <button
              ref={successButtonRef}
              type="button"
              onClick={onClose}
              className="btn-primary mt-7 px-8 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-6 py-7 sm:px-8 sm:py-8" noValidate>
            <div>
              <label htmlFor="club-enquiry-email" className="mb-2 block text-sm font-semibold text-background-950">
                Email address <span className="text-red-700" aria-hidden="true">*</span>
              </label>
              <input
                id="club-enquiry-email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "club-enquiry-email-error" : undefined}
                className={`${fieldClass} ${errors.email ? "border-red-500" : "border-background-300"}`}
                {...register("email")}
              />
              {errors.email && (
                <p id="club-enquiry-email-error" className="mt-1.5 text-xs text-red-700">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label htmlFor="club-enquiry-message" className="block text-sm font-semibold text-background-950">
                  Enquiry <span className="text-red-700" aria-hidden="true">*</span>
                </label>
                <span className="text-xs tabular-nums text-foreground-500" aria-live="polite">
                  {messageLength} / 2000
                </span>
              </div>
              <textarea
                id="club-enquiry-message"
                rows={6}
                maxLength={2000}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? "club-enquiry-message-error" : undefined}
                className={`${fieldClass} resize-y ${errors.message ? "border-red-500" : "border-background-300"}`}
                {...register("message")}
              />
              {errors.message && (
                <p id="club-enquiry-message-error" className="mt-1.5 text-xs text-red-700">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
              <label htmlFor="club-enquiry-website">Website</label>
              <input id="club-enquiry-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
            </div>

            {submitError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {submitError}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-background-200 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-lg border border-background-300 px-6 py-3 text-sm font-semibold text-background-950 transition-colors hover:bg-background-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                aria-disabled={isSubmitting}
                className="btn-primary px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? "Submitting…" : "Submit Enquiry"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
