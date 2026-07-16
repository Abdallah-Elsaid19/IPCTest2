from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model
from .models import AdminProfile


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "profile_image", "created_at")
    list_filter = ("role", "created_at")
    search_fields = ("user__username", "user__email", "user__first_name", "user__last_name")
    autocomplete_fields = ("user",)


try:
    admin.site.unregister(get_user_model())
except admin.sites.NotRegistered:
    pass


class IPCUserAdmin(UserAdmin):
    list_display = UserAdmin.list_display + ("membership_reference", "membership_grade")
    search_fields = UserAdmin.search_fields + (
        "membership_application__application_reference",
        "membership_application__email",
        "membership_application__membership_grade__code",
    )
    readonly_fields = UserAdmin.readonly_fields + (
        "membership_reference",
        "membership_grade",
    )
    fieldsets = UserAdmin.fieldsets + (
        ("Membership application", {
            "fields": ("membership_reference", "membership_grade"),
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            "membership_application__membership_grade"
        )

    @admin.display(description="Reference")
    def membership_reference(self, obj):
        try:
            return obj.membership_application.application_reference
        except get_user_model().membership_application.RelatedObjectDoesNotExist:
            return "—"

    @admin.display(description="Membership grade")
    def membership_grade(self, obj):
        try:
            return obj.membership_application.membership_grade.code
        except get_user_model().membership_application.RelatedObjectDoesNotExist:
            return "—"


admin.site.register(get_user_model(), IPCUserAdmin)
