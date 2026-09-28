import { useQuery } from '@tanstack/react-query';

import { ownerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime, withIdQuery } from '../../../lib/query/queryOptions';
import ownerApi from '../api/owner.api';

export function useOwnerBranches(options = {}) {
  const branchesQuery = useQuery({
    queryKey: ownerKeys.branches(),
    queryFn: ownerApi.getOwnerBranches,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });

  return {
    branches: branchesQuery.data || [],
    isLoading: branchesQuery.isLoading,
    isFetching: branchesQuery.isFetching,
    isError: branchesQuery.isError,
    errorMessage: branchesQuery.error?.message || '',
    refetchBranches: branchesQuery.refetch,
    query: branchesQuery,
  };
}

export function useOwnerBranchStats(branchId) {
  return useQuery({
    queryKey: ownerKeys.branchStats(branchId),
    queryFn: () => ownerApi.getOwnerBranchStats(branchId),
    staleTime: queryStaleTime.detail,
    retry: 1,
    refetchOnWindowFocus: false,
    ...withIdQuery(branchId),
  });
}
