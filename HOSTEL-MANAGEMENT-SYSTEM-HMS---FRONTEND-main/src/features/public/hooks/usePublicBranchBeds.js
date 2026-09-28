import { useQuery } from '@tanstack/react-query';

import publicApi from '../api/public.api';
import { queryKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime, withIdQuery } from '../../../lib/query/queryOptions';

const retryRecoverablePublicError = (failureCount, error) => ![401, 403, 404].includes(error?.status) && failureCount < 1;

export function usePublicBranchBeds(branchId) {
  const bedsQuery = useQuery({
    queryKey: queryKeys.public.branchBeds(branchId),
    queryFn: () => publicApi.getPublicBranchBeds(branchId),
    staleTime: queryStaleTime.list,
    gcTime: 1000 * 60 * 10,
    retry: retryRecoverablePublicError,
    ...withIdQuery(branchId),
  });

  return {
    beds: bedsQuery.data || [],
    isLoading: bedsQuery.isLoading,
    isFetching: bedsQuery.isFetching,
    isError: bedsQuery.isError,
    errorMessage: bedsQuery.error?.message || '',
    refetchBeds: bedsQuery.refetch,
    query: bedsQuery,
  };
}
