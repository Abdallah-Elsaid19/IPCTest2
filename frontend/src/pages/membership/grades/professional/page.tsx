import MembershipGradeTemplate from "../../components/MembershipGradeTemplate";
import { membershipGrades } from "@/mocks/membershipGrades";

export default function ProfessionalGradePage() {
  return <MembershipGradeTemplate data={membershipGrades.professional} />;
}