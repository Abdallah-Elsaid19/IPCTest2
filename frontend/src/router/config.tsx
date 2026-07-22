import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";
import { GuestOnlyRoute, ProtectedRoute } from "@/features/auth/ProtectedRoute";

const NotFound = lazy(() => import("../pages/NotFound"));
const LandingPage = lazy(() => import("../pages/landing/page"));
const Home = lazy(() => import("../pages/home/page"));
const Membership = lazy(() => import("../pages/membership/page"));
const AffiliateGradePage = lazy(() => import("../pages/membership/grades/affiliate/page"));
const ProfessionalGradePage = lazy(() => import("../pages/membership/grades/professional/page"));
const AssociateFellowL3GradePage = lazy(() => import("../pages/membership/grades/associate-fellow-l3/page"));
const AssociateFellowL4GradePage = lazy(() => import("../pages/membership/grades/associate-fellow-l4/page"));
const FellowGradePage = lazy(() => import("../pages/membership/grades/fellow/page"));
const MembershipApplicationPage = lazy(() => import("../pages/membership/apply/page"));
const Scholarships = lazy(() => import("../pages/scholarships/page"));
const Sponsorship = lazy(() => import("../pages/sponsorship/page"));
const Services = lazy(() => import("../pages/services/page"));
const Contribute = lazy(() => import("../pages/contribute/page"));
const BookingPage = lazy(() => import("../pages/BookingPage"));
const Awards = lazy(() => import("../pages/awards/page"));
const Events = lazy(() => import("../pages/events/page"));
const EventDetailPage = lazy(() => import("@/features/events/registration/EventDetailPage"));
const RegistrationPage = lazy(() => import("@/features/events/registration/RegistrationPage"));
const RegistrationDetailsPage = lazy(() => import("@/features/events/registration/RegistrationDetailsPage"));
const RegistrationCalendarRedirect = lazy(() =>
  import("@/features/events/registration/RegistrationDetailsPage").then((module) => ({
    default: module.RegistrationCalendarRedirect,
  })),
);
const Clubs = lazy(() => import("../pages/clubs/page"));
const About = lazy(() => import("../pages/about/page"));
const Contact = lazy(() => import("../pages/contact/page"));
const Privacy = lazy(() => import("../pages/privacy/page"));
const AdminApplicationsPage = lazy(() => import("@/features/admin/applications/page"));
const AdminApplicationDetailsPage = lazy(() => import("@/features/admin/applications/details/page"));
const AdminEnquiriesPage = lazy(() => import("@/features/admin/enquiries/page"));
const AdminEventsPage = lazy(() => import("@/features/admin/events/page"));
const AdminAwardsPage = lazy(() => import("@/features/admin/awards/page"));
const AdminMembershipGradesPage = lazy(() => import("@/features/admin/membership-grades/page"));
const AdminContentPage = lazy(() => import("@/features/admin/content/page"));
const AdminEventDetailsPage = lazy(() => import("@/features/admin/events/details/page"));
const AdminLayout = lazy(() => import("@/features/admin/layouts/AdminLayout"));
const AdminOverviewPage = lazy(() => import("@/features/admin/overview/page"));
const AdminProfilePage = lazy(() => import("@/features/admin/profile/page"));
const AdminUsersPage = lazy(() => import("@/features/admin/users/page"));
const AdminUserDetailsPage = lazy(() => import("@/features/admin/users/details/page"));
const Login = lazy(() => import("@/features/auth/login/Login"));
const PasswordResetPage = lazy(() => import("@/features/auth/password-reset/page"));
const ForgotPasswordPage = lazy(() => import("@/features/auth/forgot-password/page"));
const UserProfilePage = lazy(() => import("@/features/profile/page"));

const routes: RouteObject[] = [
  { path: "/", element: <LandingPage /> },
  { path: "/home", element: <Home /> },
  { path: "/membership", element: <Membership /> },
  { path: "/membership/affiliate", element: <AffiliateGradePage /> },
  { path: "/membership/professional", element: <ProfessionalGradePage /> },
  { path: "/membership/associate-fellow-l3", element: <AssociateFellowL3GradePage /> },
  { path: "/membership/associate-fellow-l4", element: <AssociateFellowL4GradePage /> },
  { path: "/membership/fellow", element: <FellowGradePage /> },
  { path: "/membership/:grade/apply", element: <MembershipApplicationPage /> },
  { path: "/scholarships", element: <Scholarships /> },
  { path: "/sponsorship", element: <Sponsorship /> },
  { path: "/services", element: <Services /> },
  { path: "/fund", element: <Contribute /> },
  { path: "/contribute", element: <Navigate to="/fund" replace /> },
  { path: "/booking", element: <BookingPage /> },
  { path: "/information-session", element: <BookingPage /> },
  { path: "/awards", element: <Awards /> },
  { path: "/events", element: <Events /> },
  { path: "/events/registration/:reference/confirmed", element: <RegistrationDetailsPage confirmed /> },
  { path: "/events/registration/:reference/calendar", element: <RegistrationCalendarRedirect /> },
  { path: "/events/registration/:reference", element: <RegistrationDetailsPage /> },
  { path: "/events/:slug/register", element: <RegistrationPage /> },
  { path: "/events/:slug", element: <EventDetailPage /> },
  { path: "/clubs", element: <Clubs /> },
  { path: "/about", element: <About /> },
  { path: "/login", element: <GuestOnlyRoute><Login /></GuestOnlyRoute> },
  { path: "/forgot-password", element: <GuestOnlyRoute><ForgotPasswordPage /></GuestOnlyRoute> },
  { path: "/reset-password", element: <PasswordResetPage /> },
  { path: "/profile", element: <ProtectedRoute><UserProfilePage /></ProtectedRoute> },
  { path: "/contact", element: <Contact /> },
  { path: "/privacy", element: <Privacy /> },
  {
    path: "/admin",
    element: <ProtectedRoute requireStaff><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminOverviewPage /> },
      { path: "applications", element: <AdminApplicationsPage /> },
      { path: "applications/:id", element: <AdminApplicationDetailsPage /> },
      { path: "enquiries", element: <AdminEnquiriesPage /> },
      { path: "events", element: <AdminEventsPage /> },
      { path: "awards", element: <AdminAwardsPage /> },
      { path: "membership-grades", element: <AdminMembershipGradesPage /> },
      { path: "content", element: <AdminContentPage /> },
      { path: "content/:slug", element: <AdminContentPage /> },
      { path: "events/:id", element: <AdminEventDetailsPage /> },
      { path: "users", element: <ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute> },
      { path: "profile", element: <AdminProfilePage /> },
    ],
  },
  {
    path: "/dashboard/users",
    element: <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>,
    children: [{ index: true, element: <AdminUsersPage /> }],
  },
  {
    path: "/dashboard/users/:id",
    element: <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>,
    children: [{ index: true, element: <AdminUserDetailsPage /> }],
  },
  { path: "*", element: <NotFound /> },
];

export default routes;
