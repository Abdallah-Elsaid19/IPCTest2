from django.urls import include, path
from rest_framework.routers import DefaultRouter
from applications.views import AdminApplicationViewSet, ApplicationViewSet
from events.views import AdminEventRegistrationViewSet, AdminEventViewSet, AdminEventbriteAttendeesView, EventPageContentView, EventRegistrationCalendarView, EventRegistrationConfigView, EventRegistrationCreateView, EventRegistrationDetailView, EventRegistrationViewSet, EventViewSet, EventbriteAuthorizeView, EventbriteCallbackView, EventbriteEventsView, EventbriteOrganizationsView, EventbriteSyncView
from awards.views import (
    AdminAwardCategoryViewSet,
    AdminAwardProgrammeViewSet,
    AwardCategoryViewSet,
    AwardPageContentView,
    AwardProgrammeViewSet,
    AwardsInterestViewSet,
)
from contact.views import ContactSubmissionViewSet
from newsletter.views import NewsletterSignupViewSet
from memberships.views import AdminMembershipGradeViewSet, MembershipContentView, MembershipGradeViewSet
from media_library.views import MediaAssetViewSet
from ipc_backend.views import csrf_cookie
from ipc_backend.content_management import AdminContentDetailView, AdminContentListView
from clubs.views import ClubEnquiryCreateView, ClubPageContentView, PublicClubDetailView
from scholarships.views import ScholarshipContentView
from sponsorship.views import SponsorshipContentView
from about.views import AboutPageContentView
from home.views import HomeContentView
from services.views import ServiceContentView
from fund.views import FundContentView
from institutional.views import EmployerContentView, PartnershipContentView, PublicationContentView
from accounts.views import CurrentUserView, LoginView, LogoutView, RefreshView
from accounts.dashboard import (
    AdminDashboardView,
    AdminEnquiryDetailView,
    AdminEnquiryListView,
    AdminEnquiryReplyView,
)
from accounts.user_management import AdminUserViewSet, PasswordResetConfirmView, PasswordResetRequestView
from accounts.notification_api import AdminNotificationViewSet
from user_panel.views import AdminClubMembershipViewSet, AdminClubViewSet, AdminNominationViewSet, AdminSupportViewSet

router = DefaultRouter(trailing_slash=False)
router.register("membership-grades", MembershipGradeViewSet, basename="membership-grade")
router.register("admin/membership-grades", AdminMembershipGradeViewSet, basename="admin-membership-grade")
router.register("applications", ApplicationViewSet, basename="application")
router.register("events/register", EventRegistrationViewSet, basename="event-registration")
router.register("events", EventViewSet, basename="event")
router.register("award-programmes", AwardProgrammeViewSet, basename="award-programme")
router.register("award-categories", AwardCategoryViewSet, basename="award-category")
router.register("awards/interest", AwardsInterestViewSet, basename="awards-interest")
router.register("contact", ContactSubmissionViewSet, basename="contact")
router.register("newsletter", NewsletterSignupViewSet, basename="newsletter")
router.register("media", MediaAssetViewSet, basename="media")
router.register("admin/applications", AdminApplicationViewSet, basename="admin-application")
router.register("admin/users", AdminUserViewSet, basename="admin-user")
router.register("admin/notifications", AdminNotificationViewSet, basename="admin-notification")
router.register("admin/events", AdminEventViewSet, basename="admin-event")
router.register("admin/award-programmes", AdminAwardProgrammeViewSet, basename="admin-award-programme")
router.register("admin/award-categories", AdminAwardCategoryViewSet, basename="admin-award-category")
router.register("admin/award-nominations", AdminNominationViewSet, basename="admin-award-nomination")
router.register("admin/support", AdminSupportViewSet, basename="admin-support")
router.register("admin/club-memberships", AdminClubMembershipViewSet, basename="admin-club-membership")
router.register("admin/clubs", AdminClubViewSet, basename="admin-club")
router.register("admin/event-registrations", AdminEventRegistrationViewSet, basename="admin-event-registration")

urlpatterns = [
    path("user/", include("user_panel.urls")),
    path("csrf", csrf_cookie, name="csrf-cookie"),
    path("auth/login", LoginView.as_view(), name="auth-login"),
    path("auth/refresh", RefreshView.as_view(), name="auth-refresh"),
    path("auth/logout", LogoutView.as_view(), name="auth-logout"),
    path("auth/me", CurrentUserView.as_view(), name="auth-me"),
    path("auth/password-reset/request", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("auth/password-reset/confirm", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("admin/dashboard", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin/content", AdminContentListView.as_view(), name="admin-content-list"),
    path("admin/content/<slug:slug>", AdminContentDetailView.as_view(), name="admin-content-detail"),
    path("admin/eventbrite/attendees", AdminEventbriteAttendeesView.as_view(), name="admin-eventbrite-attendees"),
    path("admin/enquiries", AdminEnquiryListView.as_view(), name="admin-enquiry-list"),
    path("admin/enquiries/<str:source>/<str:enquiry_id>", AdminEnquiryDetailView.as_view(), name="admin-enquiry-detail"),
    path("admin/enquiries/<str:source>/<str:enquiry_id>/reply", AdminEnquiryReplyView.as_view(), name="admin-enquiry-reply"),
    path("clubs/enquiries/", ClubEnquiryCreateView.as_view(), name="club-enquiry-create"),
    path("clubs/content", ClubPageContentView.as_view(), name="club-page-content"),
    path("clubs/<slug:slug>", PublicClubDetailView.as_view(), name="public-club-detail"),
    path("scholarships", ScholarshipContentView.as_view(), name="scholarship-content"),
    path("sponsorship", SponsorshipContentView.as_view(), name="sponsorship-content"),
    path("home/content", HomeContentView.as_view(), name="home-content"),
    path("services/content", ServiceContentView.as_view(), name="service-content"),
    path("fund/content", FundContentView.as_view(), name="fund-content"),
    path("membership/content", MembershipContentView.as_view(), name="membership-content"),
    path("awards/content", AwardPageContentView.as_view(), name="award-page-content"),
    path("events/content", EventPageContentView.as_view(), name="event-page-content"),
    path("about/content", AboutPageContentView.as_view(), name="about-page-content"),
    path("employers/content", EmployerContentView.as_view(), name="employer-content"),
    path("partnerships/content", PartnershipContentView.as_view(), name="partnership-content"),
    path("publications/content", PublicationContentView.as_view(), name="publication-content"),
    path("events/eventbrite/authorize", EventbriteAuthorizeView.as_view(), name="eventbrite-authorize"),
    path("events/eventbrite/callback", EventbriteCallbackView.as_view(), name="eventbrite-callback"),
    path("events/eventbrite/organizations/", EventbriteOrganizationsView.as_view(), name="eventbrite-organizations"),
    path("events/eventbrite/events/", EventbriteEventsView.as_view(), name="eventbrite-events"),
    path("events/eventbrite/sync/", EventbriteSyncView.as_view(), name="eventbrite-sync-slash"),
    path("events/eventbrite/sync", EventbriteSyncView.as_view(), name="eventbrite-sync"),
    path("events/<slug:slug>/registration", EventRegistrationConfigView.as_view(), name="event-registration-config"),
    path("events/<slug:slug>/register", EventRegistrationCreateView.as_view(), name="event-registration-create"),
    path("events/registrations/<str:reference>", EventRegistrationDetailView.as_view(), name="event-registration-detail"),
    path("events/registrations/<str:reference>/calendar", EventRegistrationCalendarView.as_view(), name="event-registration-calendar"),
    path("", include(router.urls)),
]
