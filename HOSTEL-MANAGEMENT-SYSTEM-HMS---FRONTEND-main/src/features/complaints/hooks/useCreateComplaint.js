import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys';
import { complaintsApi } from '../api/complaints.api';

export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => complaintsApi.create(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.manager.complaints }),
        queryClient.invalidateQueries({ queryKey: queryKeys.owner.complaints }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tenant.complaints }),
      ]);
    },
  });
}
