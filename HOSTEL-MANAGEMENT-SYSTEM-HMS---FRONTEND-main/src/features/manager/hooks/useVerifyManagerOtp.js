import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { managerKeys } from '../../../lib/query/queryKeys';
import managerApi from '../api/manager.api';

export function useVerifyManagerOtp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: managerApi.verifyManagerOtp,
    onSuccess: (result) => {
      toast.success(result?.message || 'OTP verified successfully');
      queryClient.invalidateQueries({ queryKey: managerKeys.staff() });
      queryClient.invalidateQueries({ queryKey: managerKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: managerKeys.counts() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to verify OTP'),
  });
}

export default useVerifyManagerOtp;
