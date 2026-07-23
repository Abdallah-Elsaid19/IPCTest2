import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const steps = [
  ["Identify the objective", "Clarify whether the priority is recognition, capability, learning, academic engagement, community or impact."],
  ["Select the route", "Choose the service and define the individual, workforce, learner or partner audience."],
  ["Provide context", "Share the role, organisation, current position and intended outcome."],
  ["IPC reviews", "The Institute considers suitability, scope, evidence and the most appropriate pathway."],
  ["Agree next steps", "Receive a recommended route, evidence request or partnership conversation."],
];

export default function ServicesJourney() {
  const section = useManagedSection("journey", {
    eyebrow: "Professional service journey",
    title: "Simple to enter. Structured enough to be credible.",
    description: "The first website version can use a direct email-based process while keeping the experience clear and professional.",
    items: steps.map(([title, description]) => ({title, description})),
  });
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow={section.eyebrow} title={section.title} subtitle={section.description} centered /></div>
        <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5 md:mt-16">
          {section.items.filter(isManagedItemActive).map(({title, description}, index) => (
            <li key={title} className="reveal min-h-64 border border-background-200/80 border-t-[3px] border-t-primary-500 bg-background-50 p-6"><span className="font-mono text-xs font-bold text-primary-700">{String(index + 1).padStart(2, "0")}</span><h3 className="mt-10 text-lg font-semibold text-background-950">{title}</h3><p className="mt-3 text-sm leading-relaxed text-foreground-600">{description}</p></li>
          ))}
        </ol>
      </div>
    </section>
  );
}
