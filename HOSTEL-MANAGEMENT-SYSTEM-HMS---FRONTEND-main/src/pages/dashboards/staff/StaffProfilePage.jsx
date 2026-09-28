import { Building2, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { useStaffProfile } from '../../../features/staff/hooks/useStaffProfile';
import {
  StaffErrorAlert,
  StaffLoadingBlock,
  StaffMetricCard,
  StaffPageHeader,
  StaffPanel,
  StaffRefreshButton,
} from '../../../features/staff/components/StaffUi';
import { formatStaffDate } from '../../../features/staff/mappers/staffMappers';

function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-950">{value || '-'}</p>
    </div>
  );
}

export default function StaffProfilePage() {
  const staffQuery = useStaffProfile();
  const staff = staffQuery.data || {};
  const accountStatus = staff.active === true ? 'Active' : staff.active === false ? 'Inactive' : 'Unknown';
  const verifiedStatus = staff.verified === true ? 'Yes' : staff.verified === false ? 'No' : 'Unknown';

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <StaffPageHeader
        title="My Profile"
        description="View your staff account and branch information."
        actions={
          <StaffRefreshButton
            onClick={() => staffQuery.refetch()}
            isFetching={staffQuery.isFetching && !staffQuery.isLoading}
          />
        }
      />

      {staffQuery.isError ? (
        <StaffErrorAlert
          title="Profile could not be loaded"
          message={staffQuery.error?.message}
          onRetry={staffQuery.refetch}
        />
      ) : null}

      {staffQuery.isLoading ? <StaffLoadingBlock label="Loading profile..." /> : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaffMetricCard title="Role" value={staff.role || 'STAFF'} subtitle="Authenticated access" icon={ShieldCheck} tone="sky" loading={staffQuery.isLoading} />
        <StaffMetricCard title="Branch" value={staff.branchName || '-'} subtitle="Assigned branch" icon={Building2} tone="emerald" loading={staffQuery.isLoading} />
        <StaffMetricCard title="Status" value={accountStatus} subtitle="Account status" icon={UserRound} tone="violet" loading={staffQuery.isLoading} />
        <StaffMetricCard title="Verified" value={verifiedStatus} subtitle="Login verification" icon={ShieldCheck} tone="amber" loading={staffQuery.isLoading} />
      </div>

      <StaffPanel title="Account Details" subtitle="Data is loaded from your authenticated session.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <InfoRow label="Name" value={staff.name} />
          <InfoRow label="Email" value={staff.email} />
          <InfoRow label="Phone" value={staff.phone} />
          <InfoRow label="User ID" value={staff.id} />
          <InfoRow label="Branch" value={staff.branchName || staff.branchId} />
          <InfoRow label="Joined" value={formatStaffDate(staff.joinedAt)} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-sky-900">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">Email</p>
                <p className="mt-1 break-all text-sm">{staff.email || '-'}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-900">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-5 w-5" />
              <div>
                <p className="text-sm font-semibold">Phone</p>
                <p className="mt-1 text-sm">{staff.phone || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      </StaffPanel>
    </div>
  );
}
