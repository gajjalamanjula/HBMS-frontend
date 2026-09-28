import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../auth/api/auth.api';
import staffApi from '../api/staff.api';
import {
  countByStatus,
  filterAssignedStaffComplaints,
  normalizeStaffFoodMenu,
  normalizeStaffKyc,
  normalizeStaffUser,
} from '../mappers/staffMappers';

export const staffDashboardKeys = {
  all: ['staff'],
  dashboard: () => [...staffDashboardKeys.all, 'dashboard'],
};

const safeCall = async (key, fn) => {
  try {
    const data = await fn();
    return { key, ok: true, data, error: '' };
  } catch (error) {
    return { key, ok: false, data: null, error: error?.message || 'Request failed' };
  }
};

export async function getStaffDashboardData() {
  const meResult = await safeCall('me', authApi.me);
  const user = normalizeStaffUser(meResult.data || {});

  const [complaintsResult, foodMenuResult, kycResult] = await Promise.all([
    safeCall('complaints', staffApi.getAssignedComplaints),
    safeCall('foodMenu', staffApi.getCurrentFoodMenu),
    safeCall('kyc', () => staffApi.getKyc(user.id)),
  ]);

  const complaintResult = complaintsResult.ok ? complaintsResult.data || {} : {};
  const complaintRows = complaintResult.rows || [];
  const assignedComplaints = complaintResult.scoped
    ? complaintRows
    : filterAssignedStaffComplaints(complaintRows, user.id);
  const branchQueueCount = Number(complaintResult.branchQueueCount || assignedComplaints.length);
  const statusCounts = countByStatus(assignedComplaints);
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const isToday = (value) => {
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}` === todayKey;
  };
  const isResolvedThisWeek = (complaint) => {
    if (!['RESOLVED', 'CLOSED'].includes(complaint.status)) return false;
    const date = new Date(complaint.resolvedAt || complaint.updatedAt);
    return !Number.isNaN(date.getTime()) && date >= startOfWeek && date <= now;
  };
  const foodMenu = foodMenuResult.ok ? normalizeStaffFoodMenu(foodMenuResult.data || {}) : null;
  const kyc = kycResult.ok ? normalizeStaffKyc(kycResult.data || {}, user) : { status: 'NOT_UPLOADED' };

  return {
    user,
    branchComplaints: assignedComplaints,
    assignedComplaints,
    recentAssignedComplaints: assignedComplaints.slice(0, 4),
    foodMenu,
    kyc,
    stats: {
      branchComplaints: branchQueueCount,
      assignedComplaints: assignedComplaints.length,
      todayAssigned: assignedComplaints.filter((complaint) => isToday(complaint.createdAt)).length,
      openAssigned: assignedComplaints.filter((complaint) => ['OPEN', 'IN_PROGRESS', 'ESCALATED'].includes(complaint.status)).length,
      resolvedAssigned: assignedComplaints.filter((complaint) => ['RESOLVED', 'CLOSED'].includes(complaint.status)).length,
      resolvedThisWeek: assignedComplaints.filter(isResolvedThisWeek).length,
      currentMenuAvailable: Boolean(foodMenu?.hasData),
      kycStatus: kyc.status || 'NOT_UPLOADED',
    },
    charts: {
      status: Object.entries(statusCounts).map(([name, value]) => ({ name, value })),
    },
    errors: {
      me: meResult.error,
      complaints: complaintsResult.error,
      foodMenu: foodMenuResult.error,
      kyc: kycResult.error,
    },
  };
}

export function useStaffDashboard() {
  return useQuery({
    queryKey: staffDashboardKeys.dashboard(),
    queryFn: getStaffDashboardData,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export default useStaffDashboard;
