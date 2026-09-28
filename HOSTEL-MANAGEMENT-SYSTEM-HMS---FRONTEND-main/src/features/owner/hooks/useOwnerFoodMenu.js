import { useQuery } from '@tanstack/react-query';

import { ownerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime, withIdQuery } from '../../../lib/query/queryOptions';
import ownerApi from '../api/owner.api';

export function useOwnerCurrentFoodMenu(branchId) {
  return useQuery({
    queryKey: ownerKeys.currentFoodMenu(branchId),
    queryFn: () => ownerApi.getOwnerCurrentFoodMenu(branchId),
    staleTime: queryStaleTime.detail,
    retry: 1,
    refetchOnWindowFocus: false,
    ...withIdQuery(branchId),
  });
}

export function useOwnerFoodMenuHistory(branchId) {
  return useQuery({
    queryKey: ownerKeys.foodMenuHistory(branchId),
    queryFn: () => ownerApi.getOwnerFoodMenuHistory(branchId),
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
    ...withIdQuery(branchId),
  });
}
