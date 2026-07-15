from django.urls import include, path
from rest_framework.routers import DefaultRouter
from applications.views import AdminApplicationViewSet, ApplicationViewSet
from events.views import AdminEventRegistrationViewSet, AdminEventViewSet, AdminEventbriteAttendeesView, EventRegistrationCalendarView, EventRegistrationConfigView, EventRegistrationCreateView, EventRegistrationDetailView, EventRegistrationViewSet, EventViewSet, EventbriteAuthorizeView, EventbriteCallbackView, EventbriteEventsView, EventbriteOrganizationsView, EventbriteSyncView
from awards.views import AwardProgrammeViewSet, AwardsInterestViewSet
from contact.views import ContactSubmissionViewSet
from newsletter.views import NewsletterSignupViewSet
from memberships.views import MembershipGradeViewSet
from media_library.views import MediaAssetViewSet
from ipc_backend.views import csrf_cookie
from clubs.views import ClubEnquiryCreateView
from accounts.views import CurrentUserView, LoginView, LogoutView, RefreshView
from accounts.dashboard import AdminDashboardView, AdminEnquiryReplyView
from accounts.user_management import AdminUserViewSet, PasswordResetConfirmView

router = DefaultRouter(trailing_slash=False)
router.register("membership-grades", MembershipGradeViewSet, basename="membership-grade")
router.register("applications", ApplicationViewSet, basename="application")
router.register("events/register", EventRegistrationViewSet, basename="event-registration")
router.register("events", EventViewSet, basename="event")
router.register("award-programmes", AwardProgrammeViewSet, basename="award-programme")
router.register("awards/interest", AwardsInterestViewSet, basename="awards-interest")
router.register("contact", ContactSubmissionViewSet, basename="contact")
router.register("newsletter", NewsletterSignupViewSet, basename="newsletter")
router.register("media", MediaAssetViewSet, basename="media")
router.register("admin/applications", AdminApplicationViewSet, basename="admin-application")
router.register("admin/users", AdminUserViewSet, basename="admin-user")
router.register("admin/events", AdminEventViewSet, basename="admin-event")
router.register("admin/event-registrations", AdminEventRegistrationViewSet, basename="admin-event-registration")

urlpatterns = [
    path("csrf", csrf_cookie, name="csrf-cookie"),
    path("auth/login", LoginView.as_view(), name="auth-login"),
    path("auth/refresh", RefreshView.as_view(), name="auth-refresh"),
    path("auth/logout", LogoutView.as_view(), name="auth-logout"),
    path("auth/me", CurrentUserView.as_view(), name="auth-me"),
    path("auth/password-reset/confirm", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("admin/dashboard", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin/eventbrite/attendees", AdminEventbriteAttendeesView.as_view(), name="admin-eventbrite-attendees"),
    path("admin/enquiries/<str:source>/<str:enquiry_id>/reply", AdminEnquiryReplyView.as_view(), name="admin-enquiry-reply"),
    path("clubs/enquiries/", ClubEnquiryCreateView.as_view(), name="club-enquiry-create"),
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
