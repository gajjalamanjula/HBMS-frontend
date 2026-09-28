import { useQuery } from '@tanstack/react-query';

import { ownerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import ownerApi from '../api/owner.api';

export function useOwnerRevenue({ enabled = false } = {}) {
  return useQuery({
    queryKey: ownerKeys.revenue(),
    queryFn: ownerApi.getOwnerRevenue,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
    meta: {
      limitedDataWarning:
        'Owner revenue aggregation is limited. Do not present unavailable totals as production analytics.',
    },
  });
}
