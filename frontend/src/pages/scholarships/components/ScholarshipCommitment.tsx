import { useManagedSection } from "@/components/content/ManagedContentProvider";

export default function ScholarshipCommitment() {
  const content = useManagedSection("commitment", { eyebrow: "Why scholarships matter", title: "Build a stronger and more inclusive project-controls talent pipeline.", description: "Access support is most valuable when it creates professional connection, practical development and a credible route to progression. IPC scholarships are intended to connect people with learning, events, mentoring, community, research and employer engagement—not simply provide a one-off award without direction." });
  return (
    <section className="bg-accent-500 section-padding">
      <div className="container-content">
        <div className="reveal mx-auto max-w-4xl text-center">
          <span className="eyebrow mb-4 block text-background-50/70">{content.eyebrow}</span>
          <h2 className="mb-6 font-heading text-3xl font-bold text-background-50 md:text-4xl">
            {content.title}
          </h2>
          <p className="text-base leading-relaxed text-background-100 md:text-lg">{content.description}</p>
        </div>
      </div>
    </section>
  );
}
