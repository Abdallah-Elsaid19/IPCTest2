import type { BursaryApplicationDetail, BursaryStatus } from "@/features/bursary/api";

export function allowedBursaryStatuses(application: Pick<BursaryApplicationDetail,
  "status" | "can_request_information" | "post_approval_information_requested"
>): BursaryStatus[] {
  if (application.status === "rejected") return [];
  if (application.status === "approved") {
    return application.can_request_information ? ["needs_information"] : [];
  }
  if (application.status === "needs_information" && application.post_approval_information_requested) return [];
  const statuses: BursaryStatus[] = ["submitted", "under_review", "needs_information", "approved", "rejected"];
  return statuses.filter((status) => status !== application.status
    && !(status === "submitted" && application.status !== "submitted")
    && !(status === "needs_information" && !application.can_request_information));
}
