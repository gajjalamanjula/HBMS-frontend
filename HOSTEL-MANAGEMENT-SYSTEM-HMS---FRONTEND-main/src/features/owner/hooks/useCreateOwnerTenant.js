import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ownerKeys } from '../../../lib/query/queryKeys';
import ownerApi from '../api/owner.api';

export function useCreateOwnerTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ownerApi.createOwnerTenant,
    onSuccess: async (result) => {
      toast.success(result?.message || 'Tenant created successfully');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ownerKeys.dashboard() }),
        queryClient.invalidateQueries({ queryKey: ownerKeys.tenantsCount() }),
        queryClient.invalidateQueries({ queryKey: ownerKeys.bedSummary() }),
      ]);
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create tenant');
    },
  });
}
