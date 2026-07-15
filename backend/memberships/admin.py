from django.contrib import admin
from .models import MembershipGrade, MembershipGradeBenefit, MembershipGradeRequirement


class MembershipGradeBenefitInline(admin.TabularInline):
    model = MembershipGradeBenefit
    extra = 0


class MembershipGradeRequirementInline(admin.TabularInline):
    model = MembershipGradeRequirement
    extra = 0


@admin.register(MembershipGrade)
class MembershipGradeAdmin(admin.ModelAdmin):
    list_display = ("code", "title", "slug", "post_nominal", "is_active", "display_order")
    list_filter = ("is_active",)
    search_fields = ("title", "short_title", "slug", "post_nominal", "description", "evidence_requirements")
    prepopulated_fields = {"slug": ("short_title",)}
    readonly_fields = ("created_at", "updated_at")
    inlines = [MembershipGradeBenefitInline, MembershipGradeRequirementInline]


@admin.register(MembershipGradeBenefit)
class MembershipGradeBenefitAdmin(admin.ModelAdmin):
    list_display = ("title", "grade", "display_order", "is_active")
    list_filter = ("grade", "is_active")
    search_fields = ("title", "description")


@admin.register(MembershipGradeRequirement)
class MembershipGradeRequirementAdmin(admin.ModelAdmin):
    list_display = ("title", "grade", "requirement_type", "is_required", "display_order")
    list_filter = ("grade", "requirement_type", "is_required")
    search_fields = ("title", "description")
