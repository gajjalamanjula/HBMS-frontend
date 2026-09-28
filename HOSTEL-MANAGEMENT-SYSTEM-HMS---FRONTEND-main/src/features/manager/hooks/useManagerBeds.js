import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { managerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import managerApi from '../api/manager.api';

export function useManagerAvailableBeds() {
  return useQuery({
    queryKey: managerKeys.availableBeds(),
    queryFn: managerApi.getAvailableBeds,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useManagerBedStats() {
  return useQuery({
    queryKey: managerKeys.bedStats(),
    queryFn: managerApi.getBedStats,
    staleTime: queryStaleTime.dashboard,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAssignManagerBed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: managerApi.assignBed,
    onSuccess: (result) => {
      toast.success(result?.message || 'Bed assigned successfully');
      queryClient.invalidateQueries({ queryKey: managerKeys.availableBeds() });
      queryClient.invalidateQueries({ queryKey: managerKeys.bedStats() });
      queryClient.invalidateQueries({ queryKey: managerKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: managerKeys.tenants() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to assign bed'),
  });
}

export function useUpdateManagerGenericBedStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => managerApi.updateBedStatus(id, status),
    onSuccess: (result) => {
      toast.success(result?.message || 'Bed status updated successfully');
      queryClient.invalidateQueries({ queryKey: managerKeys.availableBeds() });
      queryClient.invalidateQueries({ queryKey: managerKeys.bedStats() });
      queryClient.invalidateQueries({ queryKey: managerKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to update bed status'),
  });
}

export default useManagerAvailableBeds;
