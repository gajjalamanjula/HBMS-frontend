import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { managerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import managerApi from '../api/manager.api';

export function useManagerRooms() {
  return useQuery({
    queryKey: managerKeys.rooms(),
    queryFn: managerApi.getManagerRooms,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useManagerGenericRooms() {
  return useQuery({
    queryKey: managerKeys.genericRooms(),
    queryFn: managerApi.getRooms,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateManagerRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: managerApi.createManagerRoom,
    onSuccess: (result) => {
      toast.success(result?.message || 'Room created successfully');

      queryClient.invalidateQueries({ queryKey: managerKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: managerKeys.genericRooms() });
      queryClient.invalidateQueries({ queryKey: managerKeys.availableBeds() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: managerKeys.bedStats() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to create room'),
  });
}

export function useCreateManagerRoomWithImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values) => {
      return managerApi.createRoom(values);
    },
    onSuccess: (result) => {
      toast.success(result?.message || 'Room created successfully');

      queryClient.invalidateQueries({ queryKey: managerKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: managerKeys.genericRooms() });
      queryClient.invalidateQueries({ queryKey: managerKeys.availableBeds() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: managerKeys.bedStats() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to create room'),
  });
}

export function useUpdateManagerBedStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => managerApi.updateManagerBedStatus(id, status),
    onSuccess: (result) => {
      toast.success(result?.message || 'Bed status updated successfully');

      queryClient.invalidateQueries({ queryKey: managerKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: managerKeys.genericRooms() });
      queryClient.invalidateQueries({ queryKey: managerKeys.availableBeds() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: managerKeys.bedStats() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to update bed status'),
  });
}

export default useManagerRooms;