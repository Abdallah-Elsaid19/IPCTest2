import MembershipGradeTemplate from "../../components/MembershipGradeTemplate";
import { membershipGrades } from "@/mocks/membershipGrades";

export default function AssociateFellowL4GradePage() {
  return <MembershipGradeTemplate data={membershipGrades["associate-fellow-l4"]} />;
}