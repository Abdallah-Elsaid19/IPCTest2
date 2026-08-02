import { useEffect, useRef, useState } from "react";

interface QuizOption {
  label: string;
  score: number;
}

interface QuizStep {
  question: string;
  options: QuizOption[];
}

interface GradeResult {
  grade: string;
  copy: string;
}

interface GradeFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnFocusElement: HTMLButtonElement | null;
}

const quizSteps: QuizStep[] = [
  {
    question: "Which description is closest to your current position?",
    options: [
      { label: "I am learning, changing career or exploring project controls.", score: 0 },
      { label: "I work in project delivery or a related professional role.", score: 1 },
      { label: "I support project-controls tasks using established procedures.", score: 2 },
      { label: "I apply project-controls judgement independently on live work.", score: 3 },
      { label: "I lead controls frameworks or influence senior decisions.", score: 4 },
    ],
  },
  {
    question: "How independently do you work?",
    options: [
      { label: "I am building awareness and professional direction.", score: 0 },
      { label: "I contribute within an adjacent role or project team.", score: 1 },
      { label: "I complete defined tasks with guidance.", score: 2 },
      { label: "I select techniques and advise project teams independently.", score: 3 },
      { label: "I assure, challenge and improve organisational practice.", score: 4 },
    ],
  },
  {
    question: "What evidence could you provide?",
    options: [
      { label: "A statement of interest or evidence of study.", score: 0 },
      { label: "A CV, role summary and professional statement.", score: 1 },
      { label: "Reports, schedules, logs, trackers or manager confirmation.", score: 2 },
      { label: "A portfolio and case study showing integrated recommendations.", score: 3 },
      { label: "Strategic leadership, assurance, references and professional contribution.", score: 4 },
    ],
  },
  {
    question: "What is the level of your influence?",
    options: [
      { label: "My focus is learning and professional direction.", score: 0 },
      { label: "I contribute to a team or related function.", score: 1 },
      { label: "I support reliable information and escalation.", score: 2 },
      { label: "I advise teams and communicate recommendations.", score: 3 },
      { label: "I influence senior leaders, frameworks or the wider profession.", score: 4 },
    ],
  },
];

function resultByAverage(average: number): GradeResult {
  if (average < 0.75) {
    return {
      grade: "AffIPC — Affiliate",
      copy: "Affiliation may be the most appropriate starting point while you build knowledge, experience and professional evidence.",
    };
  }

  if (average < 1.75) {
    return {
      grade: "MIPC — Member",
      copy: "Professional Membership may provide the right identity while you develop competence-based evidence.",
    };
  }

  if (average < 2.75) {
    return {
      grade: "AFIPC L3 — Associate Fellow Level 3",
      copy: "Foundation-practitioner recognition may be suitable, subject to proportionate evidence and review.",
    };
  }

  if (average < 3.65) {
    return {
      grade: "AFIPC L4 — Associate Fellow Level 4",
      copy: "Applied-practitioner recognition may suit your independent project evidence and professional judgement.",
    };
  }

  return {
    grade: "FIPC — Fellow",
    copy: "Senior professional recognition may be appropriate where leadership, assurance and contribution can be evidenced.",
  };
}

export default function GradeFinderModal({
  isOpen,
  onClose,
  returnFocusElement,
}: GradeFinderModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<GradeResult | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const triggerElement = returnFocusElement;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      triggerElement?.focus();
    };
  }, [isOpen, onClose, returnFocusElement]);

  if (!isOpen) return null;

  const handleOption = (optionScore: number) => {
    const nextScore = score + optionScore;
    const nextStep = currentStep + 1;

    if (nextStep < quizSteps.length) {
      setScore(nextScore);
      setCurrentStep(nextStep);
      return;
    }

    setScore(nextScore);
    setResult(resultByAverage(nextScore / quizSteps.length));
  };

  const restartQuiz = () => {
    setScore(0);
    setCurrentStep(0);
    setResult(null);
  };

  const progress = result ? 100 : ((currentStep + 1) / quizSteps.length) * 100;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-background-950/80 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="grade-finder-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="my-auto w-full max-w-3xl border border-background-300 bg-background-50 shadow-2xl shadow-black/25"
      >
        <header className="flex items-start justify-between gap-5 border-b border-background-300 px-5 py-5 sm:px-7 sm:py-6">
          <div className="min-w-0 sm:flex sm:items-center sm:gap-4">
            <span className="eyebrow flex items-center gap-3 text-primary-600">
              <span className="h-px w-8 bg-primary-500" aria-hidden="true" />
              Indicative Grade Finder
            </span>
            <strong
              id="grade-finder-title"
              className="mt-2 block font-heading text-sm font-semibold text-background-950 sm:mt-0"
            >
              Find your likely IPC starting grade
            </strong>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-background-300 text-background-950 transition-colors hover:border-primary-500 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 motion-reduce:transition-none"
            aria-label="Close grade finder"
          >
            <i className="ri-close-line text-lg" aria-hidden="true" />
          </button>
        </header>

        <div className="px-5 py-6 sm:px-7 sm:py-7">
          <div
            className="h-[3px] bg-background-300"
            role="progressbar"
            aria-label="Grade finder progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <span
              className="block h-full bg-primary-500 transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          {!result ? (
            <div className="mt-6">
              <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-500">
                Question {currentStep + 1} of {quizSteps.length}
              </p>
              <h2 className="font-heading text-2xl font-semibold leading-tight text-background-950 sm:text-3xl">
                {quizSteps[currentStep].question}
              </h2>
              <div className="mt-6 grid gap-2.5">
                {quizSteps[currentStep].options.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleOption(option.score)}
                    className="min-h-14 border border-background-300 bg-background-50 px-4 py-3 text-left text-sm font-semibold leading-relaxed text-background-950 transition-colors hover:border-primary-500 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 sm:px-5 motion-reduce:transition-none"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-7">
              <div className="bg-background-950 p-6 text-background-50 sm:p-8">
                <span className="text-xs text-background-300">Indicative result</span>
                <h2 className="mt-3 font-heading text-xl font-semibold text-primary-300 sm:text-2xl">
                  {result.grade}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-background-300 sm:text-base">
                  {result.copy}
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={restartQuiz}
                    className="btn-primary inline-flex min-h-12 items-center justify-center px-5"
                  >
                    Retake guide
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex min-h-12 items-center justify-center border border-background-500 px-5 text-sm font-semibold text-background-50 transition-colors hover:border-primary-400 hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background-950 motion-reduce:transition-none"
                  >
                    Done
                  </button>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-foreground-500">
                This guide is indicative only. Final recognition depends on the evidence submitted and IPC review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
