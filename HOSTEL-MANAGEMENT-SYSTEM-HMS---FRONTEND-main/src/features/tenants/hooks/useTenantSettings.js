import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import tenantApi from '../api/tenant.api';

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export function useTenantChangePassword() {
  return useMutation({
    mutationFn: tenantApi.changePassword,

    onSuccess: (result) => {
      toast.success(result?.message || 'Password updated successfully');
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update password'));
    },
  });
}

export default useTenantChangePassword;
