import { useQuery } from '@tanstack/react-query';

import { managerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import managerApi from '../api/manager.api';

export function useManagerCounts() {
  return useQuery({
    queryKey: managerKeys.counts(),
    queryFn: managerApi.getManagerCounts,
    staleTime: queryStaleTime.dashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export default useManagerCounts;
