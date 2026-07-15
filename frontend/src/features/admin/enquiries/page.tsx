import { Mail } from "lucide-react";
import { useState } from "react";

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
import type { DashboardEnquiry } from "@/features/admin/types";
import { useAuth } from "@/features/auth/AuthContext";
import { adminUrl, formatDate } from "@/features/admin/utils";
import { notifications } from "@/lib/notifications";

export default function AdminEnquiriesPage() {
  const { data, isLoading, refresh } = useAdminDashboard();
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState<DashboardEnquiry | null>(null);

  const sendReply = async (message: string) => {
    if (!replyingTo) return;
    try {
      await adminApi.replyToEnquiry(replyingTo.type, replyingTo.id, message);
      notifications.success(`Reply sent successfully to ${replyingTo.email}.`);
      setReplyingTo(null);
      await refresh();
    } catch (error) {
      notifications.error(error instanceof Error ? error.message : "The enquiry reply could not be sent.");
    }
  };
  return (
    <AdminPageState isLoading={isLoading} hasData={Boolean(data)}>
      {data && (
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
            {data.recent_enquiries.length ? (
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
                    {data.recent_enquiries.map((item) => (
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
                          <button
                            type="button"
                            onClick={() => setReplyingTo(item)}
                            className="inline-grid h-9 w-9 place-items-center rounded-lg text-[#655D55] transition-colors hover:bg-primary-100 hover:text-primary-800"
                            title={`Reply to ${item.email}`}
                            aria-label={`Reply to ${item.name}`}
                          >
                            <Mail size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
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
        </>
      )}
    </AdminPageState>
  );
}
