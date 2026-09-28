import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { managerKeys, ownerKeys, queryKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import { roomsApi } from '../api/rooms.api';

export function useRooms(branchId) {
  return useQuery({
    queryKey: branchId ? queryKeys.rooms.byBranch(branchId) : queryKeys.rooms.root,
    queryFn: () => (branchId ? roomsApi.getByBranch(branchId) : roomsApi.getAll()),
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: roomsApi.create,
    onSuccess: async (_data, variables = {}) => {
      toast.success('Room created successfully');
      const branchId = variables.branchId || variables.branch?.id || '';
      const invalidations = [
        queryClient.invalidateQueries({ queryKey: queryKeys.rooms.root, refetchType: 'none' }),
        branchId
          ? queryClient.invalidateQueries({ queryKey: queryKeys.rooms.byBranch(branchId), refetchType: 'none' })
          : Promise.resolve(),
        queryClient.invalidateQueries({ queryKey: managerKeys.rooms() }),
        queryClient.invalidateQueries({ queryKey: managerKeys.bedStats(), refetchType: 'none' }),
        queryClient.invalidateQueries({ queryKey: managerKeys.dashboard(), refetchType: 'none' }),
        queryClient.invalidateQueries({ queryKey: ownerKeys.bedSummary(), refetchType: 'none' }),
      ];
      await Promise.all(invalidations);
    },
    onError: (error) => toast.error(error?.message || 'Failed to create room'),
  });
}
