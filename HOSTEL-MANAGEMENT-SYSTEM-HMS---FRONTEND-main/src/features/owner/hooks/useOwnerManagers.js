import { useQuery } from '@tanstack/react-query';

import { ownerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import ownerApi from '../api/owner.api';

export function useOwnerManagers() {
  const managersQuery = useQuery({
    queryKey: ownerKeys.managers(),
    queryFn: ownerApi.getOwnerManagers,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    managers: managersQuery.data || [],
    isLoading: managersQuery.isLoading,
    isFetching: managersQuery.isFetching,
    isError: managersQuery.isError,
    errorMessage: managersQuery.error?.message || '',
    refetchManagers: managersQuery.refetch,
    query: managersQuery,
  };
}
