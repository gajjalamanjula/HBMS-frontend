import { useQuery } from '@tanstack/react-query';

import { managerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import managerApi from '../api/manager.api';
import { useManagerCounts } from './useManagerCounts';

export function useManagerDashboard() {
  const dashboardQuery = useQuery({
    queryKey: managerKeys.dashboard(),
    queryFn: managerApi.getManagerDashboard,
    staleTime: queryStaleTime.dashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const countsQuery = useManagerCounts();
  const queries = {
    dashboard: dashboardQuery,
    counts: countsQuery,
  };

  return {
    dashboard: dashboardQuery.data || null,
    counts: countsQuery.data || null,
    queries,
    isLoading: dashboardQuery.isLoading || countsQuery.isLoading,
    isFetching: dashboardQuery.isFetching || countsQuery.isFetching,
    isError: dashboardQuery.isError || countsQuery.isError,
    errorMessage: dashboardQuery.error?.message || countsQuery.error?.message || '',
    refetch: () => {
      dashboardQuery.refetch();
      countsQuery.refetch();
    },
  };
}

export default useManagerDashboard;
