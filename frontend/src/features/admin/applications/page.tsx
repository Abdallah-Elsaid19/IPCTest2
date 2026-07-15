import {
  AdminPageHeader,
  AdminPageState,
  EmptyState,
  ManageLink,
  StatusBadge,
} from "@/features/admin/components/AdminPage";
import { useAdminDashboard } from "@/features/admin/context/AdminDashboardContext";
import { adminUrl, formatDate } from "@/features/admin/utils";

export default function AdminApplicationsPage() {
  const { data, isLoading } = useAdminDashboard();
  return (
    <AdminPageState isLoading={isLoading} hasData={Boolean(data)}>
      {data && (
        <>
          <AdminPageHeader
            eyebrow="Membership"
            title="Applications"
            description="Review the latest membership applications."
            action={
              <ManageLink href={`${adminUrl}applications/application/`}>
                Manage applications
              </ManageLink>
            }
          />
          <div className="mt-8">
            {data.recent_applications.length ? (
              <div className="overflow-x-auto rounded-2xl border border-[#DED2C3] bg-[#FFFDF9] shadow-[0_8px_25px_rgba(66,48,31,0.05)]">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-[#ECE2D6] text-[10px] uppercase tracking-wider text-[#766C62]">
                    <tr>
                      <th className="px-5 py-3.5">Reference</th>
                      <th className="px-5 py-3.5">Applicant</th>
                      <th className="px-5 py-3.5">Grade</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8DED2]">
                    {data.recent_applications.map((item) => (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-[#FAF5EE]"
                      >
                        <td className="px-5 py-4 font-mono text-xs font-bold text-primary-800">
                          {item.reference}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold">{item.name}</p>
                          <p className="mt-1 text-xs text-[#8A7E72]">
                            {item.email}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-[#554E47]">
                          {item.grade}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-4 text-[#756B61]">
                          {formatDate(item.submitted_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState>
                No membership applications have been submitted.
              </EmptyState>
            )}
          </div>
        </>
      )}
    </AdminPageState>
  );
}
