import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys';
import reviewsApi from '../api/reviews.api';

function retryPublicReviewQuery(failureCount, error) {
  const status = error?.status;
  if ([401, 403, 404].includes(status)) return false;
  return failureCount < 1;
}

export function useBranchReviews(branchId, options = {}) {
  const softFailPublicErrors = Boolean(options.softFailPublicErrors);

  const query = useQuery({
    queryKey: [...queryKeys.reviews.byBranch(branchId), softFailPublicErrors ? 'soft-public' : 'strict'],
    queryFn: () =>
      reviewsApi.getByBranch(branchId, {
        softFailPublicErrors,
      }),
    enabled: Boolean(branchId),
    staleTime: 1000 * 60 * 2,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    retry: retryPublicReviewQuery,
  });

  return {
    reviews: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    errorStatus: query.error?.status,
    errorMessage: query.error?.message || 'Unable to load reviews',
    refetchReviews: query.refetch,
  };
}
