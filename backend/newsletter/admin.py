from django.contrib import admin

from .models import NewsletterSignup


@admin.register(NewsletterSignup)
class NewsletterSignupAdmin(admin.ModelAdmin):
    list_display = ("email", "name", "source", "is_active", "created_at")
    list_filter = ("is_active", "source", "created_at")
    search_fields = ("email", "name")
    readonly_fields = ("created_at",)
