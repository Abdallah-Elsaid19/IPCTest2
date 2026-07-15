from rest_framework import serializers
from .models import MembershipGrade, MembershipGradeBenefit, MembershipGradeRequirement


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
