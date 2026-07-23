import { useState } from "react";
import SectionHeader from "@/components/base/SectionHeader";
import { isManagedItemActive, useManagedSection } from "@/components/content/ManagedContentProvider";

const faqs = [
  ["What services does IPC provide?", "Professional membership and recognition, workforce capability pathways, CPD and events, regional clubs, mentoring, academic partnerships, scholarships, awards, publications and sponsorship routes."],
  ["Does IPC provide project-delivery consultancy?", "The catalogue establishes professional membership, recognition, development and partnership services. It does not define a commercial consulting service for delivering client project controls."],
  ["Are prices published?", "No. The catalogue contains no prices or fee schedules. Enquiries should explain the intended route and outcome."],
  ["Can employers use IPC grades for development?", "Yes. The framework can support capability mapping, recruitment clarity, development plans, succession planning, tender profiles and staff recognition."],
  ["Can academic partners connect students to IPC?", "Yes. Routes can include student affiliation, scholarships, awards, guest lectures, applied research, journal papers and employer engagement."],
  ["Is IPC recognition a qualification or chartered status?", "No. It is standards-informed, evidence-based professional recognition, not a regulated qualification, apprenticeship award, chartered status or statutory licence."],
];

export default function ServicesFaq() {
  const [open, setOpen] = useState<number | null>(0);
  const section = useManagedSection("faq", {
    eyebrow: "Service questions",
    title: "Clear guidance before making an enquiry.",
    description: "Understand scope, pricing, recognition and organisational services.",
    items: faqs.map(([question, answer]) => ({question, answer})),
  });
  return (
    <section className="bg-background-100 section-padding">
      <div className="container-content grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div className="reveal"><SectionHeader eyebrow={section.eyebrow} title={section.title} subtitle={section.description} /></div>
        <div className="reveal space-y-3">{section.items.filter(isManagedItemActive).map(({question, answer}, index) => { const expanded = open === index; return <article key={question} className="border border-background-200/80 bg-background-50"><h3><button type="button" aria-expanded={expanded} aria-controls={`service-faq-${index}`} onClick={() => setOpen(expanded ? null : index)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-sm font-semibold text-background-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 md:text-base"><span>{question}</span><i className={`${expanded ? "ri-subtract-line" : "ri-add-line"} shrink-0 text-primary-700`} aria-hidden="true" /></button></h3>{expanded && <div id={`service-faq-${index}`} className="px-5 pb-5"><p className="text-sm leading-relaxed text-foreground-600">{answer}</p></div>}</article>; })}</div>
      </div>
    </section>
  );
}
