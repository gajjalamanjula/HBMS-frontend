import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { managerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import managerApi from '../api/manager.api';

export function useManagerCurrentFoodMenu() {
  return useQuery({
    queryKey: managerKeys.foodMenuCurrent(),
    queryFn: managerApi.getCurrentFoodMenu,
    staleTime: queryStaleTime.detail,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useManagerFoodMenuHistory() {
  return useQuery({
    queryKey: managerKeys.foodMenuHistory(),
    queryFn: managerApi.getFoodMenuHistory,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUploadManagerFoodMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: managerApi.uploadFoodMenu,
    onSuccess: (result) => {
      toast.success(result?.message || 'Food menu uploaded successfully');
      queryClient.invalidateQueries({ queryKey: managerKeys.foodMenuCurrent() });
      queryClient.invalidateQueries({ queryKey: managerKeys.foodMenuHistory() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to upload food menu'),
  });
}

export function useDeleteManagerFoodMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: managerApi.deleteFoodMenu,
    onSuccess: (result) => {
      toast.success(result?.message || 'Food menu deleted successfully');
      queryClient.invalidateQueries({ queryKey: managerKeys.foodMenuCurrent() });
      queryClient.invalidateQueries({ queryKey: managerKeys.foodMenuHistory() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to delete food menu'),
  });
}

export default useManagerCurrentFoodMenu;
