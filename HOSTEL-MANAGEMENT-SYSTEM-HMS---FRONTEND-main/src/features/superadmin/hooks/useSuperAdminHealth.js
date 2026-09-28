import { useQuery } from '@tanstack/react-query';
import { superAdminKeys } from '../../../lib/query/queryKeys';
import { superadminApi } from '../api/superadminApi';

export function useSuperAdminHealth() {
  return useQuery({
    queryKey: superAdminKeys.health(),
    queryFn: superadminApi.getHealth,
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
