import { Link } from "react-router-dom";
import { informationSessionPath } from "./constants";
import { useManagedSection } from "@/components/content/ManagedContentProvider";

export default function ScholarshipEnquiryCta() {
  const content = useManagedSection("final_cta", { title: "A clear first step without an unnecessary application portal.", description: "Scholarship enquiries can begin by email so IPC can understand the proposed route, learner group, intended outcome and current programme availability.", cta_label: "Start scholarship enquiry", cta_url: informationSessionPath });
  return (
    <section className="bg-background-950 py-20 md:py-28">
      <div className="container-content">
        <div className="reveal mx-auto max-w-2xl text-center">
          <h2 className="mb-4 font-heading text-2xl font-semibold text-background-50 md:text-3xl">
            {content.title}
          </h2>
          <p className="mb-8 text-background-300">
            {content.description}
          </p>
          <Link to={content.cta_url} className="btn-primary inline-flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600">
              <i className="ri-mail-line text-sm text-background-50" aria-hidden="true" />
            </span>
            {content.cta_label}
          </Link>
        </div>
      </div>
    </section>
  );
}
