import { useState } from "react";
import type { AwardPageContent } from "../types";

export default function AwardsFaq({ content }: { content: AwardPageContent["faq"] }) {
  const [openQuestion, setOpenQuestion] = useState(0);
  if (content.is_active === false) return null;
  const questions = content.items.filter((item) => item.is_active !== false);
  return (
    <section className="bg-background-50 section-padding">
      <div className="container-content grid gap-12 lg:grid-cols-12">
        <div className="reveal lg:col-span-5"><span className="eyebrow mb-4 block text-primary-600">{content.eyebrow}</span><h2 className="font-heading text-4xl font-semibold leading-tight text-background-950 md:text-5xl">{content.title}</h2><p className="mt-6 max-w-lg leading-relaxed text-foreground-600">{content.description}</p></div>
        <div className="space-y-3 lg:col-span-7">{questions.map(({ question, answer }, index) => { const isOpen = openQuestion === index; return <article key={question} className="border border-background-300 bg-background-50"><button type="button" onClick={() => setOpenQuestion(isOpen ? -1 : index)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-5 p-5 text-left font-semibold text-background-950"><span>{question}</span><span className="text-primary-600" aria-hidden="true">{isOpen ? "−" : "+"}</span></button>{isOpen && <p className="px-5 pb-5 text-sm leading-relaxed text-foreground-600">{answer}</p>}</article>; })}</div>
      </div>
    </section>
  );
}
