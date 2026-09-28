import { useQuery } from '@tanstack/react-query';

import publicApi from '../api/public.api';
import { queryKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';

export function usePublicBranches() {
  const branchesQuery = useQuery({
    queryKey: queryKeys.public.branches,
    queryFn: publicApi.getPublicBranches,
    staleTime: queryStaleTime.branchList,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
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
