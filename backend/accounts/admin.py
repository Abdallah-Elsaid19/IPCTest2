from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .models import AdminProfile


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "created_at")
    list_filter = ("role", "created_at")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name")
    autocomplete_fields = ("user",)


try:
    admin.site.unregister(get_user_model())
except admin.sites.NotRegistered:
    pass
admin.site.register(get_user_model(), UserAdmin)