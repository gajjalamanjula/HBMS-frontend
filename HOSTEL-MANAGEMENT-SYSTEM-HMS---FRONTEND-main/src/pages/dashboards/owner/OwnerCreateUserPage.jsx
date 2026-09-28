import { useState } from 'react';
import { ShieldCheck, UserPlus } from 'lucide-react';

import OwnerCreateUserPanel from '../../../features/owner/components/OwnerCreateUserPanel';
import OwnerVerifyOtpPanel from '../../../features/owner/components/OwnerVerifyOtpPanel';
import {
  OwnerHeaderActions,
  OwnerMetricCard,
  OwnerPageHeader,
} from '../../../features/owner/components/OwnerDashboardUi';
import { OwnerErrorState } from '../../../features/owner/components/OwnerPhase4States';
import { useOwnerBranches } from '../../../features/owner/hooks/useOwnerBranches';
import { useOwnerStaffCount } from '../../../features/owner/hooks/useOwnerStaffCount';
import { useOwnerTenantsCount } from '../../../features/owner/hooks/useOwnerTenantsCount';
import { formatOwnerNumber } from '../../../features/owner/utils/ownerUiUtils';

export default function OwnerCreateUserPage() {
  const [otpEmail, setOtpEmail] = useState('');
  const branchesQuery = useOwnerBranches();
  const staffCountQuery = useOwnerStaffCount();
  const tenantsCountQuery = useOwnerTenantsCount();

  const handleCreated = (result) => {
    if (result?.email) setOtpEmail(result.email);
  };

  const refreshAll = () => {
    branchesQuery.refetchBranches();
    staffCountQuery.refetch();
    tenantsCountQuery.refetch();
  };

  const isFetching = branchesQuery.isFetching || staffCountQuery.isFetching || tenantsCountQuery.isFetching;

  return (
    <div className="space-y-4">
      <OwnerPageHeader
        title="Create User"
        eyebrow="New Member"
        actions={<OwnerHeaderActions isFetching={isFetching} onRefresh={refreshAll} />}
      />

      {branchesQuery.isError ? (
        <OwnerErrorState title="Branches could not be loaded" message={branchesQuery.errorMessage} onRetry={branchesQuery.refetchBranches} />
      ) : null}
      {staffCountQuery.isError ? (
        <OwnerErrorState title="Staff count could not be loaded" message={staffCountQuery.error?.message} onRetry={staffCountQuery.refetch} />
      ) : null}
      {tenantsCountQuery.isError ? (
        <OwnerErrorState title="Tenant count could not be loaded" message={tenantsCountQuery.error?.message} onRetry={tenantsCountQuery.refetch} />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <OwnerMetricCard title="Branches" value={formatOwnerNumber(branchesQuery.branches.length)} subtitle="Available for assignment" icon={UserPlus} loading={branchesQuery.isLoading} tone="blue" />
        <OwnerMetricCard title="Staff Total" value={formatOwnerNumber(staffCountQuery.data)} subtitle="Current count" icon={UserPlus} loading={staffCountQuery.isLoading} tone="amber" />
        <OwnerMetricCard title="Tenant Total" value={formatOwnerNumber(tenantsCountQuery.data)} subtitle="Current count" icon={ShieldCheck} loading={tenantsCountQuery.isLoading} tone="sage" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]">
        <OwnerCreateUserPanel branches={branchesQuery.branches} onCreated={handleCreated} />
        <OwnerVerifyOtpPanel defaultEmail={otpEmail} />
      </div>
    </div>
  );
}
