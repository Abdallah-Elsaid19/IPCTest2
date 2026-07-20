const dividerClasses = [
  "",
  "border-t border-background-200 sm:border-l sm:border-t-0",
  "border-t border-background-200 lg:border-l lg:border-t-0",
  "border-t border-background-200 sm:border-l lg:border-t-0",
];
const principles = [
  {
    title: "Professional recognition",
    description: "Structured grades and visible professional standing.",
  },
  {
    title: "Competence based",
    description: "Evidence, judgement, responsibility and influence.",
  },
  {
    title: "Responsible technology",
    description: "Digital insight with human accountability.",
  },
  {
    title: "Public value",
    description: "Performance, safety, sustainability and carbon.",
  },
];


export default function InstitutionAuthority() {
  return (
    <section
      aria-label="IPC professional principles"
      className="border-b border-background-200 bg-background-50"
    >
      <div className="mx-auto grid max-w-[1600px] sm:grid-cols-2 lg:grid-cols-4">
        {principles.map((principle, index) => (
          <article
            key={principle.title}
            className={`min-h-[166px] px-8 py-9 md:px-10 lg:px-12 ${dividerClasses[index]}`}
          >
            <h2 className="font-heading text-lg font-bold text-primary-700">
              {principle.title}
            </h2>
            <p className="mt-2 max-w-xs text-[15px]  text-foreground-600">
              {principle.description}
            </p>
          </article>
        ))}
    </div>
    </section>
  );
}