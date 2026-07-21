import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

interface MembershipGateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MembershipGateModal({ isOpen, onClose }: MembershipGateModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/70 px-5 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="alertdialog" aria-modal="true" aria-labelledby="membership-gate-title" aria-describedby="membership-gate-description" className="w-full max-w-md border border-primary-500/40 bg-background-50 p-7 shadow-[0_28px_90px_rgba(0,0,0,0.55)] md:p-9">
        <div className="flex items-start justify-between gap-6">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary-500 text-background-950"><i className="ri-lock-2-line text-xl" aria-hidden="true" /></span>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-background-300 text-background-950 hover:border-primary-500" aria-label="Close membership message"><i className="ri-close-line" aria-hidden="true" /></button>
        </div>
        <span className="eyebrow mt-7 block text-primary-700">IPC Membership Required</span>
        <h2 id="membership-gate-title" className="mt-3 font-heading text-2xl font-semibold text-background-950">This club opportunity is for IPC members.</h2>
        <p id="membership-gate-description" className="mt-4 text-sm leading-relaxed text-foreground-600">Join IPC to register for regional activity, volunteer, speak, mentor or connect with club partners.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link to="/membership" onClick={onClose} className="btn-primary min-h-12 flex-1">Explore memberships</Link>
          <button type="button" onClick={onClose} className="min-h-12 flex-1 border border-background-300 px-5 text-sm font-semibold text-background-950 hover:border-primary-500">Maybe later</button>
        </div>
      </section>
    </div>
  );
}
