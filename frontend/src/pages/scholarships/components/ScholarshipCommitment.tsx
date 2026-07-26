import { useManagedSection } from "@/components/content/ManagedContentProvider";

export default function ScholarshipCommitment() {
  const content = useManagedSection("commitment", {
    eyebrow: "The Purpose of the Fund",
    title: "Creating access for people who can benefit from professional opportunity.",
    description:
      "A scholarship programme should not only reward people who have already had the greatest access to education, employment and professional networks. The Institute wants to identify people who may have the character, commitment and potential to succeed, but who face financial, professional, social or personal barriers.",
    secondary_description:
      "Applicants may come from engineering, construction, commercial management, administration, finance, public service, the armed forces, charity leadership, community work, consultancy, self-employment, communications or completely different sectors. The purpose of the scheme is to help suitable people move towards a recognised and valuable project controls career.",
    callout:
      "Lack of project controls knowledge should not be used as a reason to reject a strong applicant. The Institute should consider what the person could become with access to structured learning, professional membership, mentoring, events and an employer-connected community.",
  });

  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="reveal lg:col-span-5">
          <span className="eyebrow text-primary-700">{content.eyebrow}</span>
          <h2 className="mt-5 font-heading text-4xl font-semibold leading-tight text-background-950 md:text-5xl">
            {content.title}
          </h2>
        </div>
        <div className="reveal lg:col-span-7">
          <div className="space-y-5 text-base leading-[1.8] text-foreground-600 md:text-lg">
            <p>{content.description}</p>
            <p>{content.secondary_description}</p>
          </div>
          <blockquote className="mt-8 border-l-2 border-primary-500 bg-background-100 p-6 font-heading text-lg font-semibold leading-relaxed text-background-950 md:p-8 md:text-xl">
            {content.callout}
          </blockquote>
        </div>
      </div>
    </section>
  );
}
