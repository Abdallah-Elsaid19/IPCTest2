import { Eye, Mail, MailCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { adminApi } from "@/features/admin/adminApi";
import {
  AdminPageHeader,
  AdminPageState,
  EmptyState,
  ManageLink,
  StatusBadge,
} from "@/features/admin/components/AdminPage";
import { useAdminDashboard } from "@/features/admin/context/AdminDashboardContext";
import EnquiryReplyModal from "@/features/admin/enquiries/EnquiryReplyModal";
import EnquiryDetailsModal from "@/features/admin/enquiries/EnquiryDetailsModal";
import type { DashboardEnquiry } from "@/features/admin/types";
import { useAuth } from "@/features/auth/AuthContext";
import { adminUrl, formatDate } from "@/features/admin/utils";
import { notifications } from "@/lib/notifications";

const repliedStatuses = new Set(["in_progress", "contacted", "resolved", "closed"]);

export default function AdminEnquiriesPage() {
  const { refresh } = useAdminDashboard();
  const { user } = useAuth();
  const [enquiries, setEnquiries] = useState<DashboardEnquiry[] | null>(null);
  const [replyingTo, setReplyingTo] = useState<DashboardEnquiry | null>(null);
  const [viewingEnquiry, setViewingEnquiry] = useState<DashboardEnquiry | null>(null);
  const [repliedEnquiries, setRepliedEnquiries] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const controller = new AbortController();
    adminApi.enquiries(controller.signal).then(setEnquiries).catch((error: unknown) => {
      if (controller.signal.aborted) return;
      setEnquiries([]);
      notifications.error(error instanceof Error ? error.message : "The enquiries could not be loaded.");
    });
    return () => controller.abort();
  }, []);

  const enquiryKey = (enquiry: DashboardEnquiry) => `${enquiry.type}-${enquiry.id}`;
  const hasBeenRepliedTo = (enquiry: DashboardEnquiry) => (
    repliedStatuses.has(enquiry.status.toLowerCase()) || repliedEnquiries.has(enquiryKey(enquiry))
  );

  const sendReply = async (message: string) => {
    if (!replyingTo) return;
    try {
      const response = await adminApi.replyToEnquiry(replyingTo.type, replyingTo.id, message);
      const repliedKey = enquiryKey(replyingTo);
      setRepliedEnquiries((current) => new Set(current).add(repliedKey));
      setEnquiries((current) => current?.map((enquiry) => (
        enquiryKey(enquiry) === repliedKey
          ? { ...enquiry, status: response.status }
          : enquiry
      )) ?? current);
      notifications.success(`Reply sent successfully to ${replyingTo.email}.`);
      setReplyingTo(null);
      void refresh();
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "The enquiry reply could not be sent.");
    }
  };
  return (
    <AdminPageState isLoading={enquiries === null} hasData={enquiries !== null}>
      {enquiries && (
        <>
          <AdminPageHeader
            eyebrow="Communications"
            title="Enquiries"
            description="Contact, club and award enquiries in one place."
            action={
              <ManageLink href={`${adminUrl}contact/contactsubmission/`}>
                Open inbox
              </ManageLink>
            }
          />
          <div className="mt-8">
            {enquiries.length ? (
              <div className="overflow-x-auto rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_8px_25px_rgba(66,48,31,0.05)]">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-[#ECE2D6] text-[10px] uppercase tracking-wider text-[#766C62]">
                    <tr>
                      <th className="px-5 py-3.5">Source</th>
                      <th className="px-5 py-3.5">Contact</th>
                      <th className="px-5 py-3.5">Subject</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Received</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DED2]">
                    {enquiries.map((item) => {
                      const isReplied = hasBeenRepliedTo(item);
                      return (
                      <tr
                        key={`${item.type}-${item.id}`}
                        className="hover:bg-[#FAF5EE]"
                      >
                        <td className="px-5 py-4 font-bold capitalize text-primary-800">
                          {item.type}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">{item.name}</p>
                          <p className="mt-1 text-xs text-[#8A7E72]">
                            {item.email}
                          </p>
                        </td>
                        <td className="max-w-xs truncate px-5 py-4 text-[#554E47]">
                          {item.subject}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-4 text-[#756B61]">
                          {formatDate(item.created_at)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                          <button type="button" onClick={() => setViewingEnquiry(item)} className="inline-grid h-9 w-9 place-items-center rounded-lg border border-transparent text-[#655D55] transition-colors hover:bg-primary-100 hover:text-primary-800" title={`View enquiry from ${item.name}`} aria-label={`View enquiry details from ${item.name}`}><Eye size={16}/></button>
                          <button
                            type="button"
                            onClick={() => setReplyingTo(item)}
                            className={`relative inline-grid h-9 w-9 place-items-center rounded-lg border transition-colors ${isReplied ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-transparent text-[#655D55] hover:bg-primary-100 hover:text-primary-800"}`}
                            title={isReplied ? `Replied — send another reply to ${item.email}` : `Reply to ${item.email}`}
                            aria-label={isReplied ? `Enquiry from ${item.name} has been replied to. Send another reply` : `Reply to ${item.name}`}
                          >
                            {isReplied ? <MailCheck size={17} /> : <Mail size={16} />}
                            {isReplied && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#FFFDF9] bg-emerald-500" aria-hidden="true" />}
                          </button>
                          </div>
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState>No enquiries have been received.</EmptyState>
            )}
          </div>
          <EnquiryReplyModal
            enquiry={replyingTo}
            administrator={user}
            onClose={() => setReplyingTo(null)}
            onSend={sendReply}
          />
          <EnquiryDetailsModal enquiry={viewingEnquiry} onClose={() => setViewingEnquiry(null)} />
        </>
      )}
    </AdminPageState>
  );
}
