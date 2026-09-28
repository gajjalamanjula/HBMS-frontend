import { useQuery } from '@tanstack/react-query';
import { superAdminKeys } from '../../../lib/query/queryKeys';
import { superadminApi } from '../api/superadminApi';

export function useSuperAdminBranches() {
  return useQuery({
    queryKey: superAdminKeys.branches(),
    queryFn: superadminApi.getBranches,
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
