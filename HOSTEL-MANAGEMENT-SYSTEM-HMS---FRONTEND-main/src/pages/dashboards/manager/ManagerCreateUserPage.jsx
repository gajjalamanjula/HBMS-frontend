import { useState } from 'react';
import { Users } from 'lucide-react';

import ManagerCreateUserPanel from '../../../features/manager/components/ManagerCreateUserPanel';
import {
  ManagerMetricCard,
  ManagerPageHeader,
  ManagerPanel,
} from '../../../features/manager/components/ManagerDashboardUi';
import ManagerVerifyOtpPanel from '../../../features/manager/components/ManagerVerifyOtpPanel';
import { useManagerStaff } from '../../../features/manager/hooks/useManagerStaff';
import { useManagerTenants } from '../../../features/manager/hooks/useManagerTenants';

export default function ManagerCreateUserPage() {
  const [userType, setUserType] = useState('STAFF');
  const [otpEmail, setOtpEmail] = useState('');
  const staffQuery = useManagerStaff();
  const tenantsQuery = useManagerTenants();

  return (
    <div className="space-y-4">
      <ManagerPageHeader
        title="Create User"
        eyebrow="Staff & Tenant"
        description="Create staff or tenant account, then confirm the verification code sent by email."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <ManagerMetricCard
          title="Staff"
          value={staffQuery.data?.length ?? 0}
          subtitle="Current staff accounts"
          icon={Users}
          tone="blue"
          loading={staffQuery.isLoading}
        />
        <ManagerMetricCard
          title="Tenants"
          value={tenantsQuery.data?.length ?? 0}
          subtitle="Current tenant accounts"
          icon={Users}
          tone="green"
          loading={tenantsQuery.isLoading}
        />
      </div>

      <ManagerPanel title="Choose account type" subtitle="Select Staff or Tenant before entering account details.">
        <div className="flex flex-wrap gap-2">
          {['STAFF', 'TENANT'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setUserType(type)}
              className={`h-10 rounded-[12px] px-4 text-[13px] font-bold transition ${
                userType === type
                  ? 'bg-sky-700 text-white shadow-[0_12px_26px_rgba(2,132,199,0.22)]'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {type === 'STAFF' ? 'Create Staff' : 'Create Tenant'}
            </button>
          ))}
        </div>
      </ManagerPanel>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <ManagerCreateUserPanel
          userType={userType}
          onCreated={(result) => setOtpEmail(result.email || '')}
        />
        <ManagerVerifyOtpPanel defaultEmail={otpEmail} />
      </div>
    </div>
  );
}
