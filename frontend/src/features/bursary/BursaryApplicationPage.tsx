import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, ChevronRight, LoaderCircle, LockKeyhole, LogIn, Printer, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  FormProvider,
  useForm,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import SEO from "@/components/seo/SEO";
import { useAuth } from "@/features/auth/AuthContext";
import {
  bursaryApi,
  moduleLabels,
  type BursarySubmissionResponse,
  type CurrentBursaryApplicationResponse,
} from "./api";
import {
  clearBursaryDraft,
  loadBursaryDraft,
  saveBursaryDraft,
} from "./draft";
import {
  EmergencyInformationStep,
  OrganisationDetailsStep,
  ModuleSelectionStep,
  PersonalDetailsStep,
  ReviewAndDeclarationStep,
  TermsAndConsentsStep,
} from "./Steps";
import {
  bursaryApplicationSchema,
  defaultBursaryApplicationValues,
  localIsoDate,
  stepFieldNames,
  type BursaryApplicationFormValues,
} from "./schema";

const stepTitles = [
  "Personal Details",
  "Organisation Details",
  "Emergency Contact and Identification",
  "Module Selection",
  "Mandatory Terms and Consents",
  "Review and Declaration",
];

function normaliseEditableValues(
  values: BursaryApplicationFormValues,
): BursaryApplicationFormValues {
  return {
    ...values,
    organisationDetails: {
      ...values.organisationDetails,
      employmentStartDate: values.organisationDetails.employmentStartDate || "",
    },
    reviewAndDeclaration: {
      ...values.reviewAndDeclaration,
      dateSigned: localIsoDate(),
      electronicSignature: values.reviewAndDeclaration.electronicSignature || "",
    },
  };
}

