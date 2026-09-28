import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ownerKeys } from '../../../lib/query/queryKeys';
import ownerApi from '../api/owner.api';

export function useVerifyOwnerOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ownerApi.verifyOwnerOtp,
    onSuccess: async (result) => {
      toast.success(result?.message || 'OTP verified successfully');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ownerKeys.managers() }),
        queryClient.invalidateQueries({ queryKey: ownerKeys.dashboard() }),
        queryClient.invalidateQueries({ queryKey: ownerKeys.staffCount() }),
        queryClient.invalidateQueries({ queryKey: ownerKeys.tenantsCount() }),
      ]);
    },
    onError: (error) => {
      toast.error(error?.message || 'OTP verification failed');
    },
  });
}
