import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import staffApi from '../api/staff.api';

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

export function useStaffChangePassword() {
  return useMutation({
    mutationFn: staffApi.changePassword,
    onSuccess: (result) => {
      toast.success(result?.message || 'Password updated successfully');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update password'));
    },
  });
}

export default useStaffChangePassword;
