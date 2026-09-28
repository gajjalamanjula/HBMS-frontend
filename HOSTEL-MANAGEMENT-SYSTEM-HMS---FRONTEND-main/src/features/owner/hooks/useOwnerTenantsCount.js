import { useQuery } from '@tanstack/react-query';

import { ownerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import ownerApi from '../api/owner.api';

export function useOwnerTenantsCount() {
  return useQuery({
    queryKey: ownerKeys.tenantsCount(),
    queryFn: ownerApi.getOwnerTenantsCount,
    staleTime: queryStaleTime.dashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
