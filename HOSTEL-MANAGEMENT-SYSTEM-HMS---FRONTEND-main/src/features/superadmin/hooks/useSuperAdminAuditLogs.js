import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { superAdminKeys } from '../../../lib/query/queryKeys';
import { superadminApi } from '../api/superadminApi';

const cleanAuditFilters = (filters = {}) => ({
  page: Number(filters.page ?? 0),
  size: Number(filters.size ?? 10),
  action: String(filters.action || '').trim() || undefined,
});

export function useSuperAdminAuditLogs(filters = {}, options = {}) {
  const queryFilters = cleanAuditFilters(filters);

  return useQuery({
    queryKey: superAdminKeys.auditLogs(queryFilters),
    queryFn: () => superadminApi.getAuditLogs(queryFilters),
    staleTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled: options.enabled ?? true,
  });
}
