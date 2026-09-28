import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ownerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import ownerApi from '../api/owner.api';

export function useOwnerComplaints() {
  const complaintsQuery = useQuery({
    queryKey: ownerKeys.complaints(),
    queryFn: ownerApi.getOwnerComplaints,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    complaints: complaintsQuery.data || [],
    isLoading: complaintsQuery.isLoading,
    isFetching: complaintsQuery.isFetching,
    isError: complaintsQuery.isError,
    errorMessage: complaintsQuery.error?.message || '',
    refetchComplaints: complaintsQuery.refetch,
    query: complaintsQuery,
  };
}

export function useEscalateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ownerApi.escalateOwnerComplaint,
    onSuccess: async (result) => {
      toast.success(result?.message || 'Complaint escalated successfully');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ownerKeys.complaints() }),
        queryClient.invalidateQueries({ queryKey: ownerKeys.dashboard() }),
      ]);
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to escalate complaint');
    },
  });
}

export const useEscalateOwnerComplaint = useEscalateComplaint;
