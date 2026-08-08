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
      { label: "About IPC", path: "/about" },
      { label: "Our Purpose", path: "/about#scene-who" },
      { label: "Vision", path: "/about#scene-vision" },
      { label: "Mission", path: "/about#scene-mission" },
      { label: "Core Values", path: "/about#scene-values" },
    ],
  },
  {
    label: "Memberships",
    links: [
      { label: "Membership Overview", path: "/membership" },
      { label: "Membership Benefits", path: "/membership#membership-benefits" },
      { label: "Affiliate", path: "/membership/affiliate" },
      { label: "Professional Member", path: "/membership/professional" },
      { label: "Associate Fellow L3", path: "/membership/associate-fellow-l3" },
      { label: "Associate Fellow L4", path: "/membership/associate-fellow-l4" },
      { label: "Fellow", path: "/membership/fellow" },
    ],
  },
  {
    label: "Community",
    links: [
      { label: "Events", path: "/events" },
      { label: "Regional Clubs", path: "/clubs" },
      { label: "Awards & Prizes", path: "/awards" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Publications", path: "/publications" },
      { label: "Professional Services", path: "/services" },
      { label: "Services Catalogue", path: "/services#service-catalogue" },
      { label: "Capability Review", path: "/services#capability-review" },
      { label: "Information Session", path: "/information-session" },
    ],
  },
  {
    label: "Scholarships & Bursaries",
    links: [
      { label: "Scholarships & Bursaries", path: "/scholarships" },
      { label: "Apply for a Bursary", path: "/bursary-scholarship-application" },
      { label: "Programme Modules", path: "/scholarships#modules" },
      { label: "Announcement", path: "/scholarships/announcement" },
    ],
  },
  {
    label: "Partner with IPC",
    links: [
      { label: "Sponsorship", path: "/sponsorship" },
      { label: "Discuss a Partnership", path: "/information-session" },
    ],
  },
  {
    label: "Support",
    links: [
      { label: "Contact Support", path: "/contact" },
      { label: "Privacy & Policies", path: "/privacy" },
      { label: "Account Sign In", path: "/login" },
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
