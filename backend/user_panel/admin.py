from django.contrib import admin

from .models import (
    AwardNomination, AwardNominationDocument, Club, ClubMembership, ClubMessage, DiscussionCategory,
    DiscussionPost, DiscussionThread, ProfessionalInterest, Programme,
    ProgrammeEnquiry, Scholarship, ScholarshipApplication, SupportMessage,
    SupportTicket, UserDocument, UserNotification, UserPreference, UserProfile,
)


@admin.register(UserProfile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "job_title", "employer", "country", "updated_at")
    search_fields = ("user__email", "user__first_name", "user__last_name", "employer")


@admin.register(ScholarshipApplication, AwardNomination, ClubMembership, SupportTicket)
class WorkflowAdmin(admin.ModelAdmin):
    list_filter = ("status",)


admin.site.register([
    ProfessionalInterest, UserPreference, Scholarship, Club, DiscussionCategory,
    DiscussionThread, DiscussionPost, ClubMessage, UserDocument, UserNotification,
    Programme, ProgrammeEnquiry, SupportMessage,
    AwardNominationDocument,
])
