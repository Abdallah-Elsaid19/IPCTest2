import MembershipGradeTemplate from "../../components/MembershipGradeTemplate";
import { membershipGrades } from "@/mocks/membershipGrades";

export default function AffiliateGradePage() {
  return <MembershipGradeTemplate data={membershipGrades.affiliate} />;
}