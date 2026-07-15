import { Link } from "react-router-dom";
import { SimpleInterestForm } from "@/components/forms/SimpleInterestForm";

const footerNav = [
  { label: "Home", path: "/" },
  { label: "Membership & Recognition", path: "/membership" },
  { label: "Scholarships", path: "/scholarships" },
  { label: "Sponsorship", path: "/sponsorship" },
  { label: "Awards & Prizes", path: "/awards" },
  { label: "Events", path: "/events" },
  { label: "Clubs", path: "/clubs" },
  { label: "About Us", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Privacy & Policies", path: "/privacy" },
];

export default function Footer() {
  return (
    <footer className="bg-background-950 border-t border-background-800">
      <div className="container-content py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          <div className="md:col-span-4">
            <h3 className="font-heading text-xl font-semibold text-background-50 mb-4">
              Institute of Project Controls
            </h3>
            <p className="text-sm text-primary-400 font-medium mb-8 leading-relaxed">
              Recognition. Competence. Community. Career progress.
            </p>
            <address className="not-italic text-sm text-background-400 leading-[1.8]">
              39 Maidstone Innovation Centre<br />
              Maidstone, Kent<br />
              ME14 5FY
            </address>
            <a
              href="mailto:office@instituteofprojectcontrols.org"
              className="text-sm text-background-400 hover:text-background-200 transition-colors mt-4 inline-block"
            >
              office@instituteofprojectcontrols.org
            </a>
            <div className="mt-8 max-w-sm">
              <p className="text-xs font-semibold text-background-500 uppercase tracking-wider mb-3">Newsletter and magazine</p>
              <SimpleInterestForm type="newsletter" />
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-6">
            <h4 className="text-xs font-semibold text-background-500 uppercase tracking-wider mb-4">
              Institute
            </h4>
            <ul className="flex flex-col gap-2">
              {footerNav.slice(0, 3).map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm text-background-400 hover:text-background-200 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-background-500 uppercase tracking-wider mb-4">
              Programmes
            </h4>
            <ul className="flex flex-col gap-2">
              {footerNav.slice(3, 7).map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm text-background-400 hover:text-background-200 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-xs font-semibold text-background-500 uppercase tracking-wider mb-4">
              Information
            </h4>
            <ul className="flex flex-col gap-2">
              {footerNav.slice(7).map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className="text-sm text-background-400 hover:text-background-200 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 md:mt-16 pt-8 border-t border-background-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-xs text-background-500 leading-relaxed max-w-xl">
              IPC recognition is a professional membership and recognition pathway. It should be described as standards-informed and evidence-based. It should not be presented as a regulated qualification, apprenticeship award, chartered status or statutory licence unless the applicant separately holds such recognition or authority.
            </p>
            <p className="text-xs text-background-600 shrink-0">
              &copy; {new Date().getFullYear()} Institute of Project Controls. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

