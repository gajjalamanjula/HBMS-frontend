import { useQuery } from '@tanstack/react-query';

import { ownerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import { useCurrentUser } from '../../auth/hooks/useAuth';
import ownerApi from '../api/owner.api';

export function useOwnerDashboard() {
  const currentUserQuery = useCurrentUser();
  const dashboardQuery = useQuery({
    queryKey: ownerKeys.dashboard(),
    queryFn: ownerApi.getOwnerDashboard,
    staleTime: queryStaleTime.dashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const bedSummaryQuery = useQuery({
    queryKey: ownerKeys.bedSummary(),
    queryFn: ownerApi.getOwnerBedSummary,
    staleTime: queryStaleTime.dashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const staffCountQuery = useQuery({
    queryKey: ownerKeys.staffCount(),
    queryFn: ownerApi.getOwnerStaffCount,
    staleTime: queryStaleTime.dashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const tenantsCountQuery = useQuery({
    queryKey: ownerKeys.tenantsCount(),
    queryFn: ownerApi.getOwnerTenantsCount,
    staleTime: queryStaleTime.dashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const branchesQuery = useQuery({
    queryKey: ownerKeys.branches(),
    queryFn: ownerApi.getOwnerBranches,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const complaintsQuery = useQuery({
    queryKey: ownerKeys.complaints(),
    queryFn: ownerApi.getOwnerComplaints,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const managersQuery = useQuery({
    queryKey: ownerKeys.managers(),
    queryFn: ownerApi.getOwnerManagers,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const queries = {
    me: currentUserQuery,
    dashboard: dashboardQuery,
    bedSummary: bedSummaryQuery,
    staffCount: staffCountQuery,
    tenantsCount: tenantsCountQuery,
    branches: branchesQuery,
    complaints: complaintsQuery,
    managers: managersQuery,
  };
  const queryList = Object.values(queries);

  return {
    me: currentUserQuery.data || null,
    stats: dashboardQuery.data || null,
    bedSummary: bedSummaryQuery.data || null,
    staffCount: staffCountQuery.data ?? null,
    tenantsCount: tenantsCountQuery.data ?? null,
    branches: branchesQuery.data || [],
    complaints: complaintsQuery.data || [],
    managers: managersQuery.data || [],
    queries,
    isAnyLoading: queryList.some((query) => query.isLoading),
    isAnyFetching: queryList.some((query) => query.isFetching),
    isAnyError: queryList.some((query) => query.isError),
    refetchAll: () => {
      dashboardQuery.refetch();
      bedSummaryQuery.refetch();
      staffCountQuery.refetch();
      tenantsCountQuery.refetch();
      branchesQuery.refetch();
      complaintsQuery.refetch();
      managersQuery.refetch();
    },
  };
}

export default useOwnerDashboard;
