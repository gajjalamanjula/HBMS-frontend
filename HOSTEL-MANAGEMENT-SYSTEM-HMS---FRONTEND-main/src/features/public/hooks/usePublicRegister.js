import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import publicApi from '../api/public.api';

export function usePublicRegister() {
  return useMutation({
    mutationFn: publicApi.publicRegister,
    onSuccess: (result) => {
      toast.success(result?.message || 'Registration successful');
    },
    onError: (error) => {
      toast.error(error?.message || 'Registration failed');
    },
  });
}
