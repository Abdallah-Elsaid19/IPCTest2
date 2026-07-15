import MembershipGradeTemplate from "../../components/MembershipGradeTemplate";
import { membershipGrades } from "@/mocks/membershipGrades";

export default function FellowGradePage() {
  return <MembershipGradeTemplate data={membershipGrades.fellow} />;
}