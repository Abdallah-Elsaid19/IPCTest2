import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import LandingPage from "../pages/landing/page";
import Home from "../pages/home/page";
import Membership from "../pages/membership/page";
import AffiliateGradePage from "../pages/membership/grades/affiliate/page";
import ProfessionalGradePage from "../pages/membership/grades/professional/page";
import AssociateFellowL3GradePage from "../pages/membership/grades/associate-fellow-l3/page";
import AssociateFellowL4GradePage from "../pages/membership/grades/associate-fellow-l4/page";
import FellowGradePage from "../pages/membership/grades/fellow/page";
import MembershipApplicationPage from "../pages/membership/apply/page";
import Scholarships from "../pages/scholarships/page";
import Sponsorship from "../pages/sponsorship/page";
import BookingPage from "../pages/BookingPage";
import Awards from "../pages/awards/page";
import Events from "../pages/events/page";
import Clubs from "../pages/clubs/page";
import About from "../pages/about/page";
import Contact from "../pages/contact/page";
import Privacy from "../pages/privacy/page";
import AdminApplicationsPage from "@/features/admin/applications/page";
import AdminEnquiriesPage from "@/features/admin/enquiries/page";
import AdminEventsPage from "@/features/admin/events/page";
import AdminLayout from "@/features/admin/layouts/AdminLayout";
import AdminOverviewPage from "@/features/admin/overview/page";
import AdminProfilePage from "@/features/admin/profile/page";
import AdminUsersPage from "@/features/admin/users/page";
import Login from "@/features/auth/login/Login";
import PasswordResetPage from "@/features/auth/password-reset/page";
import { GuestOnlyRoute, ProtectedRoute } from "@/features/auth/ProtectedRoute";

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
  { path: "/booking", element: <BookingPage /> },
  { path: "/awards", element: <Awards /> },
  { path: "/events", element: <Events /> },
  { path: "/clubs", element: <Clubs /> },
  { path: "/about", element: <About /> },
  { path: "/login", element: <GuestOnlyRoute><Login /></GuestOnlyRoute> },
  { path: "/reset-password", element: <PasswordResetPage /> },
  { path: "/contact", element: <Contact /> },
  { path: "/privacy", element: <Privacy /> },
  {
    path: "/admin",
    element: <ProtectedRoute requireStaff><AdminLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <AdminOverviewPage /> },
      { path: "applications", element: <AdminApplicationsPage /> },
      { path: "enquiries", element: <AdminEnquiriesPage /> },
      { path: "events", element: <AdminEventsPage /> },
      { path: "users", element: <ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute> },
      { path: "profile", element: <AdminProfilePage /> },
    ],
  },
  {
    path: "/dashboard/users",
    element: <ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>,
    children: [{ index: true, element: <AdminUsersPage /> }],
  },
  { path: "*", element: <NotFound /> },
];

export default routes;
