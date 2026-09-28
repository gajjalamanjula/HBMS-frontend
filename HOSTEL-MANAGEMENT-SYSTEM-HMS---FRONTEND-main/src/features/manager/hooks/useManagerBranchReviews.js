import { useQuery } from '@tanstack/react-query';
import { httpClient } from '../../../lib/axios/apiClient';

function unwrapReviewRows(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export function useManagerBranchReviews(branchId) {
  return useQuery({
    queryKey: ['manager-branch-reviews', branchId],
    enabled: Boolean(branchId),
    queryFn: async () => {
      const response = await httpClient.get(`/reviews/branch/${branchId}`);
      return unwrapReviewRows(response.data);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: (failureCount, error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return failureCount < 1;
    },
  });
}

export default useManagerBranchReviews;
