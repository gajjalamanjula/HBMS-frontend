import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { superAdminKeys } from '../../../lib/query/queryKeys';
import { superadminApi } from '../api/superadminApi';
import { getRoleMix } from '../utils/superAdminMappers';

const dashboardUsersParams = {
  page: 0,
  size: 6,
  sortBy: 'createdAt',
  direction: 'desc',
};

const dashboardAuditParams = {
  page: 0,
  size: 6,
};

const queryOptions = {
  staleTime: 1000 * 60 * 2,
  retry: 1,
  refetchOnWindowFocus: false,
};

const getErrorMessage = (error, fallback) => error?.message || fallback;

export const superAdminDashboardKeys = superAdminKeys;

export function useSuperAdminDashboard() {
  const dashboardQuery = useQuery({
    queryKey: superAdminKeys.dashboard(),
    queryFn: superadminApi.getDashboard,
    ...queryOptions,
  });

  const ownersQuery = useQuery({
    queryKey: superAdminKeys.owners(),
    queryFn: superadminApi.getOwners,
    ...queryOptions,
  });

  const usersQuery = useQuery({
    queryKey: superAdminKeys.users(dashboardUsersParams),
    queryFn: () => superadminApi.getUsers(dashboardUsersParams),
    ...queryOptions,
  });

  const branchesQuery = useQuery({
    queryKey: superAdminKeys.branches(),
    queryFn: superadminApi.getBranches,
    ...queryOptions,
  });

  const healthQuery = useQuery({
    queryKey: superAdminKeys.health(),
    queryFn: superadminApi.getHealth,
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const auditLogsQuery = useQuery({
    queryKey: superAdminKeys.auditLogs(dashboardAuditParams),
    queryFn: () => superadminApi.getAuditLogs(dashboardAuditParams),
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const users = usersQuery.data?.content || [];

  return {
    stats: dashboardQuery.data || {
      totalUsers: 0,
      totalOwners: 0,
      totalManagers: 0,
      totalStaff: 0,
      totalTenants: 0,
      totalBranches: 0,
    },
    owners: ownersQuery.data || [],
    users,
    usersPage: usersQuery.data,
    roleMix: getRoleMix(users),
    branches: branchesQuery.data || [],
    health: healthQuery.data || null,
    auditLogs: auditLogsQuery.data?.content || [],
    auditPage: auditLogsQuery.data,
    queries: {
      dashboard: dashboardQuery,
      owners: ownersQuery,
      users: usersQuery,
      branches: branchesQuery,
      health: healthQuery,
      auditLogs: auditLogsQuery,
    },
    refetchAll: () => {
      dashboardQuery.refetch();
      ownersQuery.refetch();
      usersQuery.refetch();
      branchesQuery.refetch();
      healthQuery.refetch();
      auditLogsQuery.refetch();
    },
  };
}

export function updateUserStatusInPageData(pageData, id, active) {
  if (!pageData?.content || !id) return pageData;

  return {
    ...pageData,
    content: pageData.content.map((user) => (
      String(user.id || '') === String(id || '') ? { ...user, active: Boolean(active) } : user
    )),
  };
}

export function updateUserStatusInListData(listData, id, active) {
  if (!Array.isArray(listData) || !id) return listData;

  return listData.map((user) => (
    String(user.id || '') === String(id || '') ? { ...user, active: Boolean(active) } : user
  ));
}

function invalidateTargetedSuperAdminQueries(queryClient, keys) {
  return Promise.all(
    keys.map((queryKey) => queryClient.invalidateQueries({ queryKey, refetchType: 'active' }))
  );
}

const ownerMutationKeys = [
  superAdminKeys.owners(),
  superAdminKeys.dashboard(),
  ['super-admin', 'audit-logs'],
];

export function useCreateOwnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: superadminApi.createOwner,
    onSuccess: async (result) => {
      toast.success(result?.name ? `Owner ${result.name} created successfully` : result?.message || 'Owner created successfully');
      await invalidateTargetedSuperAdminQueries(queryClient, ownerMutationKeys);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Owner creation failed'));
    },
  });
}

export function useVerifyOwnerOtpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: superadminApi.verifyOwnerOtp,
    onSuccess: async (result) => {
      toast.success(result?.email ? `Owner OTP verified for ${result.email}` : result?.message || 'Owner OTP verified successfully');
      await invalidateTargetedSuperAdminQueries(queryClient, ownerMutationKeys);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Owner OTP verification failed'));
    },
  });
}

export function useUpdateOwnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: superadminApi.updateOwner,
    onSuccess: async (result) => {
      toast.success(result?.name ? `Owner ${result.name} updated successfully` : result?.message || 'Owner updated successfully');
      await invalidateTargetedSuperAdminQueries(queryClient, ownerMutationKeys);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Owner update failed'));
    },
  });
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: superadminApi.updateUserStatus,
    onSuccess: async (result, variables = {}) => {
      const id = result?.id || variables.id;
      const active = result?.active ?? variables.active;

      toast.success(active ? 'User activated successfully' : 'User disabled successfully');

      queryClient.setQueriesData(
        { queryKey: ['super-admin', 'users'] },
        (pageData) => updateUserStatusInPageData(pageData, id, active)
      );

      if (variables.invalidateOwners) {
        queryClient.setQueryData(superAdminKeys.owners(), (owners) => updateUserStatusInListData(owners, id, active));
      }

      await invalidateTargetedSuperAdminQueries(queryClient, [
        superAdminKeys.dashboard(),
        ['super-admin', 'audit-logs'],
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'User status update failed'));
    },
  });
}

export function useSuperAdminDashboardMutations() {
  return {
    createOwnerMutation: useCreateOwnerMutation(),
    verifyOwnerOtpMutation: useVerifyOwnerOtpMutation(),
    updateOwnerMutation: useUpdateOwnerMutation(),
    updateUserStatusMutation: useUpdateUserStatusMutation(),
  };
}
