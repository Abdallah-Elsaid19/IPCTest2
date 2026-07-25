import { Link } from "react-router-dom";

const routes = [
  ["Membership and professional recognition", "/membership"],
  ["London Master Class Series", "/events"],
  ["Awards and prizes", "/awards"],
  ["Regional clubs", "/clubs"],
  ["Publications and research", "/publications"],
  ["Employer and academic partnerships", "/partnerships"],
];

export default function CredibilityStrip() {
  return (
    <nav aria-label="Explore IPC opportunities" className="border-y border-background-800 bg-background-950">
      <div className="container-content grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {routes.map(([label, path]) => (
          <Link key={path} to={path} className="flex min-h-20 items-center border-b border-background-800 px-4 py-4 text-xs font-semibold leading-relaxed text-background-300 transition hover:bg-background-900 hover:text-primary-400 sm:border-r xl:border-b-0">
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