function BursaryAccessCard({
  mode,
  application,
}: {
  mode: "login" | "locked" | "error";
  application?: CurrentBursaryApplicationResponse | null;
}) {
  const location = useLocation();
  const isLocked = mode === "locked";
  const isRejected = isLocked && application?.status === "rejected";
  return (
    <div className="min-h-[75vh] bg-background-50 px-5 py-20">
      <SEO
        title="IPC Bursary Application"
        description="Access your IPC bursary application."
        canonicalPath="/bursary-scholarship-application"
        noIndex
      />
      <div className="mx-auto max-w-2xl border border-background-300 bg-white p-8 text-center shadow-sm md:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary-100 text-primary-800">
          {mode === "login" ? <LogIn size={28} /> : <LockKeyhole size={28} />}
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-primary-800">
          {isRejected ? "Application closed" : isLocked ? "Application locked" : mode === "login" ? "Secure member access" : "Application unavailable"}
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-background-950">
          {isRejected
            ? "Your IPC Bursary application was not approved."
            : isLocked
            ? "Your IPC Bursary application has been submitted."
            : mode === "login"
              ? "Sign in to open the application form."
              : "We could not check your application."}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-foreground-600">
          {isRejected
            ? "This application is closed. You can book an information session with IPC to discuss the available routes and next steps."
            : isLocked
            ? "The form remains read-only while IPC reviews it. It will reopen automatically only if the status is changed to Needs information."
            : mode === "login"
              ? "Your account is required so IPC can protect the submitted form and reopen the same application safely if more information is requested."
              : "Refresh the page and try again. Your submitted application has not been changed."}
        </p>
        {isLocked && application?.applicationReference && (
          <div className="mx-auto mt-7 max-w-md border border-primary-200 bg-primary-50 p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary-800">Application reference</p>
            <p className="mt-2 break-all font-mono text-base font-bold">{application.applicationReference}</p>
            <p className="mt-2 text-sm text-foreground-600">Status: {application.statusLabel}</p>
          </div>
        )}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {isRejected ? (
            <Link to="/information-session" className="btn-primary">
              Book an information session
            </Link>
          ) : mode === "login" ? (
            <Link
              to="/login"
              state={{ from: `${location.pathname}${location.search}` }}
              className="btn-primary"
            >Sign in</Link>
          ) : mode === "error" ? (
            <button type="button" onClick={() => window.location.reload()} className="btn-primary">Try again</button>
          ) : (
            <Link to="/user/scholarships" className="btn-primary">View my applications</Link>
          )}
          {isRejected ? (
            <Link to="/user/scholarships" className="inline-flex min-h-12 items-center justify-center border border-background-300 px-5 text-sm font-semibold hover:border-primary-500">
              View my applications
            </Link>
          ) : (
            <Link to="/scholarships" className="inline-flex min-h-12 items-center justify-center border border-background-300 px-5 text-sm font-semibold hover:border-primary-500">
              Return to scholarships
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function ApplicationProgress({
  currentStep,
  completedSteps,
  organisationSkipped,
}: {
  currentStep: number;
  completedSteps: Set<number>;
  organisationSkipped: boolean;
}) {
  return (
    <nav aria-label="Application progress" className="border border-background-300 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-800">Section {currentStep + 1} of 6</p>
        <p className="text-xs text-foreground-500">{Math.round(((currentStep + 1) / 6) * 100)}% through form</p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background-200">
        <div className="h-full bg-primary-500 transition-all" style={{ width: `${((currentStep + 1) / 6) * 100}%` }} />
      </div>
      <ol className="mt-5 grid grid-cols-6 gap-2">
        {stepTitles.map((title, index) => {
          const complete = completedSteps.has(index);
          const current = index === currentStep;
          const skipped = index === 1 && organisationSkipped;
          return (
            <li key={title} className="min-w-0" aria-current={current ? "step" : undefined}>
              <div className={`mx-auto grid h-9 w-9 place-items-center rounded-full border text-xs font-bold ${current ? "border-primary-600 bg-primary-500 text-background-950" : complete ? "border-emerald-700 bg-emerald-100 text-emerald-800" : "border-background-300 bg-background-100 text-foreground-500"}`}>
                {complete ? <Check size={16} aria-hidden="true" /> : index + 1}
              </div>
              <p className={`mt-2 hidden text-center text-[10px] leading-4 md:block ${current ? "font-semibold text-background-950" : "text-foreground-500"}`}>
                {title}{skipped ? " — not applicable" : ""}
              </p>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-center text-sm font-semibold text-background-950 md:hidden">
        {stepTitles[currentStep]}{currentStep === 1 && organisationSkipped ? " — not applicable" : ""}
      </p>
    </nav>
  );
}

function SubmissionSuccess({
  result,
  values,
}: {
  result: BursarySubmissionResponse;
  values: BursaryApplicationFormValues;
}) {
  const resubmitted = result.status === "under_review";
  useEffect(() => {
    document.body.classList.add("bursary-summary-ready");
    return () => document.body.classList.remove("bursary-summary-ready");
  }, []);

  return (
    <div className="bursary-print-page min-h-[75vh] bg-background-50 px-6 py-16 md:py-24">
      <SEO
        title="Bursary application received"
        description="IPC bursary and scholarship application confirmation."
        canonicalPath="/bursary-scholarship-application"
        noIndex
      />
      <div className="bursary-print-summary mx-auto max-w-3xl border border-background-300 bg-white p-7 text-center shadow-sm md:p-12">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-800">
          <ShieldCheck size={30} />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-800">{resubmitted ? "Updated information received" : "Application received"}</p>
        <h1 className="mt-2 text-3xl font-semibold text-background-950 md:text-4xl">Thank you, {values.personalDetails.firstName}</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-foreground-600">
          {resubmitted
            ? "IPC has received your updated information. Your application is locked again and is now back under review."
            : "IPC has received your learner bursary and scholarship application. Submission does not guarantee an award."}
        </p>
        <div className="mx-auto mt-8 max-w-md border border-primary-300 bg-primary-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-800">Application reference</p>
          <p className="mt-2 break-all font-mono text-xl font-bold text-background-950">{result.applicationReference}</p>
          <p className="mt-2 text-xs text-foreground-600">Keep this reference for any future correspondence.</p>
        </div>
        <div className="mt-8 border border-background-300 bg-background-100 p-5 text-left">
          <h2 className="font-semibold text-background-950">Submitted summary</h2>
          <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-foreground-500">Applicant</dt><dd className="font-medium">{values.personalDetails.firstName} {values.personalDetails.lastName}</dd></div>
            <div><dt className="text-xs text-foreground-500">Modules</dt><dd className="font-medium">{values.pathwaySelection.preferredModules.map((value) => moduleLabels[value]).filter(Boolean).join(", ")}</dd></div>
            <div><dt className="text-xs text-foreground-500">Submitted</dt><dd className="font-medium">{new Date(result.submittedAt).toLocaleString("en-GB")}</dd></div>
            <div><dt className="text-xs text-foreground-500">Status</dt><dd className="font-medium">{resubmitted ? "Under review" : "Submitted"}</dd></div>
          </dl>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row print:hidden">
          <button type="button" onClick={() => window.print()} className="btn-primary">
            <Printer size={16} /> Print or save summary
          </button>
          <Link to="/scholarships" className="inline-flex min-h-12 items-center justify-center border border-background-300 px-5 text-sm font-semibold hover:border-primary-500">
            Return to scholarships
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BursaryApplicationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedApplicationReference = searchParams.get("applicationReference")?.trim() || "";
  const [initialDraft] = useState(() => loadBursaryDraft());
  const [currentStep, setCurrentStep] = useState(initialDraft?.currentStep ?? 0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    () => new Set(initialDraft?.completedSteps ?? []),
  );
  const [draftStatus, setDraftStatus] = useState<
    "restored" | "saving" | "saved" | "unavailable"
  >(initialDraft ? "restored" : "saved");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(
    initialDraft?.updatedAt ?? null,
  );
  const [submitError, setSubmitError] = useState("");
  const [applicationAccess, setApplicationAccess] = useState<CurrentBursaryApplicationResponse | null>(null);
  const [accessLoading, setAccessLoading] = useState(true);
  const [accessError, setAccessError] = useState("");
  const [submitted, setSubmitted] = useState<{
    result: BursarySubmissionResponse;
    values: BursaryApplicationFormValues;
  } | null>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const submitLock = useRef(false);
  const persistenceEnabled = useRef(true);
  const methods = useForm<BursaryApplicationFormValues>({
    resolver: zodResolver(bursaryApplicationSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    shouldUnregister: false,
    defaultValues: initialDraft?.values ?? defaultBursaryApplicationValues,
  });
  const organisationSkipped = methods.watch("personalDetails.currentlyEmployed") === false;
  const finalReview = methods.watch("reviewAndDeclaration");
  const finalSubmissionReady = [
    finalReview.section1Complete,
    finalReview.section2CompleteOrNotApplicable,
    finalReview.section3Complete,
    finalReview.section4Complete,
    finalReview.section5Complete,
    finalReview.informationAccurateDeclaration,
    finalReview.noAwardGuaranteeDeclaration,
    finalReview.pathwayTermsDeclaration,
    finalReview.processingConsentDeclaration,
    finalReview.applicantIdentityDeclaration,
  ].every((value) => value === true)
    && Boolean(finalReview.dateSigned)
    && finalReview.electronicSignature.startsWith("data:image/png;base64,");
  const formReady = Boolean(
    !authLoading
    && !accessLoading
    && !accessError
    && (
      !user
      || !applicationAccess?.hasApplication
      || applicationAccess.editable
    ),
  );

  useEffect(() => {
    if (currentStep !== 5) return;
    methods.setValue("reviewAndDeclaration.dateSigned", localIsoDate(), {
      shouldDirty: false,
      shouldValidate: false,
    });
    methods.clearErrors("reviewAndDeclaration");
  }, [currentStep, methods]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setApplicationAccess(null);
      setAccessLoading(false);
      setAccessError("");
      return;
    }

    const controller = new AbortController();
    setAccessLoading(true);
    setAccessError("");
    void bursaryApi.current(requestedApplicationReference, controller.signal)
      .then((current) => {
        if (controller.signal.aborted) return;
        setApplicationAccess(current);
        if (current.hasApplication && current.editable && current.values) {
          clearBursaryDraft();
          methods.reset(normaliseEditableValues(current.values));
          setCurrentStep(5);
          setCompletedSteps(new Set([0, 1, 2, 3, 4]));
          setDraftStatus("saved");
          setLastSavedAt(Date.now());
          persistenceEnabled.current = true;
        } else if (current.hasApplication) {
          persistenceEnabled.current = false;
          clearBursaryDraft();
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setAccessError(error instanceof Error ? error.message : "Could not check your application.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setAccessLoading(false);
      });
    return () => controller.abort();
  }, [authLoading, methods, requestedApplicationReference, user]);

  useEffect(() => {
    if (!formReady || !persistenceEnabled.current) return;
    let saveTimer: number | undefined;

    const persist = () => {
      if (!persistenceEnabled.current) return;
      const saved = saveBursaryDraft(
        methods.getValues(),
        currentStep,
        completedSteps,
      );
      if (saved) {
        setLastSavedAt(Date.now());
        setDraftStatus("saved");
      } else {
        setDraftStatus("unavailable");
      }
    };
    const scheduleSave = () => {
      if (!persistenceEnabled.current) return;
      setDraftStatus("saving");
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(persist, 350);
    };
    const subscription = methods.watch(scheduleSave);
    const handlePageHide = () => {
      window.clearTimeout(saveTimer);
      persist();
    };

    persist();
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      subscription.unsubscribe();
      window.clearTimeout(saveTimer);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [completedSteps, currentStep, formReady, methods]);

  const currentComponent = useMemo(() => {
    if (currentStep === 0) return <PersonalDetailsStep />;
    if (currentStep === 1) return <OrganisationDetailsStep />;
    if (currentStep === 2) return <EmergencyInformationStep />;
    if (currentStep === 3) return <ModuleSelectionStep />;
    if (currentStep === 4) return <TermsAndConsentsStep />;
    return (
      <ReviewAndDeclarationStep
        completedSteps={completedSteps}
        onEdit={(step) => {
          setCurrentStep(step);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }, [completedSteps, currentStep]);

  const focusErrorSummary = () => window.setTimeout(() => errorSummaryRef.current?.focus(), 0);

  const goNext = async () => {
    setSubmitError("");
    const fields = stepFieldNames[currentStep] as FieldPath<BursaryApplicationFormValues>[];
    const valid = await methods.trigger(fields, { shouldFocus: true });
    if (!valid) {
      focusErrorSummary();
      return;
    }
    setCompletedSteps((previous) => new Set(previous).add(currentStep));
    if (currentStep === 4) {
      // The resolver checks the whole schema. Do not carry untouched final-step
      // errors into the review page when Section 5 is the section being checked.
      methods.clearErrors("reviewAndDeclaration");
    }
    setCurrentStep((step) => Math.min(5, step + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async (values: BursaryApplicationFormValues) => {
    if (currentStep !== 5) return;
    if (submitLock.current) return;
    submitLock.current = true;
    setSubmitError("");
    try {
      const result = applicationAccess?.editable
        ? await bursaryApi.resubmit(values, applicationAccess.applicationReference)
        : await bursaryApi.submit(values);
      persistenceEnabled.current = false;
      clearBursaryDraft();
      setSubmitted({ result, values });
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "The application could not be submitted. Please try again.");
      focusErrorSummary();
    } finally {
      submitLock.current = false;
    }
  };

  const handleInvalid = (_errors: FieldValues) => focusErrorSummary();

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const isFinalSubmitButton = submitter?.dataset.bursaryFinalSubmit === "true";

    if (currentStep !== 5 || !isFinalSubmitButton) {
      event.preventDefault();
      if (currentStep < 5) void goNext();
      return;
    }

    void methods.handleSubmit(submit, handleInvalid)(event);
  };

  if (authLoading || accessLoading) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-background-50" role="status">
        <LoaderCircle className="animate-spin text-primary-700" size={34} />
        <span className="sr-only">Checking your bursary application</span>
      </div>
    );
  }
  if (!user && requestedApplicationReference) return <BursaryAccessCard mode="login" />;
  if (accessError) return <BursaryAccessCard mode="error" />;
  if (applicationAccess?.hasApplication && !applicationAccess.editable) {
    return <BursaryAccessCard mode="locked" application={applicationAccess} />;
  }
  if (submitted) return <SubmissionSuccess result={submitted.result} values={submitted.values} />;

  return (
    <div className="bg-background-50 pb-20 pt-14 md:pt-20">
      <SEO
        title="IPC Learner Bursary & Scholarship Application Form"
        description="Apply for IPC bursary support for a professional module."
        canonicalPath="/bursary-scholarship-application"
        noIndex
      />
      <div className="container-content">
        <header className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-800">Learner application</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-background-950 md:text-5xl">
            IPC Learner Bursary &amp; Scholarship Application Form
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-foreground-600">
            Complete all six sections. Your progress is saved automatically in this browser for seven days and is removed after a successful submission.
          </p>
        </header>
        <div className="mx-auto mt-10 max-w-5xl">
          {applicationAccess?.editable && (
            <div className="mb-5 border border-amber-300 bg-amber-50 p-5 text-amber-950" role="status">
              <p className="font-semibold">IPC requested more information.</p>
              <p className="mt-1 text-sm leading-6">
                Your previous answers have been restored. Update the requested information and submit the same application again. It will then return to Under review and lock automatically.
              </p>
              <p className="mt-2 font-mono text-xs font-bold">{applicationAccess.applicationReference}</p>
            </div>
          )}
          <ApplicationProgress
            currentStep={currentStep}
            completedSteps={completedSteps}
            organisationSkipped={organisationSkipped}
          />
          <div
            className={`mt-3 flex items-center justify-center gap-2 border px-4 py-2.5 text-xs ${
              draftStatus === "unavailable"
                ? "border-amber-300 bg-amber-50 text-amber-900"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
            aria-live="polite"
          >
            {draftStatus !== "unavailable" && <Check size={15} aria-hidden="true" />}
            {draftStatus === "restored" && "Saved draft restored. You can continue where you stopped."}
            {draftStatus === "saving" && "Saving your draft…"}
            {draftStatus === "saved" && (
              lastSavedAt
                ? `Draft saved in this browser at ${new Date(lastSavedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.`
                : "Automatic draft saving is on."
            )}
            {draftStatus === "unavailable" && "This browser blocked draft storage. Keep this tab open while completing the form."}
          </div>
          <FormProvider {...methods}>
            <form
              className="mt-6 border border-background-300 bg-background-50 p-5 shadow-sm md:p-9"
              onSubmit={handleFormSubmit}
              noValidate
            >
              {(submitError || (
                Object.keys(methods.formState.errors).length > 0
                && (currentStep !== 5 || methods.formState.submitCount > 0)
              )) && (
                <div
                  ref={errorSummaryRef}
                  tabIndex={-1}
                  role="alert"
                  className="mb-6 border border-red-300 bg-red-50 p-4 text-sm text-red-800 outline-none focus:ring-2 focus:ring-red-500"
                >
                  <strong>{submitError ? "We could not submit your application." : "Check the highlighted fields before continuing."}</strong>
                  {submitError && <p className="mt-1">{submitError}</p>}
                </div>
              )}
              {currentComponent}
              <div className="sticky bottom-0 z-20 -mx-5 mt-10 flex items-center justify-between gap-3 border-t border-background-300 bg-background-50/95 px-5 py-4 backdrop-blur md:static md:mx-0 md:bg-transparent md:px-0 md:pb-0">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep((step) => Math.max(0, step - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={currentStep === 0 || methods.formState.isSubmitting}
                  className="inline-flex min-h-12 items-center gap-2 border border-background-300 bg-white px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} /> Back
                </button>
                {currentStep < 5 ? (
                  <button type="button" onClick={() => void goNext()} className="btn-primary min-h-12 px-5">
                    Continue <ChevronRight size={17} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    data-bursary-final-submit="true"
                    disabled={methods.formState.isSubmitting || !finalSubmissionReady}
                    aria-busy={methods.formState.isSubmitting}
                    title={finalSubmissionReady ? undefined : "Complete the checklist, declarations and signature before submitting."}
                    className="btn-primary min-h-12 px-5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {methods.formState.isSubmitting ? <><LoaderCircle size={17} className="animate-spin" /> Submitting</> : "Submit application"}
                  </button>
                )}
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
