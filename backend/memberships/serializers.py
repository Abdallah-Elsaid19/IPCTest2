from rest_framework import serializers
from .models import MembershipContent, MembershipGrade, MembershipGradeBenefit, MembershipGradeRequirement


class MembershipContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipContent
        fields = [
            "hero", "grades_intro", "comparison", "member_value",
            "professional_visibility", "application_journey",
            "organisational_membership", "questions", "grade_finder",
            "final_cta", "seo", "updated_at",
        ]
        read_only_fields = fields


class MembershipGradeBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipGradeBenefit
        fields = ["id", "title", "description", "display_order"]


class MembershipGradeRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipGradeRequirement
        fields = ["id", "requirement_type", "title", "description", "is_required", "display_order"]


class MembershipGradeSerializer(serializers.ModelSerializer):
    benefits = MembershipGradeBenefitSerializer(many=True, read_only=True)
    requirements = MembershipGradeRequirementSerializer(many=True, read_only=True)

    class Meta:
        model = MembershipGrade
        fields = [
            "id",
            "code",
            "slug",
            "title",
            "short_title",
            "description",
            "image_url",
            "post_nominal",
            "pathway_title",
            "pathway_description",
            "evidence_requirements",
            "cpd_requirements",
            "professional_recognition",
            "application_pathway",
            "benefits",
            "requirements",
        ]


class AdminMembershipGradeSerializer(serializers.ModelSerializer):
    benefits = MembershipGradeBenefitSerializer(many=True, read_only=True)
    requirements = MembershipGradeRequirementSerializer(many=True, read_only=True)

    class Meta:
        model = MembershipGrade
        fields = [
            "id", "code", "slug", "title", "short_title", "description",
            "image_url", "post_nominal", "pathway_title", "pathway_description",
            "evidence_requirements", "cpd_requirements", "professional_recognition",
            "application_pathway", "is_active", "display_order", "created_at",
            "updated_at", "benefits", "requirements",
        ]
        read_only_fields = ["created_at", "updated_at", "benefits", "requirements"]

    def validate_code(self, value):
        if self.instance and value != self.instance.code:
            raise serializers.ValidationError("The grade code cannot be changed after creation.")
        return value
