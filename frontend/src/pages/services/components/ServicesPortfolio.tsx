import { useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "@/components/base/SectionHeader";
import { serviceRoutes, type ServiceRoute } from "./data";

export default function ServicesPortfolio() {
  const [activeId, setActiveId] = useState<ServiceRoute["id"]>("recognition");
  const active = serviceRoutes.find((service) => service.id === activeId) ?? serviceRoutes[0];

  return (
    <section id="services" className="scroll-mt-16 bg-background-100 section-padding">
      <div className="container-content">
        <div className="reveal"><SectionHeader eyebrow="Service portfolio" title="Choose the pathway that matches your objective." subtitle="Select a service to understand its audience, value and next step." centered /></div>
        <div className="reveal mt-12 border border-background-200/80 bg-background-50 md:mt-16">
          <div role="tablist" aria-label="Professional services" className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {serviceRoutes.map((service) => {
              const selected = service.id === active.id;
              return (
                <button key={service.id} id={`service-tab-${service.id}`} type="button" role="tab" aria-selected={selected} aria-controls="service-panel" onClick={() => setActiveId(service.id)} className={`min-h-24 border-b border-background-200/80 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 xl:border-b-0 xl:border-r ${selected ? "bg-background-950 text-background-50" : "hover:bg-background-100"}`}>
                  <strong className={`block text-sm ${selected ? "text-primary-300" : "text-primary-700"}`}>{service.tab}</strong>
                  <span className={`mt-1 block text-xs ${selected ? "text-background-400" : "text-foreground-500"}`}>{service.tabDescription}</span>
                </button>
              );
            })}
          </div>
          <div id="service-panel" role="tabpanel" aria-labelledby={`service-tab-${active.id}`} className="grid lg:grid-cols-[1.16fr_0.84fr]">
            <div className="p-6 md:p-9 lg:p-10">
              <span className="eyebrow text-primary-700">{active.eyebrow}</span>
              <h3 className="mt-3 max-w-3xl font-heading text-2xl font-semibold text-background-950 md:text-3xl">{active.title}</h3>
              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground-600 md:text-base">{active.description}</p>
              <dl className="mt-8 grid gap-3 md:grid-cols-3">
                {[["Best for", active.audience], ["Core value", active.value], ["Next step", active.nextStep]].map(([label, value]) => (
                  <div key={label} className="border border-background-200/70 bg-background-100 p-4"><dt className="text-xs font-bold uppercase tracking-wider text-primary-700">{label}</dt><dd className="mt-2 text-sm leading-relaxed text-foreground-600">{value}</dd></div>
                ))}
              </dl>
            </div>
            <aside className="flex flex-col justify-between bg-background-950 p-6 text-background-50 md:p-9 lg:p-10">
              <div><span className="eyebrow text-primary-300">Service enquiry</span><h3 className="mt-3 text-xl font-semibold">{active.enquiryTitle}</h3><p className="mt-4 text-sm leading-relaxed text-background-300">{active.enquiryDescription}</p><p className="mt-6 border border-background-50/15 bg-background-50/5 p-4 text-xs leading-relaxed text-background-400">{active.note}</p></div>
              <Link
                to="/information-session"
                state={{ enquiry: active.enquiryTitle, service: active.tab }}
                className="btn-primary mt-8 w-fit"
              >
                {active.cta} <i className="ri-arrow-right-line" aria-hidden="true" />
              </Link>
            </aside>
          </div>
        </div>
        <p className="mt-5 border-l-2 border-primary-500 pl-4 text-xs leading-relaxed text-foreground-500">IPC provides professional membership, recognition, development and partnership services. The catalogue does not establish a commercial project-delivery consultancy service or publish prices and fee schedules.</p>
      </div>
    </section>
  );
}
