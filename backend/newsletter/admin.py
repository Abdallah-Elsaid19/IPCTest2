from django.contrib import admin

from .models import NewsletterSignup, ScholarshipAnnouncementReminder


@admin.register(NewsletterSignup)
class NewsletterSignupAdmin(admin.ModelAdmin):
    list_display = ("email", "name", "source", "is_active", "created_at")
    list_filter = ("is_active", "source", "created_at")
    search_fields = ("email", "name")
    readonly_fields = ("created_at",)


@admin.register(ScholarshipAnnouncementReminder)
class ScholarshipAnnouncementReminderAdmin(admin.ModelAdmin):
    list_display = ("email", "is_active", "created_at", "last_email_sent_at", "email_send_count")
    list_filter = ("is_active", "created_at", "last_email_sent_at")
    search_fields = ("email",)
    readonly_fields = ("created_at", "updated_at", "last_email_sent_at", "email_send_count")
