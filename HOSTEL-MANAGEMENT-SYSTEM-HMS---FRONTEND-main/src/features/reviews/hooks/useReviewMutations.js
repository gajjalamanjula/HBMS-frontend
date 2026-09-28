import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '../../../lib/query/queryKeys';
import reviewsApi from '../api/reviews.api';

function branchReviewsKey(branchId) {
  return queryKeys.reviews.byBranch(branchId);
}

export function useAddReview(branchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewsApi.addReview,
    onSuccess: () => {
      toast.success('Review added successfully');
      queryClient.invalidateQueries({
        queryKey: branchReviewsKey(branchId),
      });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to add review');
    },
  });
}

export function useUpdateReview(branchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => reviewsApi.updateReview(id, data),
    onSuccess: () => {
      toast.success('Review updated successfully');
      queryClient.invalidateQueries({
        queryKey: branchReviewsKey(branchId),
      });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update review');
    },
  });
}

export function useDeleteReview(branchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reviewsApi.deleteReview,
    onSuccess: () => {
      toast.success('Review deleted successfully');
      queryClient.invalidateQueries({
        queryKey: branchReviewsKey(branchId),
      });
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete review');
    },
  });
}
