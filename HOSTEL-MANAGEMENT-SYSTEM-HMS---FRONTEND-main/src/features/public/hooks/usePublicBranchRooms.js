import { useQuery } from '@tanstack/react-query';

import publicApi from '../api/public.api';
import { queryKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime, withIdQuery } from '../../../lib/query/queryOptions';

const retryRecoverablePublicError = (failureCount, error) => ![401, 403, 404].includes(error?.status) && failureCount < 1;

export function usePublicBranchRooms(branchId) {
  const roomsQuery = useQuery({
    queryKey: queryKeys.public.branchRooms(branchId),
    queryFn: () => publicApi.getPublicBranchRooms(branchId),
    staleTime: queryStaleTime.list,
    gcTime: 1000 * 60 * 10,
    retry: retryRecoverablePublicError,
    ...withIdQuery(branchId),
  });

  return {
    rooms: roomsQuery.data || [],
    isLoading: roomsQuery.isLoading,
    isFetching: roomsQuery.isFetching,
    isError: roomsQuery.isError,
    errorMessage: roomsQuery.error?.message || '',
    refetchRooms: roomsQuery.refetch,
    query: roomsQuery,
  };
}
