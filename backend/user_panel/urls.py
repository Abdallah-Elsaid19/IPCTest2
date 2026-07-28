from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AwardViewSet, BookingViewSet, ClubMessageViewSet, ClubThreadViewSet,
    ClubViewSet, DashboardView, DocumentViewSet, EnquiryViewSet, InterestViewSet,
    MembershipViewSet, NominationViewSet, NotificationViewSet, PreferenceView,
    ProfileView, ProgrammeViewSet, ScholarshipApplicationViewSet,
    ScholarshipViewSet, SupportViewSet,
)

router = DefaultRouter(trailing_slash=False)
router.register("interests", InterestViewSet, basename="panel-interest")
router.register("membership/applications", MembershipViewSet, basename="panel-membership")
router.register("scholarships/applications", ScholarshipApplicationViewSet, basename="panel-scholarship-application")
router.register("scholarships", ScholarshipViewSet, basename="panel-scholarship")
router.register("awards/nominations", NominationViewSet, basename="panel-nomination")
router.register("awards", AwardViewSet, basename="panel-award")
router.register("clubs", ClubViewSet, basename="panel-club")
router.register("bookings", BookingViewSet, basename="panel-booking")
router.register("documents", DocumentViewSet, basename="panel-document")
router.register("notifications", NotificationViewSet, basename="panel-notification")
router.register("programmes/enquiries", EnquiryViewSet, basename="panel-enquiry")
router.register("programmes", ProgrammeViewSet, basename="panel-programme")
router.register("support", SupportViewSet, basename="panel-support")

thread_list = ClubThreadViewSet.as_view({"get": "list", "post": "create"})
thread_detail = ClubThreadViewSet.as_view({"get": "retrieve", "patch": "partial_update"})
thread_posts = ClubThreadViewSet.as_view({"get": "posts", "post": "posts"})
chat = ClubMessageViewSet.as_view({"get": "list", "post": "create"})

urlpatterns = [
    path("dashboard", DashboardView.as_view()),
    path("profile", ProfileView.as_view()),
    path("preferences", PreferenceView.as_view()),
    path("clubs/<slug:club_slug>/threads", thread_list),
    path("clubs/<slug:club_slug>/threads/<uuid:public_id>", thread_detail),
    path("clubs/<slug:club_slug>/threads/<uuid:public_id>/posts", thread_posts),
    path("clubs/<slug:club_slug>/chat", chat),
    path("", include(router.urls)),
]

