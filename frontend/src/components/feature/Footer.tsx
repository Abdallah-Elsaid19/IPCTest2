import { Link } from "react-router-dom";

import { SimpleInterestForm } from "@/components/forms/SimpleInterestForm";
import { footerNavigation } from "@/config/navigation";

const footerLogoUrl =
  "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/e02c630d912045a286f5e144186827e6.webp";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-primary-500/25 bg-[#0B0B0B] text-background-50">
      <div className="relative mx-auto w-full max-w-[1540px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-x-0 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-[1.65fr_repeat(7,minmax(0,1fr))]">
          <section className="pr-5 xl:pr-8" aria-labelledby="footer-brand-title">
            <Link to="/home" className="inline-flex flex-col items-start gap-3" aria-label="Institute of Project Controls home">
              <img
                src={footerLogoUrl}
                alt=""
                width={112}
                height={112}
                className="h-28 w-28 shrink-0 object-contain"
              />
              <span>
                <strong id="footer-brand-title" className="block bg-gradient-to-r from-[#F8E0AA] via-[#D89524] to-[#9D5E0B] bg-clip-text font-heading text-base font-semibold uppercase leading-tight tracking-[0.08em] text-transparent">
                  Institute of<br />Project Controls
                </strong>
                <span className="mt-2 block text-xs font-medium text-primary-400">
                  Excellence. Impact. Legacy.
                </span>
              </span>
            </Link>

            <div className="mt-6 flex items-center gap-2.5" aria-label="IPC social links">
              <a
                href="https://www.linkedin.com/company/institute-of-project-controls/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-background-400/60 text-lg text-background-100 transition-all hover:-translate-y-0.5 hover:border-primary-400 hover:bg-primary-500 hover:text-background-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                aria-label="Institute of Project Controls on LinkedIn (opens in a new tab)"
              >
                <i className="ri-linkedin-fill" aria-hidden="true" />
              </a>
            </div>
          </section>

          {footerNavigation.map((group, index) => {
            const headingId = `footer-group-${index}`;
            return (
              <nav
                key={group.label}
                aria-labelledby={headingId}
                className="border-t border-white/10 pt-6 sm:border-t-0 sm:px-5 sm:pt-0 xl:px-4"
              >
                <h2
                  id={headingId}
                  className="font-mono text-[10px] font-bold uppercase leading-[1.35] tracking-[0.08em] text-primary-400"
                >
                  {group.label}
                </h2>
                <ul className="mt-6 flex flex-col gap-2.5">
                  {group.links.map((item) => (
                    <li key={`${item.label}-${item.path}`}>
                      <Link
                        to={item.path}
                        className="inline-block text-[11px] leading-[1.45] text-background-300 transition-colors hover:text-primary-300"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        {/* <div className="mt-12 grid items-center gap-5 border-y border-primary-500/25 bg-white/[0.025] px-5 py-5 lg:grid-cols-[minmax(0,.8fr)_minmax(24rem,1.2fr)] lg:px-7">
          <div>
            <p className="font-heading text-base font-semibold text-white">IPC newsletter &amp; magazine</p>
            <p className="mt-1 text-xs leading-relaxed text-background-500">Receive professional updates, publications and opportunities.</p>
          </div>
          <div className="w-full lg:justify-self-end">
            <SimpleInterestForm type="newsletter" />
          </div>
        </div> */}

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-[11px] leading-relaxed text-primary-300">
            &copy; {new Date().getFullYear()} Institute of Project Controls. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:justify-end">
            <a href="mailto:office@instituteofprojectcontrols.org" className="text-[11px] text-primary-300 transition-colors hover:text-primary-200">
              office@instituteofprojectcontrols.org
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
