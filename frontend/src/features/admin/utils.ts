export const adminUrl = (import.meta.env.VITE_DJANGO_ADMIN_URL || "http://localhost:8000/admin/").replace(/\/?$/, "/");

const statusLabels: Record<string, string> = {
  submitted: "Submitted", under_review: "Under Review", more_info_required: "More information",
  approved: "Approved", rejected: "Rejected", new: "New", in_progress: "In progress",
  handled: "Handled", contacted: "Contacted", closed: "Closed", spam: "Spam",
  registered: "Registered", waitlisted: "Waitlisted", cancelled: "Cancelled",
};

export const labelStatus = (value: string) => statusLabels[value] || value.replaceAll("_", " ");

export const formatDate = (value: string | null) => value
  ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value))
  : "—";
