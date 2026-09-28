import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { managerKeys, ownerKeys, queryKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import { bedsApi } from '../api/beds.api';

export function useAvailableBeds() {
  return useQuery({
    queryKey: queryKeys.beds.available('current-user'),
    queryFn: () => bedsApi.getAvailable(),
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAllBeds() {
  return useQuery({
    queryKey: queryKeys.beds.all('current-user'),
    queryFn: () => bedsApi.getAll(),
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useBedStats() {
  return useQuery({
    queryKey: queryKeys.beds.stats('current-user'),
    queryFn: () => bedsApi.getStats(),
    staleTime: queryStaleTime.dashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

function invalidateBedOperations(queryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.beds.available('current-user') }),
    queryClient.invalidateQueries({ queryKey: queryKeys.beds.all('current-user') }),
    queryClient.invalidateQueries({ queryKey: queryKeys.beds.stats('current-user'), refetchType: 'none' }),
    queryClient.invalidateQueries({ queryKey: queryKeys.rooms.root, refetchType: 'none' }),
    queryClient.invalidateQueries({ queryKey: managerKeys.availableBeds() }),
    queryClient.invalidateQueries({ queryKey: managerKeys.beds() }),
    queryClient.invalidateQueries({ queryKey: managerKeys.rooms(), refetchType: 'none' }),
    queryClient.invalidateQueries({ queryKey: managerKeys.tenants(), refetchType: 'none' }),
    queryClient.invalidateQueries({ queryKey: managerKeys.bedStats(), refetchType: 'none' }),
    queryClient.invalidateQueries({ queryKey: managerKeys.dashboard(), refetchType: 'none' }),
    queryClient.invalidateQueries({ queryKey: ownerKeys.bedSummary(), refetchType: 'none' }),
  ]);
}

export function useAssignBed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bedsApi.assign,
    onSuccess: async () => {
      toast.success('Bed assigned successfully');
      await invalidateBedOperations(queryClient);
    },
    onError: (error) => toast.error(error?.message || 'Failed to assign bed'),
  });
}

export function useUpdateBedStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => bedsApi.updateStatus(id, payload),
    onSuccess: async () => {
      toast.success('Bed status updated successfully');
      await invalidateBedOperations(queryClient);
    },
    onError: (error) => toast.error(error?.message || 'Failed to update bed status'),
  });
}
