import {
  AdminPageHeader,
  AdminPageState,
  EmptyState,
  ManageLink,
  StatusBadge,
} from "@/features/admin/components/AdminPage";
import { useAdminDashboard } from "@/features/admin/context/AdminDashboardContext";
import { adminUrl, formatDate } from "@/features/admin/utils";

export default function AdminEnquiriesPage() {
  const { data, isLoading } = useAdminDashboard();
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState>No enquiries have been received.</EmptyState>
            )}
          </div>
        </>
      )}
    </AdminPageState>
  );
}
