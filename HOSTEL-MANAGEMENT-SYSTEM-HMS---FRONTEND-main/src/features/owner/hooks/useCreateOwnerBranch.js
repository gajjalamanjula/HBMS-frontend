import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ownerKeys } from '../../../lib/query/queryKeys';
import ownerApi from '../api/owner.api';

export function useCreateOwnerBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ownerApi.createOwnerBranch,
    onSuccess: async (result) => {
      toast.success(result?.message || 'Branch created successfully');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ownerKeys.branches() }),
        queryClient.invalidateQueries({ queryKey: ownerKeys.dashboard(), refetchType: 'none' }),
        queryClient.invalidateQueries({ queryKey: ownerKeys.bedSummary(), refetchType: 'none' }),
      ]);
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create branch');
    },
  });
}

export default useCreateOwnerBranch;
