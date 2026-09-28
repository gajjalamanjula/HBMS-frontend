import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ownerKeys } from '../../../lib/query/queryKeys';
import ownerApi from '../api/owner.api';

export function useCreateManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ownerApi.createManager,
    onSuccess: async (result) => {
      toast.success(result?.message || 'Manager created successfully');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ownerKeys.managers() }),
        queryClient.invalidateQueries({ queryKey: ownerKeys.dashboard() }),
      ]);
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create manager');
    },
  });
}
