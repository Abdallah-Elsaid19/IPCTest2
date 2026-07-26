import {
  isManagedItemActive,
  useManagedSection,
} from "@/components/content/ManagedContentProvider";

const impactItems = [
  { title: "Up to 40 places", description: "Up to 40 awards may be available per intake, subject to funding, eligibility, programme capacity and final approval." },
  { title: "10 inclusive routes", description: "Categories recognise need, service, transition, social impact and professional potential." },
  { title: "Email application", description: "A straightforward launch-phase process that allows applicants to explain their circumstances personally." },
  { title: "Beyond tuition", description: "Support may include membership, events, mentoring, recognition and professional development." },
];

export default function ScholarshipPrinciplesGrid() {
  const content = useManagedSection("principles", { items: impactItems });
  const items = content.items.filter(isManagedItemActive);

  return (
    <section aria-label="Scholarship impact routes" className="border-b border-background-300 bg-background-50">
      <div className="container-content py-10 md:py-12">
        <dl className="grid border-l border-t border-background-300 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, index) => (
            <div key={item.title} className="group relative min-h-44 border-b border-r border-background-300 p-5 transition-colors hover:bg-background-100 md:p-6">
              <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-primary-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              <dt className="mt-8 font-heading text-base font-semibold text-background-950">
                {item.title}
              </dt>
              <dd className="mt-3 text-sm leading-relaxed text-foreground-600">
                {item.description}
              </dd>
              <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary-500 transition-transform group-hover:scale-x-100" aria-hidden="true" />
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
