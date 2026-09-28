import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { superAdminKeys } from '../../../lib/query/queryKeys';
import { superadminApi } from '../api/superadminApi';
import { useUpdateUserStatusMutation } from './useSuperAdminDashboard';

const cleanUserFilters = (filters = {}) => ({
  page: Number(filters.page ?? 0),
  size: Number(filters.size ?? 10),
  role: filters.role || undefined,
  active: filters.active,
  search: String(filters.search || '').trim() || undefined,
  sortBy: filters.sortBy || 'createdAt',
  direction: filters.direction || 'desc',
});

export function useSuperAdminUsers(filters = {}, options = {}) {
  const queryFilters = cleanUserFilters(filters);
  const searchText = queryFilters.search || '';

  return useQuery({
    queryKey: superAdminKeys.users(queryFilters),
    queryFn: () => superadminApi.getUsers(queryFilters),
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
    enabled: (searchText.length === 0 || searchText.length >= 2) && (options.enabled ?? true),
  });
}

export function useSuperAdminUserStatus() {
  return useUpdateUserStatusMutation();
}
