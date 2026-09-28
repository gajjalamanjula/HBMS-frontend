import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ownerKeys } from '../../../lib/query/queryKeys';
import ownerApi from '../api/owner.api';

export function useCreateOwnerStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ownerApi.createOwnerStaff,
    onSuccess: async (result) => {
      toast.success(result?.message || 'Staff created successfully');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ownerKeys.dashboard() }),
        queryClient.invalidateQueries({ queryKey: ownerKeys.staffCount() }),
      ]);
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create staff');
    },
  });
}
