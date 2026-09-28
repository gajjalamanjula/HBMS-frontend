import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { managerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import managerApi from '../api/manager.api';

export function useManagerStaff() {
  return useQuery({
    queryKey: managerKeys.staff(),
    queryFn: managerApi.getManagerStaff,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: managerApi.createStaff,
    onSuccess: (result) => {
      toast.success(result?.message || 'Staff created successfully');
      queryClient.invalidateQueries({ queryKey: managerKeys.staff() });
      queryClient.invalidateQueries({ queryKey: managerKeys.counts() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: managerKeys.complaints() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to create staff'),
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => managerApi.updateStaff(id, values),
    onSuccess: (result) => {
      toast.success(result?.message || 'Staff updated successfully');
      queryClient.invalidateQueries({ queryKey: managerKeys.staff() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to update staff'),
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => managerApi.deleteStaff(id),
    onSuccess: (result) => {
      toast.success(result?.message || 'Staff deactivated successfully');
      queryClient.invalidateQueries({ queryKey: managerKeys.staff() });
      queryClient.invalidateQueries({ queryKey: managerKeys.counts() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to deactivate staff'),
  });
}

export const useDeactivateManagerStaff = useDeleteStaff;

export default useManagerStaff;
