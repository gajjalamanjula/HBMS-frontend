import { useQuery } from '@tanstack/react-query';
import tenantApi from '../api/tenant.api';
import { authApi } from '../../auth/api/auth.api';
import paymentsApi from '../../payments/api/payments.api';
import complaintsApi from '../../complaints/api/complaints.api';
import foodMenuApi from '../../foodMenu/api/foodMenu.api';
import { normalizeTenantDashboard } from '../utils/tenantMappers';

export const tenantDashboardKeys = {
  all: ['tenant'],
  dashboard: () => [...tenantDashboardKeys.all, 'dashboard'],
};

const safeCall = async (key, fn) => {
  try {
    const data = await fn();

    return {
      key,
      ok: true,
      data,
      error: '',
    };
  } catch (error) {
    return {
      key,
      ok: false,
      data: null,
      error: error?.message || 'Request failed',
    };
  }
};

export async function getTenantDashboardData() {
  const meResult = await safeCall('me', authApi.me);
  const me = meResult.data || {};

  const tenantId = me.id || me.userId || me.tenantId || '';

  const [paymentsResult, complaintsResult, kycResult, foodMenuResult] = await Promise.all(
    [
      safeCall('payments', () => paymentsApi.getTenantPayments(tenantId)),
      safeCall('complaints', complaintsApi.getAll),
      safeCall('kyc', () => tenantApi.getKyc(tenantId)),
      safeCall('foodMenu', foodMenuApi.getCurrent),
    ]
  );

  return normalizeTenantDashboard({
    me: meResult,
    payments: paymentsResult,
    complaints: complaintsResult,
    kyc: kycResult,
    foodMenu: foodMenuResult,
  });
}

export function useTenantDashboard() {
  return useQuery({
    queryKey: tenantDashboardKeys.dashboard(),
    queryFn: getTenantDashboardData,
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export default useTenantDashboard;
