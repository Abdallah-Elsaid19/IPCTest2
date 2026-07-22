import { Link } from "react-router-dom";

export default function ServicesFinalCta() {
  return (
    <section className="bg-background-50 pb-20 md:pb-28">
      <div className="container-content">
        <div className="reveal grid items-end gap-8 bg-accent-700 p-7 text-background-50 md:p-12 lg:grid-cols-[1fr_auto] lg:p-16">
          <div><span className="eyebrow text-primary-300">Start the right conversation</span><h2 className="mt-4 max-w-3xl font-heading text-3xl font-semibold leading-tight md:text-5xl">Choose a service. Define the outcome. Build professional capability.</h2><p className="mt-5 max-w-2xl text-sm leading-relaxed text-background-200 md:text-base">Share your role or organisation, main objective, preferred pathway and intended result.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link to="/information-session" state={{ enquiry: "Professional Services Enquiry" }} className="btn-primary">
              Start service enquiry
            </Link>
            <a href="#services" className="btn-secondary">
              Explore portfolio
            </a>
          </div>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-foreground-500">IPC recognition does not replace competence, evidence or ethical conduct and should not be represented as a regulated qualification, chartered status or statutory licence.</p>
      </div>
    </section>
  );
}
