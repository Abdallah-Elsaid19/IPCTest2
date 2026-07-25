import { Link } from "react-router-dom";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const fallback = {
  eyebrow: "Individual and philanthropic support",
  title: "Support a defined professional or social outcome.",
  description: "Individuals, foundations and organisations may enquire about responsible support. No payment, tax treatment or fixed contribution is implied by this enquiry route.",
  items: [
    { id: "scholarship", title: "A scholarship place or cohort" },
    { id: "masterclass", title: "London Master Class learner access" },
    { id: "mentoring", title: "Mentoring or travel support" },
    { id: "regional", title: "Regional skills activity" },
    { id: "awards", title: "Awards and prizes" },
    { id: "research", title: "Applied research and publications" },
  ],
  cta_label: "Discuss responsible support",
  cta_url: "/information-session",
  notice: "Each route is confirmed individually in writing and must protect professional, judging and editorial independence.",
};

export default function ContributeIndividualSupport() {
  const content = useManagedSection("individual_support", fallback);
  const items = content.items.filter(isManagedItemActive);
  return (
    <section className="bg-background-950 section-padding">
      <div className="container-content grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="eyebrow text-primary-400">{content.eyebrow}</span>
          <h2 className="mt-5 font-heading text-4xl font-bold text-background-50">{content.title}</h2>
          <p className="mt-5 leading-relaxed text-background-400">{content.description}</p>
          <Link to={content.cta_url} className="btn-primary mt-8 inline-flex">{content.cta_label}</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-6 lg:col-start-7">
          {items.map((item) => <div key={item.id} className="border border-background-800 bg-background-900 p-5 text-sm font-semibold text-background-200"><i className="ri-hand-heart-line mr-3 text-primary-400" />{item.title}</div>)}
          <p className="mt-3 text-xs leading-relaxed text-background-500 sm:col-span-2">{content.notice}</p>
        </div>
      </div>
    </section>
  );
}
