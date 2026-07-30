export interface NavigationLink {
  label: string;
  path: string;
}

export interface NavigationGroup {
  label: string;
  path?: string;
  children?: NavigationLink[];
}

export const navigation: NavigationGroup[] = [
  { label: "Home", path: "/home" },
  { label: "Membership", path: "/membership" },
  { label: "Scholarships", path: "/scholarships" },
  { label: "Sponsorship", path: "/sponsorship" },
  { label: "Events", path: "/events" },
  { label: "Clubs", path: "/clubs" },
  { label: "Awards", path: "/awards" },
  // { label: "Fund", path: "/fund" },
  { label: "Publications", path: "/publications" },
  { label: "Services", path: "/services" },
  { label: "About", path: "/about" },
];

export const footerNavigation = [
  {
    label: "Institute",
    links: [
      // { label: "Home", path: "/home" },
      { label: "About IPC", path: "/about" },
      // { label: "Employers", path: "/employers" },
      // { label: "Partnerships", path: "/partnerships" },
      { label: "Contact", path: "/contact" },
    ],
  },
  {
    label: "Professional Routes",
    links: [
      { label: "Membership & Recognition", path: "/membership" },
      { label: "Events & Master Classes", path: "/events" },
      { label: "Regional Clubs", path: "/clubs" },
      { label: "Professional Services", path: "/services" },
      { label: "Awards & Prizes", path: "/awards" },
    ],
  },
  {
    label: "Impact & Resources",
    links: [
      { label: "Scholarships & Bursaries", path: "/scholarships" },
      { label: "Apply for a Bursary", path: "/bursary-scholarship-application" },
      { label: "Sponsorship", path: "/sponsorship" },
      // { label: "Funded Opportunities", path: "/fund" },
      { label: "Publications & Research", path: "/publications" },
      { label: "Privacy & Policies", path: "/privacy" },
    ],
  },
] satisfies Array<{ label: string; links: NavigationLink[] }>;

export function isNavigationPathActive(currentPath: string, path: string): boolean {
  return currentPath === path || (path !== "/home" && currentPath.startsWith(`${path}/`));
}

export function isNavigationGroupActive(currentPath: string, item: NavigationGroup): boolean {
  return item.path
    ? isNavigationPathActive(currentPath, item.path)
    : Boolean(item.children?.some((child) => isNavigationPathActive(currentPath, child.path)));
}
