import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { branchesApi } from '../api/branches.api';

const cleanParams = (params = {}) => ({
  search: String(params.search || '').trim() || undefined,
  page: params.page,
  size: params.size,
  city: params.city || undefined,
  area: params.area || undefined,
});

export const branchKeys = {
  all: ['branches'],
  list: (params = {}) => [...branchKeys.all, 'list', cleanParams(params)],
  detail: (branchId) => [...branchKeys.all, 'detail', branchId],
};

export function useBranches(params = {}, options = {}) {
  const queryParams = cleanParams(params);
  const searchText = queryParams.search || '';
  const shouldSearch = searchText.length === 0 || searchText.length >= 2;

  return useQuery({
    queryKey: branchKeys.list(queryParams),
    queryFn: () => branchesApi.getAll(queryParams),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData,
    enabled: shouldSearch && (options.enabled ?? true),
  });
}

export function useBranchDetail(branchId) {
  return useQuery({
    queryKey: branchKeys.detail(branchId),
    queryFn: () => branchesApi.getById(branchId),
    enabled: Boolean(branchId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: branchesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.all });
    },
  });
}
