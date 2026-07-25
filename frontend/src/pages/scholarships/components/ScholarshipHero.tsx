import { Link } from "react-router-dom";
import { informationSessionPath } from "./constants";
import { useManagedSection } from "@/components/content/ManagedContentProvider";

export default function ScholarshipHero() {
  const content = useManagedSection("hero", { eyebrow: "Scholarships, bursaries and access pathways", title: "Talent should not be limited by access.", description: "IPC scholarship and bursary pathways connect eligible learners, career changers, returners and public-service professionals with learning, membership, mentoring, events, community and credible professional progression.", cta_label: "Start a scholarship enquiry", cta_url: informationSessionPath, image_url: "https://readdy.ai/api/search-image?query=Warm%20abstract%20educational%20institutional%20environment%20with%20soft%20natural%20lighting%2C%20subtle%20geometric%20patterns%20warm%20ivory%20and%20gold%20tones%20professional%20academic%20atmosphere%20minimal%20clean%20aesthetic%20premium%20editorial%20quality%20no%20people&width=1600&height=900&seq=ipc-scholarship-hero&orientation=landscape", image_alt: "Scholarship and professional development pathway" });
  return (
    <section className="relative flex min-h-[60vh] items-center bg-background-100 md:min-h-[70vh]">
      <div className="absolute inset-0">
        <img
          loading="eager"
          fetchPriority="high"
          decoding="async"
          src={content.image_url}
          alt={content.image_alt}
          className="h-full w-full object-cover opacity-20"
        />
      </div>
      <div className="container-content relative z-10 w-full pt-24 md:pt-32">
        <div className="max-w-3xl reveal">
          <span className="eyebrow mb-4 block text-primary-600">{content.eyebrow}</span>
          <h1 className="mb-6 font-heading text-4xl font-bold leading-[1.1] text-background-950 sm:text-5xl md:text-6xl">
            {content.title}
          </h1>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-foreground-600 md:text-lg">
            {content.description}
          </p>
          <Link to={content.cta_url} className="btn-primary inline-flex items-center gap-2">
            <i className="ri-mail-line" aria-hidden="true" />
            {content.cta_label}
          </Link>
        </div>
      </div>
    </section>
  );
}
